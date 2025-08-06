import * as FileSystem from 'expo-file-system';

export async function deleteReceiptFolder(projectId: number, receiptId: number) {
    const folderPath = `${FileSystem.documentDirectory}images/${projectId}/${receiptId}`;
    await deleteFolder(folderPath);
}

export async function deleteProjectFolder(projectId: number) {
    const folderPath = `${FileSystem.documentDirectory}images/${projectId}`;
    await deleteFolder(folderPath);
}

export async function deleteImage(uri: string) {
    try {
        const info = await FileSystem.getInfoAsync(uri);
        if (info.exists) {
            await FileSystem.deleteAsync(uri, { idempotent: true });
            console.log(`Deleted image: ${uri}`);
        }
    } catch (error) {
        console.error('Failed to delete image:', error);
    }
}

// 🔧 Internal helper
async function deleteFolder(folderPath: string) {
    try {
        const info = await FileSystem.getInfoAsync(folderPath);
        if (info.exists && info.isDirectory) {
            await FileSystem.deleteAsync(folderPath, { idempotent: true });
            console.log(`Deleted folder: ${folderPath}`);
        }
    } catch (error) {
        console.error(`Failed to delete folder: ${folderPath}`, error);
    }
}
