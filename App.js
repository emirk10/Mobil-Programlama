import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 

// Yeni Modüler Dosyalarımız
import HomeScreen from './src/screens/HomeScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import { initDB } from './src/database/db';

const Tab = createBottomTabNavigator();

export default function App() {

  // Uygulama başladığında veritabanı tablosunu oluştur
  useEffect(() => {
    initDB();
  }, []);

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