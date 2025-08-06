import { useCategories } from '@/src/database/categories';
import { styles } from '@/src/styles/global';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { FC, useState } from 'react';
import { Button, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface EditReceiptModalProps {
    visible: boolean;
    receiptName: string;
    setReceiptName: (text: string) => void;
    categoryId: number | null;
    setCategoryId: (id: number | null) => void;
    amount: string;
    setAmount: (value: string) => void;
    issuedAt: Date;
    setIssuedAt: (date: Date) => void;
    onCancel: () => void;
    onSave: () => void;
    onDelete: () => void;
}

const EditReceiptModal: FC<EditReceiptModalProps> = ({
    visible,
    receiptName,
    setReceiptName,
    categoryId,
    setCategoryId,
    amount,
    setAmount,
    issuedAt,
    setIssuedAt,
    onCancel,
    onSave,
    onDelete,
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { categories } = useCategories();
    const [rawAmount, setRawAmount] = useState(amount);

    const handleDateChange = (_: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setIssuedAt(selectedDate);
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
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.pageTitle}>Edit Receipt</Text>

                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        value={receiptName}
                        onChangeText={setReceiptName}
                        placeholder="Enter receipt name"
                        style={styles.input}
                    />

                    <Text style={styles.label}>Category</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={categoryId}
                            onValueChange={(itemValue) => setCategoryId(itemValue)}
                        >
                            <Picker.Item label="Select Category" value={null} />
                            {categories.map((category) => (
                                <Picker.Item key={category.id} label={category.name} value={category.id} />
                            ))}
                        </Picker>
                    </View>

                    <Text style={styles.label}>Amount (₱)</Text>
                    <TextInput
                        value={getFormattedAmount(rawAmount)} // display formatted
                        onChangeText={handleChange}
                        placeholder="Enter amount"
                        keyboardType="numeric"
                        style={styles.input}
                    />

                    <Text style={styles.label}>Issued At</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                        <Text>{issuedAt.toISOString().slice(0, 10)}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={issuedAt}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                        />
                    )}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                        <View>
                            <Button title="Delete" color="red" onPress={onDelete} />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <Button title="Cancel" color="gray" onPress={onCancel} />
                            <Button title="Save" onPress={onSave} />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default EditReceiptModal;
