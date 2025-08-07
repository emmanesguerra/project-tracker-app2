import { AntDesign, Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
    imageUris: string[];
    onImageChange: (uris: string[]) => void;
};

export default function ImageCaptureContainer({ imageUris, onImageChange }: Props) {
    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera access is required.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });

        if (!result.canceled) {
            onImageChange([...imageUris, result.assets[0].uri]);
        }
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

        if (!result.canceled) {
            onImageChange([...imageUris, result.assets[0].uri]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
                    <AntDesign name="camerao" size={20} color="white" style={styles.icon} />
                    <Text style={styles.buttonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handlePickImage}>
                    <Entypo name="image" size={20} color="white" style={styles.icon} />
                    <Text style={styles.buttonText}>Pick from Gallery</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal style={styles.imageRow}>
                {imageUris.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.preview} />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    imageRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    preview: {
        width: 100,
        height: 150,
        borderRadius: 6,
        marginRight: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 20,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 6,
        justifyContent: 'center',
    },
    icon: {
        marginRight: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});
