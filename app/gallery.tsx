import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';

const { width, height } = Dimensions.get('window');

const GalleryPage = () => {
    const { projectId, receiptId } = useLocalSearchParams();
    const [imageUris, setImageUris] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadImages = async () => {
            try {
                const folderPath = `${FileSystem.documentDirectory}images/${projectId}/${receiptId}/`;
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

    if (!imageUris.length) {
        return (
            <View style={styles.centered}>
                <Text style={styles.emptyText}>No images found.</Text>
            </View>
        );
    }

    const imageObjects = imageUris.map(uri => ({ uri }));

    return (
        <View style={styles.container}>
            {/* Top Preview Image */}
            <TouchableOpacity onPress={() => openViewer(selectedIndex)} activeOpacity={0.9}>
                <Image
                    source={{ uri: imageUris[selectedIndex] }}
                    style={styles.previewImage}
                    resizeMode="contain"
                />
            </TouchableOpacity>

            {/* Thumbnail Scroll */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailScroll}
            >
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
                images={imageObjects}
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
    },
    thumbnailWrapper: {
        marginRight: 10,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeThumbnail: {
        borderColor: '#007bff',
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
});
