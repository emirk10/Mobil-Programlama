import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit'; 
import { fetchSessions, deleteSession } from '../database/db'; 
import { useIsFocused } from '@react-navigation/native'; 

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const [sessions, setSessions] = useState([]);
  const [pieData, setPieData] = useState([]);
  

  const [dailyData, setDailyData] = useState([]);
  const [maxVal, setMaxVal] = useState(1); // yuksekligi oranlamak için en buyuk deger tutulacak

  const [stats, setStats] = useState({
    todayFocus: 0,
    totalFocus: 0,
    totalDistraction: 0
  });
  
  const isFocused = useIsFocused(); 

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = () => {
    fetchSessions((data) => {
      setSessions(data);
      calculateStats(data);
      processPieData(data);
      processCustomBarData(data); // Yeni fonksiyon
    });
  };

  const formatDurationDetailed = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}dk ${secs}sn`;
  };

  const calculateStats = (data) => {
    let todayTotal = 0;
    let allTimeTotal = 0;
    let distractionTotal = 0;

    const now = new Date();
    const todayStr = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0');

    data.forEach(item => {
        allTimeTotal += item.duration;
        distractionTotal += item.distractionCount;

        const itemDateObj = new Date(item.date);
        const itemDateStr = itemDateObj.getFullYear() + '-' + 
                            String(itemDateObj.getMonth() + 1).padStart(2, '0') + '-' + 
                            String(itemDateObj.getDate()).padStart(2, '0');

        if (itemDateStr === todayStr) {
            todayTotal += item.duration;
        }
    });

    setStats({
        todayFocus: Math.floor(todayTotal / 60), 
        totalFocus: Math.floor(allTimeTotal / 60),
        totalDistraction: distractionTotal
    });
  };

  const processPieData = (data) => {
    const categoryTotals = {};
    data.forEach(item => {
      if (!categoryTotals[item.category]) categoryTotals[item.category] = 0;
      categoryTotals[item.category] += item.duration;
    });

    const colors = ['#e74c3c', '#3498db', '#9b59b6', '#2ecc71', '#f1c40f'];
    const chartData = Object.keys(categoryTotals).map((key, index) => ({
      name: key,
      population: Math.floor(categoryTotals[key] / 60), 
      color: colors[index % colors.length],
      legendFontColor: "#7f7f7f",
      legendFontSize: 12
    }));
    setPieData(chartData);
  };

  // --- MANUEL BAR CHART GRAFIGI---
  const processCustomBarData = (data) => {
    const last7Days = {};
    const formattedData = [];

    // 1. Son 7 günün iskeletini oluştur
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        // Sadece gün/ay göster (Örn: 15/12)
        const label = `${d.getDate()}/${d.getMonth() + 1}`;
        last7Days[dateStr] = { label: label, value: 0 };
    }

    // 2. Verileri doldur
    data.forEach(item => {
        const itemDate = item.date.split('T')[0];
        if (last7Days[itemDate] !== undefined) {
            last7Days[itemDate].value += item.duration;
        }
    });

    // 3. Diziye Cevir ve En Yuksek Degeri Bul (Boy hesabı için lazım)
    let calculatedMax = 0;
    Object.keys(last7Days).sort().forEach(key => {
        const mins = Math.floor(last7Days[key].value / 60);
        if (mins > calculatedMax) calculatedMax = mins;
        formattedData.push({
            label: last7Days[key].label,
            value: mins
        });
    });

    
    setMaxVal(calculatedMax > 0 ? calculatedMax : 1);
    setDailyData(formattedData);
  };

  const handleDelete = (id) => {
    Alert.alert(
        "Kaydı Sil",
        "Bu odaklanma seansını silmek istediğine emin misin?",
        [
            { text: "İptal", style: "cancel" },
            { 
                text: "Sil", 
                style: "destructive", 
                onPress: () => deleteSession(id, () => loadData()) 
            }
        ]
    );
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Raporlar & İstatistikler</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 50, alignItems: 'center' }}>
        
        {/* İstatistikler */}
        <View style={styles.statsContainer}>
            <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.todayFocus} dk</Text>
                <Text style={styles.statLabel}>Bugün</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.totalFocus} dk</Text>
                <Text style={styles.statLabel}>Toplam</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={[styles.statNumber, {color:'#e74c3c'}]}>{stats.totalDistraction}</Text>
                <Text style={styles.statLabel}>Kesinti</Text>
            </View>
        </View>

        {/* Pasta Grafik*/}
        <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Kategori Dağılımı</Text>
            {pieData.length > 0 ? (
                <PieChart
                    data={pieData}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    absolute 
                />
            ) : <Text style={styles.noDataText}>Veri yok.</Text>}
        </View>

        {/*  CUSTOM BAR CHART */}
        <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Son 7 Günlük Odaklanma (dk)</Text>
            
            <View style={styles.customChartContainer}>
                {dailyData.map((day, index) => {
                    
                    const barHeightPercent = (day.value / maxVal) * 100;
                    
                    return (
                        <View key={index} style={styles.barWrapper}>
                            {/* Üstteki Sayı */}
                            <Text style={styles.barValueText}>
                                {day.value > 0 ? day.value : ''}
                            </Text>
                            
                            {/* Çubuk */}
                            <View style={[
                                styles.bar, 
                                { 
                                    height: barHeightPercent > 0 ? `${barHeightPercent}%` : 2, 
                                    backgroundColor: day.value > 0 ? '#6c5ce7' : '#dfe6e9' 
                                }
                            ]} />
                            
                            {/* Tarih Etiketi */}
                            <Text style={styles.barLabelText}>{day.label}</Text>
                        </View>
                    );
                })}
            </View>
        </View>

        {/* Geçmiş Listesi */}
        <Text style={[styles.chartTitle, {marginTop: 30, marginBottom: 10}]}>Geçmiş Kayıtlar</Text>
        <Text style={{fontSize:12, color:'#b2bec3', marginBottom:10}}>(Silmek için kayda basılı tutun)</Text>
        
        {sessions.map((item) => (
            <TouchableOpacity 
                key={item.id} 
                onLongPress={() => handleDelete(item.id)} 
                delayLongPress={500}
                style={styles.logItem}
            >
                <View style={{flex: 1}}>
                    <View style={{flexDirection:'row', alignItems:'center', marginBottom: 5}}>
                        <Text style={styles.logCategory}>{item.category}</Text>
                        <View style={[styles.statusBadge, {backgroundColor: item.status === 'Tamamlandı' ? '#dff9fb' : '#ff797930'}]}>
                            <Text style={[styles.statusText, {color: item.status === 'Tamamlandı' ? '#2ecc71' : '#e74c3c'}]}>
                                {item.status || 'Tamamlandı'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.logDate}>
                        {new Date(item.date).toLocaleDateString()} - {new Date(item.date).toLocaleTimeString().slice(0,5)}
                    </Text>
                </View>

                <View style={{alignItems:'flex-end'}}>
                    <Text style={styles.logDuration}>
                        {formatDurationDetailed(item.duration)}
                    </Text>
                    {item.status === 'Yarıda Kaldı' && (
                        <Text style={styles.targetText}>Hedef: {Math.floor(item.targetDuration/60)}dk</Text>
                    )}
                    <Text style={{fontSize:12, color: item.distractionCount > 0 ? '#e74c3c':'#b2bec3', marginTop: 2}}>
                        {item.distractionCount} Kesinti
                    </Text>
                </View>
            </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 30 },
  header: { paddingVertical: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#2d3436' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginVertical: 20 },
  statCard: { backgroundColor: '#fff', width: '30%', padding: 15, borderRadius: 15, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#6c5ce7', marginBottom: 5 },
  statLabel: { fontSize: 12, color: '#636e72', fontWeight: '600' },
  chartCard: { backgroundColor: '#fff', width: '90%', borderRadius: 20, padding: 20, marginTop: 10, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3436', marginBottom: 15, alignSelf: 'flex-start' },
  noDataText: { color: '#b2bec3', marginVertical: 50 },
  
  
  customChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    height: 180, 
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 10
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 30,
    height: '100%',
  },
  bar: {
    width: 14, 
    borderRadius: 7,
    marginBottom: 5,
  },
  barValueText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 2
  },
  barLabelText: {
    fontSize: 10,
    color: '#b2bec3',
  },

  logItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee', width:'90%' },
  logCategory: { fontWeight: 'bold', color: '#2d3436', fontSize: 16, marginRight: 10 },
  logDate: { color: '#b2bec3', fontSize: 12, marginTop: 4 },
  logDuration: { fontWeight: 'bold', color: '#6c5ce7', fontSize: 16 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  targetText: { fontSize: 10, color: '#b2bec3' }
});