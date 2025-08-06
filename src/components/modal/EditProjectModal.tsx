import { styles } from '@/src/styles/global';
import { FC, useState } from 'react';
import { Button, Modal, Text, TextInput, View } from 'react-native';

interface EditProjectModalProps {
    visible: boolean;
    projectName: string;
    setProjectName: (text: string) => void;
    description: string;
    budget: string;
    setDescription: (text: string) => void;
    setBudget: (value: string) => void;
    onCancel: () => void;
    onSave: () => void;
    onDelete: () => void;
}

const EditProjectModal: FC<EditProjectModalProps> = ({
    visible,
    projectName,
    description,
    budget,
    setProjectName,
    setDescription,
    setBudget,
    onCancel,
    onSave,
    onDelete
}) => {

    const [rawAmount, setRawAmount] = useState(budget);

    const getFormattedAmount = (value: string) => {
        if (!value) return '';
        return Number(value).toLocaleString(); // adds commas
    };

    const handleChange = (text: string) => {
        // Remove all non-digit characters
        const clean = text.replace(/[^0-9]/g, '');
        setRawAmount(clean);
        setBudget(clean);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.pageTitle}>Edit Project</Text>

                    <Text style={styles.label}>Project Name</Text>
                    <TextInput
                        value={projectName}
                        onChangeText={setProjectName}
                        placeholder="Enter project name"
                        style={styles.input}
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        placeholder="Enter project description"
                        style={styles.textArea}
                    />

                    <Text style={styles.label}>Budget</Text>
                    <TextInput
                        value={getFormattedAmount(rawAmount)} // display formatted
                        onChangeText={handleChange}
                        placeholder="Enter budget"
                        keyboardType="numeric"
                        style={styles.input}
                    />

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

export default EditProjectModal;

