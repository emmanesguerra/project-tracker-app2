import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { zip } from 'react-native-zip-archive';

export const zipAndShareImages = async () => {
    try {
        const imagesFolder = `${FileSystem.documentDirectory}images`;
        const zipDest = `${FileSystem.documentDirectory}images.zip`;

        // Optional: check if folder exists
        const dirInfo = await FileSystem.getInfoAsync(imagesFolder);
        if (!dirInfo.exists || !dirInfo.isDirectory) {
            throw new Error('Images folder does not exist.');
        }

        // Delete old zip if exists
        const oldZip = await FileSystem.getInfoAsync(zipDest);
        if (oldZip.exists) {
            await FileSystem.deleteAsync(zipDest, { idempotent: true });
        }

        // Convert to native paths
        const srcPath = imagesFolder.replace('file://', '');
        const destPath = zipDest.replace('file://', '');

        // Create the zip
        const zippedPath = await zip(srcPath, destPath);

        // Share the zip
        if (!(await Sharing.isAvailableAsync())) {
            throw new Error('Sharing is not available on this device.');
        }

        await Sharing.shareAsync(`file://${zippedPath}`);
        console.log('Zip and share successful:', zippedPath);
    } catch (error) {
        console.error('Error during zip and share:', error);
    }
};
