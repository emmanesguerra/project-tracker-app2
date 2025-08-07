import ImageCaptureContainer from '@/src/components/ImageCaptureContainer';
import CategoryModal from '@/src/components/modal/CategoryModal';
import { addCategory, useCategories } from '@/src/database/categories';
import { updateProjectTotalExpenses } from '@/src/database/project';
import { addReceipt, addReceiptImage } from '@/src/database/receipts';
import { styles } from '@/src/styles/global';
import { generateImageFilename } from '@/src/utils/filename';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewReceiptPage() {
    const { projectId, projectName } = useLocalSearchParams();
    const numericProjectId = Number(projectId);
    const db = useSQLiteContext();
    const router = useRouter();

    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [issuedAt, setIssuedAt] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [categoryId, setCategoryId] = useState<number | null>(null);

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const { categories, refreshCategories } = useCategories();
    const [imageUris, setImageUris] = useState<string[]>([]);
    const [rawAmount, setRawAmount] = useState('');

    const handleSave = async () => {
        if (!name || !amount || isNaN(Number(amount))) {
            Alert.alert('Validation Error', 'Please enter valid name and amount.');
            return;
        }

        try {
            const newReceiptId = await addReceipt(
                db,
                numericProjectId,
                categoryId,
                name,
                parseFloat(amount.replace(/,/g, '')),
                issuedAt.toISOString().slice(0, 10)
            );

            for (let i = 0; i < imageUris.length; i++) {
                const uri = imageUris[i];

                const filename = generateImageFilename(numericProjectId, newReceiptId, i + 1);
                const folderPath = `images/${projectId}/${newReceiptId}`;
                const newPath = `${FileSystem.documentDirectory}${folderPath}/${filename}`;

                // Ensure directory exists
                await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}${folderPath}`, {
                    intermediates: true,
                });

                // Copy image to app storage
                await FileSystem.copyAsync({ from: uri, to: newPath });

                // Save to database
                await addReceiptImage(db, newReceiptId, filename);
            }

            await updateProjectTotalExpenses(db, numericProjectId);

            Alert.alert('Success', 'Receipt added');
            router.back();
        } catch (err) {
            console.error('Failed to save receipt', err);
            Alert.alert('Error', 'Could not save receipt.');
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            Alert.alert('Validation Error', 'Category name cannot be empty.');
            return;
        }

        try {
            await addCategory(db, newCategoryName.trim());
            setNewCategoryName('');
            setShowCategoryModal(false);
            await refreshCategories();
        } catch (error) {
            Alert.alert('Error', 'Failed to add category.');
        }
    };

    const onDateChange = (_: any, date?: Date) => {
        setShowDatePicker(false);
        if (date) {
            setIssuedAt(date);
        }
    };

    const handleCancel = () => {
        router.back(); // This navigates back to the previous screen
    };

    const getFormattedAmount = (value: string) => {
        if (!value) return '';
        return Number(value).toLocaleString(); // adds commas
    };

    const handleChange = (text: string) => {
        // Remove all non-digit characters
        const clean = text.replace(/[^0-9]/g, '');
        setRawAmount(clean);
        setAmount(clean);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.pageSubtitle}>{projectName ? `Receipt for` : 'New Receipt'}</Text>
            <Text style={styles.pageTitle}>{projectName ? `${projectName}` : 'New Receipt'}</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter receipt name"
                style={styles.input}
            />

            <View style={styles.categoryHeader}>
                <Text style={styles.label}>Category</Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(true)}>
                    <Text style={styles.addCategory}>+ Add New Category</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.pickerWrapper}>
                <Picker selectedValue={categoryId} onValueChange={(itemValue) => setCategoryId(itemValue)}>
                    <Picker.Item label="Select Category" value={null} />
                    {categories.map((category) => (
                        <Picker.Item key={category.id} label={category.name} value={category.id} />
                    ))}
                </Picker>
            </View>

            <View style={styles.row}>
                <View style={styles.halfInputContainer}>
                    <Text style={styles.label}>Amount (₱)</Text>
                    <TextInput
                        value={getFormattedAmount(rawAmount)} // display formatted
                        onChangeText={handleChange}
                        placeholder="Enter amount"
                        keyboardType="numeric"
                        style={styles.input}
                    />
                </View>

                <View style={styles.halfInputContainer}>
                    <Text style={styles.label}>Issued At</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                        <Text>{issuedAt.toISOString().slice(0, 10)}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.label}>Receipt Image</Text>
            <ImageCaptureContainer imageUris={imageUris} onImageChange={setImageUris} />

            {showDatePicker && (
                <DateTimePicker
                    value={issuedAt}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                />
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleCancel} style={styles.cancelButton2}>
                    <Text style={styles.cancelText2}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSave} style={styles.saveButton2}>
                    <Text style={styles.saveButtonText2}>Save Receipt</Text>
                </TouchableOpacity>
            </View>

            <CategoryModal
                visible={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                onSave={handleAddCategory}
                categoryName={newCategoryName}
                setCategoryName={setNewCategoryName}
            />
        </SafeAreaView>
    );
}