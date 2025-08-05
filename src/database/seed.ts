import { SQLiteDatabase } from 'expo-sqlite';

export const insertDummyData = async (db: SQLiteDatabase) => {
  try {
    // Insert dummy categories
    await db.runAsync(`INSERT INTO categories (name) VALUES (?), (?), (?)`, [
      'Supplies',
      'Travel',
      'Marketing',
    ]);

    // Insert dummy projects
    await db.runAsync(`INSERT INTO projects (name, description, budget) VALUES (?, ?, ?), (?, ?, ?)`, [
      'Website Redesign',
      'Revamp the company website',
      10000,
      'App Development',
      'Create a cross-platform mobile app',
      25000,
    ]);

    // Insert dummy receipts
    await db.runAsync(
      `INSERT INTO receipts (project_id, category_id, name, amount) VALUES (?, ?, ?, ?), (?, ?, ?, ?)`,
      [
        1, 1, 'Office supplies purchase', 120.50,
        2, 2, 'Uber to client meeting', 45.00,
      ]
    );

    console.log('✅ Dummy data inserted.');
  } catch (error) {
    console.error('❌ Failed to insert dummy data:', error);
  }
};
