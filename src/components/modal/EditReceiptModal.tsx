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
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { categories } = useCategories();

    const handleDateChange = (_: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setIssuedAt(selectedDate);
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
                        value={amount}
                        onChangeText={setAmount}
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

                    <View style={styles.actions}>
                        <Button title="Cancel" color="gray" onPress={onCancel} />
                        <Button title="Save" onPress={onSave} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default EditReceiptModal;
