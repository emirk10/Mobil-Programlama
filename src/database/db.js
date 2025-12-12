import * as SQLite from 'expo-sqlite';

// Veritabanını yeni yöntemle senkron olarak açıyoruz
const db = SQLite.openDatabaseSync('odaklanma.db');

// Tabloları oluştur (Uygulama açıldığında App.js'den çağrılacak)
export const initDB = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY NOT NULL, 
        category TEXT, 
        duration INT, 
        date TEXT, 
        distractionCount INT
      );
    `);
    console.log("Tablo kontrol edildi/oluşturuldu.");
  } catch (error) {
    console.log("Tablo oluşturma hatası:", error);
  }
};

// Seans Kaydetme Fonksiyonu
export const addSession = (category, duration, distractionCount, successCallback) => {
  try {
    const date = new Date().toISOString();
    // 'runSync' komutu ekleme/güncelleme işlemleri içindir
    db.runSync(
      'INSERT INTO sessions (category, duration, date, distractionCount) VALUES (?, ?, ?, ?)',
      [category, duration, date, distractionCount]
    );
    console.log("Seans başarıyla kaydedildi!");
    if (successCallback) successCallback();
  } catch (error) {
    console.log("Ekleme hatası:", error);
  }
};

// Tüm verileri çekme (Raporlar ekranı için)
export const fetchSessions = (setSessions) => {
  try {
    // 'getAllSync' doğrudan temiz bir dizi (array) döndürür
    const allRows = db.getAllSync('SELECT * FROM sessions ORDER BY id DESC');
    setSessions(allRows);
  } catch (error) {
    console.log("Veri çekme hatası:", error);
  }
};