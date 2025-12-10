import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react'; 
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, AppState } from 'react-native';

// Navigasyon Kütüphaneleri
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // İkonlar için

// --- 1. EKRAN: ANA SAYFA (ZAMANLAYICI) ---
function HomeScreen() {
  // --- STATE (DURUM) YÖNETİMİ ---
  const [isActive, setIsActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Kodlama');
   
  // Varsayılan süre: 25 dakika * 60 saniye = 1500 saniye
  const INITIAL_TIME = 25 * 60;
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
   
  const [distractionCount, setDistractionCount] = useState(0);
  const appState = useRef(AppState.currentState);

  const categories = ['Ders', 'Kodlama', 'Kitap', 'Proje'];

  // --- SÜRE AYARLAMA FONKSİYONU (YENİ) ---
  const adjustTime = (minutes) => {
    if (isActive) return; // Sayaç çalışırken süre değişmesin

    setTimeLeft((prevTime) => {
      const newTime = prevTime + (minutes * 60);
      // 0'dan küçük olamaz kontrolü
      return newTime < 0 ? 0 : newTime;
    });
  };

  // --- APP STATE DİNLEYİCİSİ ---
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

  // --- SAYAÇ MANTIĞI ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Odaklanma Takibi</Text>
      </View>

      <View style={styles.content}>
        
        {/* SAYAÇ KARTI */}
        <View style={styles.timerCard}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          
          {/* SÜRE AYARLAMA BUTONLARI (YENİ) */}
          {!isActive && (
            <View style={styles.adjustmentContainer}>
              <TouchableOpacity onPress={() => adjustTime(-5)} style={styles.adjustButton}>
                <Text style={styles.adjustText}>-5</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => adjustTime(-1)} style={styles.adjustButton}>
                <Text style={styles.adjustText}>-1</Text>
              </TouchableOpacity>
              
              <View style={{width: 20}} /> 
              
              <TouchableOpacity onPress={() => adjustTime(1)} style={styles.adjustButton}>
                <Text style={styles.adjustText}>+1</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => adjustTime(5)} style={styles.adjustButton}>
                <Text style={styles.adjustText}>+5</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.activeCategoryText}>{selectedCategory}</Text>
          
          {distractionCount > 0 && (
            <View style={styles.distractionBadge}>
              <Text style={styles.distractionText}>⚠️ {distractionCount} Kez Odak Bozuldu!</Text>
            </View>
          )}
        </View>

        {/* KATEGORİ SEÇİMİ */}
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

        {/* AKSİYON BUTONLARI */}
        <View style={styles.actionArea}>
          <Text style={styles.descriptionText}>
            {isActive 
              ? "Odaklanma modu aktif! Uygulamadan çıkma." 
              : distractionCount > 0 
                ? "Dikkatin dağıldı! Tekrar odaklanmak için Başlat'a bas."
                : "Süreyi ayarla ve hedefine odaklan."}
          </Text>
           
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
      </View>
    </SafeAreaView>
  );
}

// --- 2. EKRAN: RAPORLAR (BOŞ TASLAK) ---
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

// --- NAVİGASYON AYARLARI ---
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false, 
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Zamanlayıcı') {
              iconName = focused ? 'timer' : 'timer-outline';
            } else if (route.name === 'Raporlar') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            }

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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3436',
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
  // YENİ BUTON STİLLERİ
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
  descriptionText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#b2bec3',
    marginBottom: 20,
    minHeight: 40,
    justifyContent: 'center',
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
});