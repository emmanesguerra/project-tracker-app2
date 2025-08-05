import EditProjectModal from '@/src/components/modal/EditProjectModal';
import EditReceiptModal from '@/src/components/modal/EditReceiptModal';
import { getProjectById, updateProject as saveProjectChanges, updateProjectTotalExpenses } from '@/src/database/project';
import { updateReceipt, useReceipts } from '@/src/database/receipts';
import { styles } from '@/src/styles/global';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProjectPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const db = useSQLiteContext();
    const [project, setProject] = useState<any>(null);
    const [projectName, setProjectName] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalReceiptVisible, setModalReceiptVisible] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

    const [receiptName, setReceiptName] = useState('');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [issuedAt, setIssuedAt] = useState(new Date());
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const { receipts, refreshReceipts } = useReceipts(project?.id);
    const [receiptImages, setReceiptImages] = useState<Record<number, string[]>>({});

    const fetchProject = async () => {
        try {
            const result = await getProjectById(db, Number(id));
            if (result) {
                setProject(result);
                setProjectName(result.name || '');
                setDescription(result.description || '');
                setBudget(result.budget?.toString() || '');
            }
        } catch (error) {
            console.error('Error loading project:', error);
        }
    };

    const handleSave = async () => {
        try {
            await saveProjectChanges(db, project.id, projectName.trim(), description, parseFloat(budget));
            await fetchProject();
            setModalVisible(false);
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    const handleSaveReceiptChanges = async () => {
        if (!selectedReceipt) return;

        try {
            await updateReceipt(db, selectedReceipt.id, {
                name: receiptName.trim(),
                amount: parseFloat(amount),
                categoryId,
                issuedAt: issuedAt.toISOString().split('T')[0], // format YYYY-MM-DD
            });

            await updateProjectTotalExpenses(db, Number(id));

            await refreshReceipts();
            await fetchProject();
            setModalReceiptVisible(false);
        } catch (error) {
            console.error('Error updating receipt:', error);
        }
    };

    const fetchImagesForReceipts = async () => {
        if (!receipts || receipts.length === 0) return;
        const imagesMap: Record<number, string[]> = {};

        for (const receipt of receipts) {
            try {
                const images = await db.getAllAsync<{ image_name: string }>(
                    `SELECT image_name FROM receipt_images WHERE receipt_id = ?`,
                    [receipt.id]
                );
                imagesMap[receipt.id] = images.map((img) => img.image_name);
            } catch (error) {
                console.error(`Error loading images for receipt ${receipt.id}:`, error);
            }
        }

        setReceiptImages(imagesMap);
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    useEffect(() => {
        if (receipts.length > 0) {
            fetchImagesForReceipts();
        }
    }, [receipts]);

    if (!project) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <Text>Loading project...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.pageTitle}>{project.name}</Text>

            <TouchableOpacity style={styles.box} onPress={() => setModalVisible(true)}>
                {project.description && project.description.length > 0 && (
                    <Text style={styles.label}>{project.description}</Text>
                )}
                {project.budget != null && project.budget !== 0 && (
                    <Text style={styles.label}>Budget: ₱{project.budget}</Text>
                )}
                <Text style={styles.label}>Expense: ₱{project.total_expense}</Text>
                <Text style={[styles.label, styles.small]}>Create: {project.created_at}</Text>
                <Text style={[styles.label, styles.small]}>Update: {project.updated_at}</Text>
            </TouchableOpacity>

            <View style={styles.receiptHeader}>
                <Text style={styles.receiptTitle}>Receipts</Text>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() =>
                        router.push(
                            `/receipts/new?projectId=${project.id}&projectName=${encodeURIComponent(project.name)}`
                        )
                    }
                >
                    <Text style={styles.addButtonText}>+ Add receipt</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={receipts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.receiptCard}>
                        <TouchableOpacity
                            style={styles.receiptCardLeft}
                            onPress={() => {
                                setSelectedReceipt(item);
                                setReceiptName(item.name);
                                setAmount(item.amount.toString());
                                setCategoryId(item.category_id);
                                setIssuedAt(new Date(item.issued_at));
                                setModalReceiptVisible(true);
                            }}
                        >
                            <Text style={styles.receiptName}>{item.name}</Text>
                            <Text style={styles.receiptAmount}>₱{item.amount.toFixed(2)}</Text>
                            <Text style={styles.receiptCategory}>{item.category_name}</Text>
                            <Text style={styles.receiptDate}>Issued At: {item.issued_at}</Text>
                        </TouchableOpacity>

                        <View style={styles.receiptCardRight}>
                            {receiptImages[item.id]?.length > 0 && (
                                <ScrollView horizontal style={styles.imageScroll}>
                                    {receiptImages[item.id].map((uri, index) => (
                                        <Image
                                            key={index}
                                            source={{ uri }}
                                            style={styles.image}
                                            resizeMode="cover"
                                        />
                                    ))}
                                </ScrollView>
                            )}

                            <TouchableOpacity
                                style={styles.viewGalleryButton}
                                onPress={() =>
                                    router.push({
                                        pathname: '/gallery',
                                        params: {
                                            projectId: project.id,
                                            receiptId: item.id,
                                        },
                                    })
                                }
                            >
                                <Text style={styles.viewGalleryText}>
                                    <MaterialIcons name="attachment" size={16} color="white" /> Images
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No receipts found for this project.</Text>
                }
            />

            <EditProjectModal
                visible={modalVisible}
                projectName={projectName}
                setProjectName={setProjectName}
                description={description}
                setDescription={setDescription}
                budget={budget}
                setBudget={setBudget}
                onCancel={() => setModalVisible(false)}
                onSave={handleSave}
            />

            <EditReceiptModal
                visible={modalReceiptVisible}
                receiptName={receiptName}
                setReceiptName={setReceiptName}
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                amount={amount}
                setAmount={setAmount}
                issuedAt={issuedAt}
                setIssuedAt={setIssuedAt}
                onCancel={() => setModalReceiptVisible(false)}
                onSave={handleSaveReceiptChanges}
            />
        </SafeAreaView>
    );
}
