import { dropDatabase, initializeDatabase } from '@/src/database/init';

import { Slot } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function Layout() {
  const handleInit = async (db: any) => {
    await dropDatabase(db);
    await initializeDatabase(db);
    // await insertDummyData(db);
  };

  return (
    <SQLiteProvider databaseName="project_tracker.db" onInit={handleInit}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            <Slot />
          </SafeAreaView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </SQLiteProvider>
  );
}
