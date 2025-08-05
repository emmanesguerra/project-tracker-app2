import { styles } from '@/src/styles/global';
import React from 'react';
import { Button, Modal, Text, TextInput, View } from 'react-native';

interface CategoryModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    categoryName: string;
    setCategoryName: (name: string) => void;
}

export default function CategoryModal({
    visible,
    onClose,
    onSave,
    categoryName,
    setCategoryName,
}: CategoryModalProps) {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.pageTitle}>New Category</Text>
                    <TextInput
                        placeholder="Category name"
                        value={categoryName}
                        onChangeText={setCategoryName}
                        style={styles.input}
                    />
                    <View style={styles.actions}>
                        <Button title="Cancel" color="gray" onPress={onClose} />
                        <Button title="Save" onPress={onSave} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}