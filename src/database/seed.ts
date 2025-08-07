import { SQLiteDatabase } from 'expo-sqlite';

export const insertDummyData = async (db: SQLiteDatabase) => {
  try {
    // Insert 30 categories
    const categoryNames = Array.from({ length: 30 }, (_, i) => `Category ${i + 1}`);
    const categoryPlaceholders = categoryNames.map(() => '(?)').join(', ');
    await db.runAsync(
      `INSERT INTO categories (name) VALUES ${categoryPlaceholders}`,
      categoryNames
    );

    // Insert 30 projects
    const projectEntries = Array.from({ length: 30 }, (_, i) => [
      `Project ${i + 1}`,
      `Description for project ${i + 1}`,
      Math.floor(Math.random() * 10000) + 5000, // Random budget 5k–15k
    ]);
    const projectPlaceholders = projectEntries.map(() => '(?, ?, ?)').join(', ');
    const projectParams = projectEntries.flat();
    await db.runAsync(
      `INSERT INTO projects (name, description, budget) VALUES ${projectPlaceholders}`,
      projectParams
    );

    // Insert 8 receipts linked to unique projects (1 to 8) and random categories (1 to 30)
    const receiptEntries = Array.from({ length: 8 }, (_, i) => [
      i + 1, // project_id 1 to 8
      Math.floor(Math.random() * 30) + 1, // category_id 1 to 30
      `Receipt ${i + 1}`,
      Math.floor(Math.random() * 1000) + 100, // amount: 100–1100
    ]);
    const receiptPlaceholders = receiptEntries.map(() => '(?, ?, ?, ?)').join(', ');
    const receiptParams = receiptEntries.flat();
    await db.runAsync(
      `INSERT INTO receipts (project_id, category_id, name, amount) VALUES ${receiptPlaceholders}`,
      receiptParams
    );

    console.log('✅ 30 categories, 30 projects, and 8 receipts inserted.');
  } catch (error) {
    console.error('❌ Failed to insert dummy data:', error);
  }
};
