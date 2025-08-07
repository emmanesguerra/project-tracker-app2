import { useCategories } from '@/src/database/categories';
import { styles } from '@/src/styles/global';
import DateTimePicker from '@react-native-community/datetimepicker';
// Removed Picker
// import { Picker } from '@react-native-picker/picker';
import { FC, useEffect, useState } from 'react';
import { Button, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker'; // ✅ ADDED

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

    // ✅ DropDownPicker State
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<{ label: string; value: number }[]>([]);

    useEffect(() => {
        setRawAmount(amount);
    }, [amount]);

    useEffect(() => {
        const categoryItems = categories.map((cat) => ({
            label: cat.name,
            value: cat.id,
        }));
        setItems(categoryItems);
    }, [categories]);

    const handleDateChange = (_: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setIssuedAt(selectedDate);
    };

    const getFormattedAmount = (value: string) => {
        if (!value) return '';
        return Number(value).toLocaleString(); // adds commas
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
                    <View style={{ zIndex: 9999 }}>
                        <DropDownPicker
                            open={open}
                            setOpen={setOpen}
                            value={categoryId}
                            setValue={(val) => {
                                if (typeof val === 'function') {
                                    setCategoryId(val(categoryId)); // safely call the callback
                                } else {
                                    setCategoryId(val);
                                }
                            }}
                            items={items}
                            setItems={setItems}
                            placeholder="Select Category"
                            style={[
                                styles.input, // your global/base style
                                { marginBottom: open ? 120 : 16 } // conditional style
                            ]}
                            dropDownContainerStyle={{ zIndex: 9999, borderColor: '#ccc' }}
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
