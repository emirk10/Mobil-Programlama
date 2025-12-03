import { StatusBar } from 'expo-status-bar';
import { useState } from 'react'; // React'in hafızası (State) eklendi
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';

export default function App() {
  // --- STATE (DURUM) YÖNETİMİ ---
  const [isActive, setIsActive] = useState(false); // Sayaç çalışıyor mu?
  const [selectedCategory, setSelectedCategory] = useState('Kodlama'); // Varsayılan kategori

  // Seçeneklerimiz
  const categories = ['Ders', 'Kodlama', 'Kitap', 'Proje'];

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Üst Başlık */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Odaklanma Takibi</Text>
      </View>

      <View style={styles.content}>
        
        {/* Sayaç Kartı */}
        <View style={styles.timerCard}>
          <Text style={styles.timerText}>25:00</Text>
          {/* Seçili kategori bilgisini state'den alıyoruz */}
          <Text style={styles.activeCategoryText}>{selectedCategory}</Text>
        </View>

        {/* Kategori Seçim Alanı */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Kategori Seçin:</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat}
                onPress={() => !isActive && setSelectedCategory(cat)} // Sayaç çalışıyorsa değiştiremesin
                style={[
                  styles.categoryChip, 
                  selectedCategory === cat && styles.categoryChipSelected // Seçiliyse stil değişsin
                ]}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.categoryChipTextSelected
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Aksiyon Alanı */}
        <View style={styles.actionArea}>
          <Text style={styles.descriptionText}>
            {isActive 
              ? "Odaklanma modu aktif! Başarılar..." 
              : "Hedefine ulaşmak için bir kategori seç ve başla."}
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, isActive ? styles.buttonStop : styles.buttonStart]}
            onPress={() => setIsActive(!isActive)} // Tıklayınca durumu tersine çevir
          >
            <Text style={styles.buttonText}>
              {isActive ? "SEANSI DURAKLAT" : "ODAKLANMAYI BAŞLAT"}
            </Text>
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
    paddingVertical: 40,
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
  activeCategoryText: {
    fontSize: 16,
    color: '#a4b0be',
    fontWeight: '600',
    marginTop: 5,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // Yeni Kategori Stilleri
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
    backgroundColor: '#6c5ce7', // Seçili arka plan (Mor)
    borderColor: '#6c5ce7',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#636e72',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff', // Seçili yazı rengi (Beyaz)
    fontWeight: '700',
  },
  actionArea: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto', // Butonu en alta itmek için
    marginBottom: 30,
  },
  descriptionText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#b2bec3',
    marginBottom: 20,
    minHeight: 20, // Metin değişince zıplamayı önler
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
    backgroundColor: '#6c5ce7', // Başlat Rengi (Mor)
  },
  buttonStop: {
    backgroundColor: '#ff7675', // Durdur Rengi (Kırmızımsı)
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});