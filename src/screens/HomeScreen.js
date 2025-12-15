import React, { useState, useEffect, useRef } from 'react'; 
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, AppState, Modal, Vibration, Alert, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addSession } from '../database/db'; 

export default function HomeScreen({ navigation }) {
  const [isActive, setIsActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Kodlama');
  
  // Custom kategori için gerekenler
  const [customCategory, setCustomCategory] = useState('');
  const [tempInput, setTempInput] = useState(''); // Modal içindeki geçici yazı
  const [addModalVisible, setAddModalVisible] = useState(false); // Kategori ekleme modalı

  const DEFAULT_TIME = 25 * 60; 
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [currentDuration, setCurrentDuration] = useState(DEFAULT_TIME); 
  const [distractionCount, setDistractionCount] = useState(0);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  
  const appState = useRef(AppState.currentState);
  
  const categories = ['Ders', 'Kodlama', 'Kitap', 'Proje', 'Spor', 'Meditasyon','Yoga'];

  const isSessionInProgress = isActive || (timeLeft !== currentDuration);

  // Ekranda gosterilecek kategori ismini belirlenir
  const getEffectiveCategoryName = () => {
    if (selectedCategory === 'Custom') {
        return customCategory || 'Özel Kategori';
    }
    return selectedCategory;
  };

  useEffect(() => {
    if (isSessionInProgress) {
        navigation.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
        navigation.setOptions({ tabBarStyle: { display: 'flex' } });
    }
  }, [isSessionInProgress, navigation]);

  const adjustTime = (minutes) => {
    if (isActive) return; 
    const secondsToAdd = minutes * 60;
    if (timeLeft + secondsToAdd < 60) return; 
    const newTime = timeLeft + secondsToAdd;
    setTimeLeft(newTime);
    setCurrentDuration(newTime); 
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if ( nextAppState.match(/inactive|background/) && isActive ) {
        setIsActive(false); 
        setDistractionCount(prev => prev + 1); 
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [isActive]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000); 
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      Vibration.vibrate();
      setSuccessModalVisible(true); 
    } else if (timeLeft === 0) {
        setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(DEFAULT_TIME);      
    setCurrentDuration(DEFAULT_TIME); 
    setDistractionCount(0);
  };

  const changeCategory = (cat) => {
    if (!isSessionInProgress) { 
      setSelectedCategory(cat);
      handleReset();
    }
  };

  // YENİ KATEGORİ EKLEME KISMI
  const handleAddCategory = () => {
    if (tempInput.trim().length > 0) {
        setCustomCategory(tempInput.trim());
        setSelectedCategory('Custom');
        setAddModalVisible(false);
        setTempInput(''); // Temizle
        handleReset();
    } else {
        Alert.alert("Uyarı", "Lütfen bir kategori adı girin.");
    }
  };

  const saveAndFinish = (isEarlyFinish = false) => {
    const durationToSave = isEarlyFinish ? (currentDuration - timeLeft) : currentDuration;
    const status = isEarlyFinish ? "Yarıda Kaldı" : "Tamamlandı";
    const finalCategoryName = getEffectiveCategoryName();

    if (durationToSave < 10) {
        Alert.alert("Hata", "Çok kısa süreli çalışmalar kaydedilemez.");
        handleReset(); 
        return;
    }

    addSession(finalCategoryName, durationToSave, currentDuration, status, distractionCount, () => {
        setSuccessModalVisible(false); 
        handleReset(); 
        Alert.alert("Kaydedildi", `${Math.floor(durationToSave/60)} dakikalık "${finalCategoryName}" seansı eklendi.`);
    });
  };

  const confirmEarlyFinish = () => {
    const spentMinutes = Math.floor((currentDuration - timeLeft) / 60);
    Alert.alert(
        "Seansı Bitir?",
        `Henüz süre dolmadı. Şu ana kadar geçen ${spentMinutes} dakikayı "Yarıda Kaldı" olarak kaydedip bitirmek istiyor musun?`,
        [
            { text: "Vazgeç", style: "cancel" },
            { text: "Evet, Kaydet", onPress: () => saveAndFinish(true) } 
        ]
    );
  };

  const getButtonText = () => {
    if (isActive) return "DURAKLAT ⏸️";
    if (isSessionInProgress) return "DEVAM ET ▶️";
    return "BAŞLAT ▶️";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, isActive && styles.headerActive]}>
        <Text style={[styles.headerTitle, isActive && styles.headerTitleActive]}>
          {isActive ? "Odaklanılıyor..." : "Odaklanma Takibi"}
        </Text>
      </View>

      <View style={styles.content}>
        
        {/* SAYAÇ KARTI */}
        <View style={[styles.timerCard, isSessionInProgress && {borderColor: '#6c5ce7', borderWidth: 2}]}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          
          {!isSessionInProgress && (
            <View style={styles.adjustmentContainer}>
              <TouchableOpacity onPress={() => adjustTime(-5)} style={styles.adjustButton}><Text style={styles.adjustText}>-5</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => adjustTime(-1)} style={styles.adjustButton}><Text style={styles.adjustText}>-1</Text></TouchableOpacity>
              <View style={{width: 20}} /> 
              <TouchableOpacity onPress={() => adjustTime(1)} style={styles.adjustButton}><Text style={styles.adjustText}>+1</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => adjustTime(5)} style={styles.adjustButton}><Text style={styles.adjustText}>+5</Text></TouchableOpacity>
            </View>
          )}

          {!isSessionInProgress && (
              <Text style={styles.activeCategoryText}>{getEffectiveCategoryName()}</Text>
          )}

          {distractionCount > 0 && (
            <View style={styles.distractionBadge}>
              <Text style={styles.distractionText}>⚠️ {distractionCount} Kez Odak Bozuldu!</Text>
            </View>
          )}
        </View>

        {/*KATEGORI SEÇİM ALANI*/}
        {!isSessionInProgress ? (
            <View style={styles.categorySection}>
                <Text style={styles.sectionTitle}>Kategori Seçin:</Text>
                <View style={styles.categoryContainer}>
                    {categories.map((cat) => (
                    <TouchableOpacity 
                        key={cat}
                        onPress={() => changeCategory(cat)}
                        style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipSelected]}
                    >
                        <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextSelected]}>{cat}</Text>
                    </TouchableOpacity>
                    ))}

                    {/* EKLE BUTONU (POPUP ACMAK ICIN) */}
                    <TouchableOpacity 
                        onPress={() => setAddModalVisible(true)}
                        style={[styles.addCategoryBtn, selectedCategory === 'Custom' && styles.addCategoryBtnSelected]}
                    >
                        <Ionicons name="add" size={20} color={selectedCategory === 'Custom' ? '#fff' : '#6c5ce7'} />
                        <Text style={[styles.addCategoryBtnText, selectedCategory === 'Custom' && {color:'#fff'}]}>
                            {selectedCategory === 'Custom' ? 'Özel' : 'Ekle'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        ) : (
            <View style={styles.focusMessageContainer}>
                <Text style={styles.focusLabel}>ŞU AN ODAKLANILAN KATEGORİ</Text>
                <Text style={styles.focusCategoryName}>{getEffectiveCategoryName()}</Text>
                <View style={styles.divider} />
                <View style={{flexDirection:'row', alignItems:'center', marginTop: 10, opacity: 0.6}}>
                    <Ionicons name="eye-off-outline" size={20} color="#636e72" style={{marginRight:5}} />
                    <Text style={styles.focusMessage}>Dikkatin dağılmasın.</Text>
                </View>
            </View>
        )}

        {/* BUTONLAR (En altta sabit) */}
        <View style={styles.actionArea}>
          <TouchableOpacity 
            style={[styles.button, isActive ? styles.buttonStop : styles.buttonStart, timeLeft === 0 && {opacity: 0.5}]}
            disabled={timeLeft === 0}
            onPress={() => setIsActive(!isActive)}
          >
            <Text style={styles.buttonText}>{getButtonText()}</Text>
          </TouchableOpacity>

          {(isSessionInProgress && !isActive && timeLeft > 0) && (
             <View style={{flexDirection:'row', justifyContent:'space-between', width:'100%', marginTop: 15}}>
                <TouchableOpacity onPress={handleReset} style={[styles.halfButton, {backgroundColor: '#b2bec3'}]}>
                    <Text style={styles.halfButtonText}>İptal Et ✖</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={confirmEarlyFinish} style={[styles.halfButton, {backgroundColor: '#2ecc71'}]}>
                    <Text style={styles.halfButtonText}>Bitir ve Kaydet ✔</Text>
                </TouchableOpacity>
             </View>
          )}
        </View>

        {/* SEANS BASARI BASARI MODALI */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={successModalVisible}
          onRequestClose={() => setSuccessModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Ionicons name="trophy" size={50} color="#f1c40f" style={{marginBottom: 10}} />
              <Text style={styles.modalTitle}>Tebrikler! 🎉</Text>
              <Text style={styles.modalSubtitle}>Odaklanma seansı tamamlandı.</Text>
              
              <View style={styles.modalStats}>
                <Text style={styles.modalStatText}>📂 Kategori: <Text style={{fontWeight:'bold'}}>{getEffectiveCategoryName()}</Text></Text>
                <Text style={styles.modalStatText}>⏱️ Süre: <Text style={{fontWeight:'bold'}}>{Math.floor(currentDuration / 60)} dk</Text></Text>
                <Text style={styles.modalStatText}>⚠️ Kesinti: <Text style={{fontWeight:'bold', color: distractionCount > 0 ? '#e74c3c' : '#27ae60'}}>{distractionCount}</Text></Text>
              </View>

              <TouchableOpacity
                style={[styles.button, {marginTop: 20, backgroundColor: '#2ecc71'}]}
                onPress={() => saveAndFinish(false)} 
              >
                <Text style={styles.buttonText}>Kaydet ve Bitir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* YENİ KATEGORİ EKLEME MODALI (POPUP) */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={addModalVisible}
          onRequestClose={() => setAddModalVisible(false)}
        >
          {/* Klavyeyi kapatmak için disari tiklama */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
                <View style={styles.addCategoryModalView}>
                    <Text style={styles.modalTitle}>Yeni Kategori Ekle</Text>
                    <Text style={styles.modalSubtitle}>Çalışacağın alanın adını gir.</Text>

                    <TextInput 
                        style={styles.modalInput}
                        placeholder="Örn: Gitar, Resim, Yemek..."
                        value={tempInput}
                        onChangeText={setTempInput}
                        autoFocus={true} // Açılınca klavye gelsin
                    />

                    <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20}}>
                        <TouchableOpacity 
                            onPress={() => setAddModalVisible(false)} 
                            style={[styles.halfButton, {backgroundColor: '#b2bec3', marginRight: 10}]}
                        >
                            <Text style={styles.halfButtonText}>Vazgeç</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={handleAddCategory} 
                            style={[styles.halfButton, {backgroundColor: '#6c5ce7'}]}
                        >
                            <Text style={styles.halfButtonText}>Ekle</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

//css kismi

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 30 },
    header: { paddingVertical: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center', marginBottom: 20 },
    headerActive: { backgroundColor: '#e3f2fd' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#2d3436' },
    headerTitleActive: { color: '#0984e3' },
    content: { flex: 1, paddingHorizontal: 20, alignItems: 'center' },
    
    timerCard: { backgroundColor: '#fff', width: '100%', paddingVertical: 30, borderRadius: 20, alignItems: 'center', marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: '#f1f2f6' },
    timerText: { fontSize: 72, fontWeight: 'bold', color: '#2d3436', fontVariant: ['tabular-nums'] },
    adjustmentContainer: { flexDirection: 'row', marginBottom: 15, marginTop: 5 },
    adjustButton: { backgroundColor: '#f1f2f6', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, marginHorizontal: 4 },
    adjustText: { fontWeight: 'bold', color: '#636e72' },
    activeCategoryText: { fontSize: 16, color: '#a4b0be', fontWeight: '600', marginTop: 5, letterSpacing: 1, textTransform: 'uppercase' },
    distractionBadge: { marginTop: 15, backgroundColor: '#ff7675', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    distractionText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    
    categorySection: { width: '100%', flex: 1 }, 
    sectionTitle: { fontSize: 14, fontWeight: '600', color: '#636e72', marginBottom: 10, marginLeft: 5 },
    categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
    
    categoryChip: { paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#dfe6e9', marginBottom: 10, minWidth: '22%', alignItems: 'center' },
    categoryChipSelected: { backgroundColor: '#6c5ce7', borderColor: '#6c5ce7' },
    categoryChipText: { fontSize: 13, color: '#636e72', fontWeight: '500' },
    categoryChipTextSelected: { color: '#fff', fontWeight: '700' },

    addCategoryBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingVertical: 10, 
        paddingHorizontal: 15, 
        backgroundColor: '#f1f2f6', 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: '#6c5ce7', 
        borderStyle: 'dashed', 
        marginBottom: 10, 
        minWidth: '22%' 
    },
    addCategoryBtnSelected: {
        backgroundColor: '#6c5ce7',
        borderStyle: 'solid',
    },
    addCategoryBtnText: {
        fontSize: 13,
        color: '#6c5ce7',
        fontWeight: '700',
        marginLeft: 4
    },

    actionArea: { width: '100%', alignItems: 'center', marginTop: 'auto', marginBottom: 30 },
    button: { width: '100%', paddingVertical: 18, borderRadius: 15, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
    buttonStart: { backgroundColor: '#6c5ce7' },
    buttonStop: { backgroundColor: '#ff7675' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    halfButton: { width: '48%', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
    halfButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    focusMessageContainer: { alignItems: 'center', justifyContent: 'center', padding: 20, marginBottom: 30, width: '100%', backgroundColor: '#fff', borderRadius: 15, borderWidth: 1, borderColor: '#eee' },
    focusLabel: { fontSize: 12, color: '#b2bec3', fontWeight: '700', letterSpacing: 1, marginBottom: 5 },
    focusCategoryName: { fontSize: 28, fontWeight: 'bold', color: '#6c5ce7', textAlign: 'center' },
    divider: { height: 1, width: '50%', backgroundColor: '#f1f2f6', marginVertical: 15 },
    focusMessage: { color: '#636e72', fontSize: 14, fontStyle: 'italic' },
    
    // MODAL STILLERI
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { width: '80%', backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    
    // YENİ EKLEME MODALI 
    addCategoryModalView: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalInput: { width: '100%', borderBottomWidth: 1, borderBottomColor: '#6c5ce7', fontSize: 18, paddingVertical: 10, marginTop: 15, color: '#2d3436' },

    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#2d3436', marginBottom: 10 },
    modalSubtitle: { fontSize: 16, color: '#636e72', textAlign: 'center', marginBottom: 10 },
    modalStats: { width: '100%', backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 10 },
    modalStatText: { fontSize: 16, color: '#2d3436', marginBottom: 5 }
});