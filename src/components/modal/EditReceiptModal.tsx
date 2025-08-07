import { useCategories } from '@/src/database/categories';
import { styles } from '@/src/styles/global';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FC, useEffect, useState } from 'react';
import {
    Button,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

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

    useEffect(() => {
        setRawAmount(amount);
    }, [amount]);

    const handleDateChange = (_: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setIssuedAt(selectedDate);
    };

    const getFormattedAmount = (value: string) => {
        if (!value) return '';
        return Number(value).toLocaleString();
    };

    const handleChange = (text: string) => {
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
                    <View style={pickerStyles.wrapper}>
                        <RNPickerSelect
                            onValueChange={(value) => setCategoryId(value)}
                            value={categoryId}
                            placeholder={{ label: 'Select a category', value: null }}
                            items={categories.map((cat) => ({
                                label: cat.name,
                                value: cat.id,
                            }))}
                            style={pickerStyles}
                            useNativeAndroidPickerStyle={false}
                        />
                    </View>

                    <Text style={styles.label}>Amount (₱)</Text>
                    <TextInput
                        value={getFormattedAmount(rawAmount)}
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

const pickerStyles = StyleSheet.create({
    wrapper: {
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 6,
        marginBottom: 16,
    },
    inputIOS: {
        paddingVertical: 12,
        paddingHorizontal: 10,
        color: 'black',
    },
    inputAndroid: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        color: 'black',
    },
    placeholder: {
        color: '#888',
    },
});