import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export function useCategories() {
  const db = useSQLiteContext();
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      const results = await db.getAllAsync<Category>('SELECT id, name FROM categories ORDER BY id ASC');
      setCategories(results);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, refreshCategories: fetchCategories, db };
}

export async function addCategory(db: ReturnType<typeof useSQLiteContext>, name: string) {
  try {
    await db.runAsync('INSERT INTO categories (name) VALUES (?)', [name]);
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
}
