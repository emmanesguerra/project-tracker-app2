import { getImagesByReceiptId } from '@/src/database/receipts';
import { AntDesign, MaterialIcons } from '@expo/vector-icons'; // ⬅️ ADDED
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const GalleryPage = () => {
    const db = useSQLiteContext();
    const { projectId, receiptId } = useLocalSearchParams();
    const [imageUris, setImageUris] = useState<string[]>([]);
    const [images, setImages] = useState<{ id: number; image_name: string }[]>([]);
    const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadImages = async () => {
        try {
            const imageRecords = await getImagesByReceiptId(db, Number(receiptId));
            setImages(imageRecords);

            // ✅ Set initial selected image
            if (imageRecords.length > 0) {
                setSelectedImageId(imageRecords[0].id);
            } else {
                setSelectedImageId(null); // clear selection if no images
            }
        } catch (error) {
            console.error('Error loading images from DB:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadImages();
    }, [projectId, receiptId]);

    const openViewer = (imageId: number) => {
        setSelectedImageId(imageId);
        setViewerVisible(true);
    };

    const getImageUri = (imageName: string): string => {
        return `${FileSystem.documentDirectory}images/${projectId}/${receiptId}/${imageName}?v=${Date.now()}`;
    };

    const handleAddImage = async () => {
    };

    const handleDeleteImage = () => {
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Preview with Delete Icon */}
            {images.length > 0 && selectedImageId !== null ? (
                <View>
                    <Image
                        source={{
                            uri: getImageUri(
                                images.find((img) => img.id === selectedImageId)?.image_name || ''
                            ),
                        }}
                        style={styles.previewImage}
                        resizeMode="contain"
                    />
                    <TouchableOpacity
                        style={styles.deleteIcon}
                        onPress={handleDeleteImage}
                    >
                        <MaterialIcons name="delete" size={30} color="red" />
                    </TouchableOpacity>
                </View>
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
                <TouchableOpacity
                    onPress={handleAddImage}
                    style={[styles.thumbnailWrapper, styles.addButton]}
                >
                    <AntDesign name="camerao" size={50} color="white" />
                </TouchableOpacity>

                {images.map((image) => (
                    <TouchableOpacity
                        key={image.id}
                        onPress={() => setSelectedImageId(image.id)}
                        style={[
                            styles.thumbnailWrapper,
                            selectedImageId === image.id && styles.activeThumbnail,
                        ]}
                    >
                        <Image source={{ uri: getImageUri(image.image_name) }} style={styles.thumbnail} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Fullscreen Viewer */}
            <ImageViewing
                images={images.map((img) => ({ uri: getImageUri(img.image_name) }))}
                imageIndex={
                    images.findIndex((img) => img.id === selectedImageId)
                }
                visible={viewerVisible}
                onRequestClose={() => setViewerVisible(false)}
            />
        </SafeAreaView>
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
    deleteIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(177, 41, 41, 0.6)',
        padding: 6,
        borderRadius: 20,
        zIndex: 10,
    },
});
