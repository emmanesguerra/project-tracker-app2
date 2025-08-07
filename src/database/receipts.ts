import { SQLiteDatabase, useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

export interface Receipt {
    category_name: string;
    id: number;
    project_id: number;
    category_id: number | null;
    name: string;
    amount: number;
    issued_at: string;
    created_at: string;
    updated_at: string;
}


export function useReceipts(projectId: number, searchText: string, selectedFilter: string | null) {
    const db = useSQLiteContext();
    const [receipts, setReceipts] = useState<Receipt[]>([]);

    const fetchReceipts = async () => {
        try {
            let query = `
        SELECT 
          r.id, r.project_id, r.category_id, c.name AS category_name,
          r.name, r.amount, r.issued_at,
          r.created_at, r.updated_at
        FROM receipts r
        LEFT JOIN categories c ON r.category_id = c.id
        WHERE r.project_id = ?
      `;

            const params: any[] = [projectId];

            if (searchText.trim() !== '') {
                query += ` AND (r.name LIKE ? OR CAST(r.amount AS TEXT) LIKE ?)`;
                const keyword = `%${searchText}%`;
                params.push(keyword, keyword);
            }

            if (selectedFilter) {
                query += ` AND r.category_id = ?`;
                params.push(selectedFilter);
            }

            query += ` ORDER BY r.issued_at DESC, r.id DESC`;

            const results = await db.getAllAsync<Receipt>(query, params);
            setReceipts(results);
        } catch (error) {
            console.error('Error fetching receipts:', error);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchReceipts();
        }
    }, [projectId, searchText, selectedFilter]); // 👈 now includes category

    return { receipts, refreshReceipts: fetchReceipts };
}

export async function addReceipt(
    db: ReturnType<typeof useSQLiteContext>,
    projectId: number,
    categoryId: number | null,
    name: string,
    amount: number,
    issuedAt: string
): Promise<number> {
    try {
        await db.runAsync(
            `
            INSERT INTO receipts (project_id, category_id, name, amount, issued_at) 
            VALUES (?, ?, ?, ?, ?)
            `,
            [projectId, categoryId, name, amount, issuedAt]
        );

        // Get the ID of the newly inserted row
        const result = await db.getFirstAsync<{ id: number }>(
            `SELECT last_insert_rowid() as id`
        );

        return result?.id ?? -1;
    } catch (error) {
        console.error('Error adding receipt:', error);
        throw error;
    }
}

export async function updateReceipt(
    db: ReturnType<typeof useSQLiteContext>,
    receiptId: number,
    {
        name,
        amount,
        categoryId,
        issuedAt,
    }: {
        name: string;
        amount: number;
        categoryId: number | null;
        issuedAt: string;
    }
): Promise<void> {
    try {
        await db.runAsync(
            `
      UPDATE receipts
      SET name = ?, amount = ?, category_id = ?, issued_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
            [name, amount, categoryId, issuedAt, receiptId]
        );
    } catch (error) {
        console.error('Error updating receipt:', error);
        throw error;
    }
}

export async function addReceiptImage(
    db: ReturnType<typeof useSQLiteContext>,
    receiptId: number,
    imageName: string
) {
    try {
        await db.runAsync(
            `
            INSERT INTO receipt_images (receipt_id, image_name) 
            VALUES (?, ?)
            `,
            [receiptId, imageName]
        );
    } catch (error) {
        console.error('Error adding receipt image:', error);
        throw error;
    }
}

export async function getReceiptImages(
    db: ReturnType<typeof useSQLiteContext>,
    receiptId: number
): Promise<string[]> {
    const rows = await db.getAllAsync<{ image_name: string }>(
        `SELECT image_name FROM receipt_images WHERE receipt_id = ?`,
        [receiptId]
    );
    return rows.map((row) => row.image_name);
}

export async function deleteReceipt(
    db: ReturnType<typeof useSQLiteContext>,
    projectId: number,
    receiptId: number
) {
    try {
        // Delete receipt from DB (images are assumed to be in receipt_images table with FK or cleaned up manually)
        await db.runAsync('DELETE FROM receipts WHERE id = ?', [receiptId]);
    } catch (error) {
        console.error('Error deleting receipt and its images:', error);
        throw error;
    }
}

export const getImagesByReceiptId = async (
    db: SQLiteDatabase,
    receiptId: number
): Promise<{ id: number; image_name: string }[]> => {
    try {
        const images = await db.getAllAsync<{ id: number; image_name: string }>(
            'SELECT id, image_name FROM receipt_images WHERE receipt_id = ?',
            [receiptId]
        );
        return images;
    } catch (error) {
        console.error(`Error fetching images for receipt ${receiptId}:`, error);
        return [];
    }
};

export async function deleteReceiptImage(
    db: ReturnType<typeof useSQLiteContext>,
    imageId: number,
): Promise<void> {
    try {
        await db.runAsync(
            `DELETE FROM receipt_images WHERE id = ?`,
            [imageId]
        );
    } catch (error) {
        console.error(`Error deleting image with ID ${imageId}:`, error);
        throw error;
    }
}