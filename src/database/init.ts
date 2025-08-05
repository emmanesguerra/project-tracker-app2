import { SQLiteDatabase } from 'expo-sqlite';

export const initializeDatabase = async (database: SQLiteDatabase) => {
    try {
        await database.execAsync(
            `
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                budget REAL,
                total_expense REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            `
        );

        await database.execAsync(
            `
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            `
        );

        await database.execAsync(
            `
            CREATE TABLE IF NOT EXISTS receipts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER,
                category_id INTEGER,
                name TEXT NOT NULL,
                amount REAL,
                issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id),
                FOREIGN KEY (category_id) REFERENCES categories (id)
            );
            `
        );

        await database.execAsync(
            `
            CREATE TABLE IF NOT EXISTS receipt_images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                receipt_id INTEGER NOT NULL,
                image_name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE
            );
            `
        );
    } catch (error) {
        alert('An error occurred while initializing the database. Please try again later.');
    }
};


export const dropDatabase = async (database: SQLiteDatabase) => {
    try {
        await database.execAsync(`DROP TABLE IF EXISTS projects;`);
        await database.execAsync(`DROP TABLE IF EXISTS categories;`);
        await database.execAsync(`DROP TABLE IF EXISTS receipts;`);
        await database.execAsync(`DROP TABLE IF EXISTS receipt_images;`);

    } catch (error) {
        alert('An error occurred while initializing the database. Please try again later.');
    }
};