import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('odaklanma.db');

export const initDB = () => {
  try {
    
    
    // Tablo olusturulan kisim
    db.execSync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY NOT NULL, 
        category TEXT, 
        duration INT, 
        targetDuration INT,
        status TEXT,
        date TEXT, 
        distractionCount INT
      );
    `);
    console.log("Veritabanı kontrol edildi/hazır.");
  } catch (error) {
    console.log("Tablo oluşturma hatası:", error);
  }
};

export const addSession = (category, duration, targetDuration, status, distractionCount, successCallback) => {
  try {
    const date = new Date().toISOString();
    db.runSync(
      'INSERT INTO sessions (category, duration, targetDuration, status, date, distractionCount) VALUES (?, ?, ?, ?, ?, ?)',
      [category, duration, targetDuration, status, date, distractionCount]
    );
    console.log("Seans kaydedildi!");
    if (successCallback) successCallback();
  } catch (error) {
    console.log("Ekleme hatası:", error);
  }
};

export const fetchSessions = (setSessions) => {
  try {
    const allRows = db.getAllSync('SELECT * FROM sessions ORDER BY id DESC');
    setSessions(allRows);
  } catch (error) {
    console.log("Veri çekme hatası:", error);
  }
};

export const deleteSession = (id, successCallback) => {
  try {
    db.runSync('DELETE FROM sessions WHERE id = ?', [id]);
    if (successCallback) successCallback();
  } catch (error) {
    console.log("Silme hatası:", error);
  }
};