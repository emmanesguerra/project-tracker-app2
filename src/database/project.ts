// src/database/project.ts
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  budget: number;
  created_at: string;
  updated_at: string;
}

export function useProjects() {
  const db = useSQLiteContext();
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchProjects = async () => {
    try {
      const results = await db.getAllAsync<Project>('SELECT * FROM projects ORDER BY created_at DESC');
      setProjects(results);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, refreshProjects: fetchProjects, db };
}

export async function addProject(db: ReturnType<typeof useSQLiteContext>, name: string) {
  try {
    await db.runAsync('INSERT INTO projects (name) VALUES (?)', [name]);
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
}

export async function updateProject(
  db: ReturnType<typeof useSQLiteContext>,
  id: number,
  projectName: string,
  description: string,
  budget: number
) {
  try {
    await db.runAsync(
      `
      UPDATE projects 
      SET name = ?, description = ?, budget = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
      `,
      [projectName, description, budget, id]
    );
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

export async function updateProjectTotalExpenses(
  db: ReturnType<typeof useSQLiteContext>,
  projectId: number
) {
  try {
    const result = await db.getFirstAsync<{ total: number | null }>(
      `SELECT SUM(amount) as total FROM receipts WHERE project_id = ?`,
      [projectId]
    );

    const total = result?.total ?? 0;

    await db.runAsync(
      `UPDATE projects SET total_expense = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [total, projectId]
    );
  } catch (error) {
    console.error('Error updating total_expenses for project:', error);
    throw error;
  }
}

export async function getProjectById(
  db: ReturnType<typeof useSQLiteContext>,
  id: number
): Promise<Project | null> {
  try {
    const result = await db.getFirstAsync<Project>('SELECT * FROM projects WHERE id = ?', [id]);
    return result ?? null;
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    return null;
  }
}

export async function deleteProjectAndReceipts(
  db: ReturnType<typeof useSQLiteContext>,
  projectId: number
) {
  try {
    await db.runAsync('DELETE FROM receipts WHERE project_id = ?', [projectId]);

    await db.runAsync('DELETE FROM projects WHERE id = ?', [projectId]);
  } catch (error) {
    console.error('Error deleting project and its receipts:', error);
    throw error;
  }
}