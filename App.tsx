import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, ActivityIndicator } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { initializeDatabase } from './src/data';

export default function App() {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Initialize the database when the app starts
  useEffect(() => {
    async function init() {
      try {
        await initializeDatabase();
        setIsDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setDbError((error as Error).message);
      }
    }

    init();
  }, []);
  // Show loading screen while database initializes
  if (!isDbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {dbError ? (
          <Text style={{ color: 'red' }}>Error initializing database: {dbError}</Text>
        ) : (
          <>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={{ marginTop: 10 }}>Initializing database...</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}