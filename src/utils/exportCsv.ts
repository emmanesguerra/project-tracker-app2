// src/utils/exportCsv.ts
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SQLiteDatabase } from 'expo-sqlite';

export const exportDataToCSV = async (db: SQLiteDatabase) => {
    try {
        // Query: Join projects, receipts, categories
        const query = `
      SELECT 
        p.id as project_id,
        p.name as project_name,
        p.description as project_description,
        p.budget,
        p.total_expense,
        r.id as receipt_id,
        r.name as receipt_name,
        c.name as category,
        r.amount,
        r.issued_at
      FROM receipts r
      LEFT JOIN projects p ON r.project_id = p.id
      LEFT JOIN categories c ON r.category_id = c.id
    `;

        const result = await db.getAllAsync(query);

        // Prepare CSV content
        const headers = [
            'project_id',
            'project_name',
            'project_description',
            'budget',
            'total_expense',
            'receipt_id',
            'receipt_name',
            'category',
            'amount',
            'issued_at',
        ];
        const rows = result.map((row) =>
            headers.map((header) => `"${(row as Record<string, any>)[header] ?? ''}"`).join(',')
        );

        const csv = [headers.join(','), ...rows].join('\n');

        // Save to file
        const fileUri = FileSystem.documentDirectory + 'exported_data.csv';
        await FileSystem.writeAsStringAsync(fileUri, csv, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Export CSV',
            UTI: 'public.comma-separated-values-text',
        });
    } catch (error) {
        console.error('CSV Export Failed:', error);
    }
};
