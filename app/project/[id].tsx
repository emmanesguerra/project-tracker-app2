import EditProjectModal from '@/src/components/modal/EditProjectModal';
import EditReceiptModal from '@/src/components/modal/EditReceiptModal';
import { useCategories } from '@/src/database/categories';
import { deleteProjectAndReceipts, getProjectById, updateProject as saveProjectChanges, updateProjectTotalExpenses } from '@/src/database/project';
import { deleteReceipt, getImagesByReceiptId, updateReceipt, useReceipts } from '@/src/database/receipts';
import { styles } from '@/src/styles/global';
import { deleteProjectFolder, deleteReceiptFolder } from '@/src/utils/imageUtils';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// Removed Picker import
// import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker'; // ✅ ADDED
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
    const [receiptImages, setReceiptImages] = useState<Record<number, string[]>>({});
    const [searchText, setSearchText] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const { receipts, refreshReceipts } = useReceipts(project?.id, searchText, selectedFilter);
    const { categories } = useCategories();

    // ✅ DropDownPicker states
    const [open, setOpen] = useState(false);
    const [filterValue, setFilterValue] = useState<string | null>(null);
    const [filterItems, setFilterItems] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        setSelectedFilter(filterValue);
    }, [filterValue]);

    useEffect(() => {
        const items = categories.map(c => ({
            label: c.name,
            value: c.id.toString()
        }));
        setFilterItems([{ label: 'All Categories', value: '' }, ...items]);
    }, [categories]);

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
                issuedAt: issuedAt.toISOString().split('T')[0],
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
        if (!receipts || receipts.length === 0 || !project?.id) return;

        const imagesMap: Record<number, string[]> = {};

        for (const receipt of receipts) {
            try {
                const imageRecords = await getImagesByReceiptId(db, receipt.id);
                const folderPath = `${FileSystem.documentDirectory}images/${project.id}/${receipt.id}/`;

                const fullPaths: string[] = [];

                for (const img of imageRecords) {
                    const fileUri = `${folderPath}${img.image_name}`;
                    const fileInfo = await FileSystem.getInfoAsync(fileUri);
                    if (fileInfo.exists) {
                        fullPaths.push(fileUri);
                    }
                }

                if (fullPaths.length > 0) {
                    imagesMap[receipt.id] = fullPaths;
                }

            } catch (error) {
                console.error(`Error loading images for receipt ${receipt.id}:`, error);
            }
        }

        setReceiptImages(imagesMap);
    };

    const handleDeleteProject = async () => {
        if (!project) return;

        try {
            const projectId = Number(project.id);
            await deleteProjectFolder(projectId);
            await deleteProjectAndReceipts(db, projectId);
            router.back();
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const handleDeleteReceipt = async () => {
        if (!selectedReceipt) return;

        try {
            await deleteReceiptFolder(Number(id), selectedReceipt.id);
            await deleteReceipt(db, Number(id), selectedReceipt.id);

            await updateProjectTotalExpenses(db, Number(id));
            await refreshReceipts();
            await fetchProject();

            setModalReceiptVisible(false);
        } catch (error) {
            console.error('Error deleting receipt:', error);
        }
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
        <View style={styles.container}>
            <Text style={styles.pageTitle}>{project.name}</Text>

            <TouchableOpacity style={styles.box} onPress={() => setModalVisible(true)}>
                {project.description?.length > 0 && (
                    <Text style={styles.label}>{project.description}</Text>
                )}
                {project.budget != null && project.budget !== 0 && (
                    <Text style={styles.label}>Budget: ₱{Number(project.budget).toLocaleString()}</Text>
                )}
                <Text style={styles.label}>Expense: ₱{Number(project.total_expense).toLocaleString()}</Text>
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

            <View style={{ flexDirection: 'row', gap: 10, zIndex: 1000 }}>
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Search receipts..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
                <View style={{ flex: 1 }}>
                    <DropDownPicker
                        open={open}
                        setOpen={setOpen}
                        value={filterValue}
                        setValue={setFilterValue}
                        items={filterItems}
                        setItems={setFilterItems}
                        placeholder="Filter By"
                        style={[
                            styles.input, // your global/base style
                            { height: 40 } // conditional style
                        ]}
                        dropDownContainerStyle={{ zIndex: 1000, borderColor: '#ccc' }}
                    />
                </View>
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
                            <Text style={styles.receiptAmount}>₱{Number(item.amount).toLocaleString()}</Text>
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
                onDelete={handleDeleteProject}
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
                onDelete={handleDeleteReceipt}
            />
        </View>
    );
}
