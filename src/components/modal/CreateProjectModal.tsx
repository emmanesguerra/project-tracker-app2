import { styles } from '@/src/styles/global';
import { FC } from 'react';
import {
    Modal,
    Pressable,
    Text,
    TextInput,
    View
} from 'react-native';

interface CreateProjectModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    newProjectName: string;
    setNewProjectName: (name: string) => void;
}

const CreateProjectModal: FC<CreateProjectModalProps> = ({
    visible,
    onClose,
    onSave,
    newProjectName,
    setNewProjectName,
}) => {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>New Project Name</Text>
                    <TextInput
                        placeholder="Enter project name"
                        value={newProjectName}
                        onChangeText={setNewProjectName}
                        style={styles.input}
                    />

                    <View style={styles.buttonGroup}>
                        <Pressable onPress={onClose} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>

                        <Pressable onPress={onSave} style={styles.saveButton}>
                            <Text style={styles.saveText}>Save</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default CreateProjectModal;
