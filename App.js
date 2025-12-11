import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react'; 
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, AppState, Modal, Vibration } from 'react-native';

// Navigasyon Kütüphaneleri
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 

// --- 1. EKRAN: ANA SAYFA (ZAMANLAYICI) ---
function HomeScreen() {
  const [isActive, setIsActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Kodlama');
  
  // Varsayılan süre (25 dk)
  const INITIAL_TIME = 25 * 60;
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  
  const [distractionCount, setDistractionCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false); // Modal görünürlüğü
  
  const appState = useRef(AppState.currentState);
  const categories = ['Ders', 'Kodlama', 'Kitap', 'Proje'];

  // SÜRE AYARLAMA
  const adjustTime = (minutes) => {
    if (isActive) return; 
    setTimeLeft((prevTime) => {
      const newTime = prevTime + (minutes * 60);
      return newTime < 0 ? 0 : newTime;
    });
  };

  // APP STATE (DİKKAT DAĞINIKLIĞI)
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

  // SAYAÇ MANTIĞI VE BİTİŞ KONTROLÜ
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // SÜRE BİTTİĞİ AN:
      setIsActive(false);
      Vibration.vibrate(); // 1. Titreşim ver
      setModalVisible(true); // 2. Özeti Göster
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
    setTimeLeft(INITIAL_TIME);
    setDistractionCount(0);
  };

  const changeCategory = (cat) => {
    if (!isActive) {
      setSelectedCategory(cat);
      setTimeLeft(INITIAL_TIME);
      setDistractionCount(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* BAŞLIK (Dinamik) */}
      <View style={[styles.header, isActive && styles.headerActive]}>
        <Text style={[styles.headerTitle, isActive && styles.headerTitleActive]}>
          {isActive ? "🔥 Odaklanılıyor..." : "Odaklanma Takibi"}
        </Text>
      </View>

      <View style={styles.content}>
        
        {/* SAYAÇ KARTI */}
        <View style={styles.timerCard}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          
          {!isActive && (
            <View style={styles.adjustmentContainer}>
              <TouchableOpacity onPress={() => adjustTime(-5)} style={styles.adjustButton}><Text style={styles.adjustText}>-5</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => adjustTime(-1)} style={styles.adjustButton}><Text style={styles.adjustText}>-1</Text></TouchableOpacity>
              <View style={{width: 20}} /> 
              <TouchableOpacity onPress={() => adjustTime(1)} style={styles.adjustButton}><Text style={styles.adjustText}>+1</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => adjustTime(5)} style={styles.adjustButton}><Text style={styles.adjustText}>+5</Text></TouchableOpacity>
            </View>
          )}

          <Text style={styles.activeCategoryText}>{selectedCategory}</Text>
          
          {distractionCount > 0 && (
            <View style={styles.distractionBadge}>
              <Text style={styles.distractionText}>⚠️ {distractionCount} Kez Odak Bozuldu!</Text>
            </View>
          )}
        </View>

        {/* KATEGORİLER */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Kategori Seçin:</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat}
                onPress={() => changeCategory(cat)}
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipSelected]}
              >
                <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* BAŞLAT BUTONU */}
        <View style={styles.actionArea}>
          <TouchableOpacity 
            style={[styles.button, isActive ? styles.buttonStop : styles.buttonStart]}
            onPress={() => setIsActive(!isActive)}
          >
            <Text style={styles.buttonText}>{isActive ? "DURAKLAT" : "BAŞLAT"}</Text>
          </TouchableOpacity>

          {(!isActive && (timeLeft !== INITIAL_TIME || distractionCount > 0)) && (
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Seansı Sıfırla (25dk)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* --- SEANS ÖZETİ MODALI (POPUP) --- */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Ionicons name="trophy" size={50} color="#f1c40f" style={{marginBottom: 10}} />
              <Text style={styles.modalTitle}>Harika İş! 🎉</Text>
              <Text style={styles.modalSubtitle}>Bir odaklanma seansını tamamladın.</Text>
              
              <View style={styles.modalStats}>
                <Text style={styles.modalStatText}>📂 Kategori: <Text style={{fontWeight:'bold'}}>{selectedCategory}</Text></Text>
                <Text style={styles.modalStatText}>⚠️ Kesinti: <Text style={{fontWeight:'bold', color: distractionCount > 0 ? '#e74c3c' : '#27ae60'}}>{distractionCount}</Text></Text>
              </View>

              <TouchableOpacity
                style={[styles.button, {marginTop: 20, backgroundColor: '#2ecc71'}]}
                onPress={() => {
                  setModalVisible(false);
                  handleReset(); // Kapatınca sayacı sıfırla
                }}
              >
                <Text style={styles.buttonText}>Tamamla ve Bitir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

// --- RAPORLAR EKRANI ---
function ReportsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>İstatistikler</Text>
      </View>
      <View style={[styles.content, {justifyContent: 'center'}]}>
        <Ionicons name="bar-chart" size={80} color="#dfe6e9" />
        <Text style={{fontSize: 18, color: '#636e72', marginTop: 20}}>
          Grafikler çok yakında burada olacak...
        </Text>
      </View>
    </SafeAreaView>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false, 
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Zamanlayıcı') iconName = focused ? 'timer' : 'timer-outline';
            else if (route.name === 'Raporlar') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6c5ce7', 
          tabBarInactiveTintColor: 'gray', 
        })}
      >
        <Tab.Screen name="Zamanlayıcı" component={HomeScreen} />
        <Tab.Screen name="Raporlar" component={ReportsScreen} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 30, 
  },
  header: {
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerActive: {
    backgroundColor: '#e3f2fd', // Aktifken başlık mavi tonlu olsun
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3436',
  },
  headerTitleActive: {
    color: '#0984e3',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center', 
  },
  timerCard: {
    backgroundColor: '#fff',
    width: '100%',
    paddingVertical: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f2f6',
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#2d3436',
    fontVariant: ['tabular-nums'],
  },
  adjustmentContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    marginTop: 5,
  },
  adjustButton: {
    backgroundColor: '#f1f2f6',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  adjustText: {
    fontWeight: 'bold',
    color: '#636e72',
  },
  activeCategoryText: {
    fontSize: 16,
    color: '#a4b0be',
    fontWeight: '600',
    marginTop: 5,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  distractionBadge: {
    marginTop: 15,
    backgroundColor: '#ff7675',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  distractionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  categorySection: {
    width: '100%',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636e72',
    marginBottom: 10,
    marginLeft: 5,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    marginBottom: 10,
    minWidth: '22%',
    alignItems: 'center',
  },
  categoryChipSelected: {
    backgroundColor: '#6c5ce7',
    borderColor: '#6c5ce7',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#636e72',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  actionArea: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 30,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonStart: {
    backgroundColor: '#6c5ce7',
  },
  buttonStop: {
    backgroundColor: '#ff7675',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  resetButton: {
    marginTop: 15,
    padding: 10,
  },
  resetButtonText: {
    color: '#636e72',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // --- MODAL STİLLERİ ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Arka planı karart
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalStats: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalStatText: {
    fontSize: 16,
    color: '#2d3436',
    marginBottom: 5,
  }
});