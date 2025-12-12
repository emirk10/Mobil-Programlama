import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchSessions } from '../database/db'; 
import { useIsFocused } from '@react-navigation/native'; 

export default function ReportsScreen() {
  const [sessions, setSessions] = useState([]);
  const isFocused = useIsFocused(); 

  useEffect(() => {
    if (isFocused) {
      // fetchSessions artık direkt array döndürüyor, db.js'i güncelledik
      fetchSessions(setSessions);
    }
  }, [isFocused]);

  const renderItem = ({ item }) => (
    <View style={styles.logItem}>
      <View>
        <Text style={styles.logCategory}>{item.category}</Text>
        {/* Tarih formatlama */}
        <Text style={styles.logDate}>
            {new Date(item.date).toLocaleDateString()} - {new Date(item.date).toLocaleTimeString().slice(0,5)}
        </Text>
      </View>
      <View style={{alignItems:'flex-end'}}>
         <Text style={styles.logDuration}>{Math.floor(item.duration / 60)} dk</Text>
         <Text style={{fontSize:12, color: item.distractionCount > 0 ? '#e74c3c':'#2ecc71'}}>
            {item.distractionCount} Kesinti
         </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Geçmiş Seanslar</Text>
      </View>
      
      {sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
            <Ionicons name="bar-chart-outline" size={60} color="#dfe6e9" />
            <Text style={styles.emptyText}>Henüz kayıtlı bir odaklanma seansı yok.</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{padding: 20}}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 30 },
  header: { paddingVertical: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#2d3436' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 10, color: '#b2bec3', fontSize: 16 },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  logCategory: { fontWeight: 'bold', color: '#2d3436', fontSize: 16 },
  logDate: { color: '#b2bec3', fontSize: 12, marginTop: 4 },
  logDuration: { fontWeight: 'bold', color: '#6c5ce7', fontSize: 16 }
});