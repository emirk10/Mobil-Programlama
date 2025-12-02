import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      
      {/* Üst Başlık Alanı */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Odaklanma Takibi</Text>
      </View>

      {/* Ana İçerik Alanı */}
      <View style={styles.content}>
        
        {/* Sayaç Kartı */}
        <View style={styles.timerCard}>
          <Text style={styles.timerText}>25:00</Text>
          <Text style={styles.categoryLabel}>Seçili Kategori: Genel Çalışma</Text>
        </View>

        {/* Aksiyon Alanı */}
        <View style={styles.actionArea}>
          <Text style={styles.descriptionText}>
            Dikkatin dağılmadan hedefine ulaşmaya hazır mısın?
          </Text>
          
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>ODAKLANMAYI BAŞLAT</Text>
          </TouchableOpacity>
        </View>

      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Biraz daha temiz bir beyaz/gri tonu
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
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center', 
  },
  // Yeni eklenen Sayaç Kartı stili
  timerCard: {
    backgroundColor: '#fff',
    width: '100%',
    paddingVertical: 50,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
    // Hafif gölge
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f2f6',
  },
  timerText: {
    fontSize: 64, // Kocaman sayaç yazısı
    fontWeight: 'bold',
    color: '#2d3436',
    fontVariant: ['tabular-nums'], // Rakamların sabit genişlikte durması için
  },
  categoryLabel: {
    fontSize: 14,
    color: '#636e72',
    marginTop: 10,
    fontWeight: '500',
    backgroundColor: '#dfe6e9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionArea: {
    width: '100%',
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#b2bec3',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#6c5ce7', // Daha modern bir mor renk
    width: '100%',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: "#6c5ce7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});