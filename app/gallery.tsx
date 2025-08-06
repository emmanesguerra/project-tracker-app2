import { addReceiptImage } from '@/src/database/receipts';
import { generateImageFilename } from '@/src/utils/filename';
import { AntDesign } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';

const { width, height } = Dimensions.get('window');

const GalleryPage = () => {
    const db = useSQLiteContext();
    const { projectId, receiptId } = useLocalSearchParams();
    const [imageUris, setImageUris] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadImages = async () => {
            try {
                const folderPath = `${FileSystem.documentDirectory}images/${projectId}/${receiptId}/`;
                const folderInfo = await FileSystem.getInfoAsync(folderPath);

                if (!folderInfo.exists || !folderInfo.isDirectory) {
                    console.warn('Folder does not exist:', folderPath);
                    setImageUris([]); // explicitly clear
                    return;
                }

                const files = await FileSystem.readDirectoryAsync(folderPath);
                const imagePaths = files
                    .filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
                    .map(file => folderPath + file);

                setImageUris(imagePaths);
            } catch (error) {
                console.error('Failed to load images:', error);
            } finally {
                setLoading(false);
            }
        };

        loadImages();
    }, [projectId, receiptId]);

    const openViewer = (index: number) => {
        setSelectedIndex(index);
        setViewerVisible(true);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    const imageObjects = imageUris.map(uri => ({ uri }));

    const handleAddImage = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
            const photo = result.assets[0];
            const originalUri = photo.uri;

            const newFilename = generateImageFilename(Number(projectId), Number(receiptId), imageUris.length + 1);
            const folderPath = `${FileSystem.documentDirectory}images/${projectId}/${receiptId}`;
            const newPath = `${folderPath}/${newFilename}`;

            try {
                // Ensure folder exists
                await FileSystem.makeDirectoryAsync(folderPath, { intermediates: true });

                // Copy image
                await FileSystem.copyAsync({
                    from: originalUri,
                    to: newPath,
                });

                await addReceiptImage(db, Number(receiptId), newPath);

                // Update state
                setImageUris(prev => [...prev, newPath]);
            } catch (err) {
                console.error('Failed to save image:', err);
                Alert.alert('Error', 'Could not save image.');
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* Top Preview or Placeholder */}
            {imageUris.length > 0 ? (
                <TouchableOpacity onPress={() => openViewer(selectedIndex)} activeOpacity={0.9}>
                    <Image
                        source={{ uri: imageUris[selectedIndex] }}
                        style={styles.previewImage}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            ) : (
                <View style={[styles.previewImage, styles.centered]}>
                    <Text style={styles.emptyText}>No images found.</Text>
                </View>
            )}

            {/* Thumbnails + Add Button Section */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailScroll}
            >

                {/* Add Image Button */}
                <TouchableOpacity
                    onPress={handleAddImage} // updated here
                    style={[styles.thumbnailWrapper, styles.addButton]}
                >
                    <AntDesign name="camerao" size={50} color="white" />
                </TouchableOpacity>

                {imageUris.map((uri, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedIndex(index)}
                        style={[
                            styles.thumbnailWrapper,
                            selectedIndex === index && styles.activeThumbnail,
                        ]}
                    >
                        <Image source={{ uri }} style={styles.thumbnail} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Fullscreen Viewer */}
            <ImageViewing
                images={imageUris.map(uri => ({ uri }))}
                imageIndex={selectedIndex}
                visible={viewerVisible}
                onRequestClose={() => setViewerVisible(false)}
            />
        </View>
    );
};

export default GalleryPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    previewImage: {
        width: width,
        height: height * 0.8,
        backgroundColor: '#000',
    },
    thumbnailScroll: {
        paddingHorizontal: 20,
        alignItems: 'center',
        height: 140,
    },
    thumbnailWrapper: {
        marginRight: 10,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeThumbnail: {
        borderColor: '#3d6185ff',
        backgroundColor: '#3d6185ff',
    },
    thumbnail: {
        width: 100,
        height: 120,
        borderRadius: 8,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
    addButton: {
        width: 100,
        height: 120,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#3d6185ff',
        backgroundColor: '#3d6185ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 40,
        color: '#fff',
    },
});