import CreateProjectModal from '@/src/components/modal/CreateProjectModal';
import { addProject, useProjects } from '@/src/database/project';
import { styles } from '@/src/styles/global';
import { exportDataToCSV } from '@/src/utils/exportCsv';
import Octicons from '@expo/vector-icons/Octicons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomePage() {
  const { projects, refreshProjects, db } = useProjects();
  const [modalVisible, setModalVisible] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      await addProject(db, newProjectName.trim());
      await refreshProjects();
      setNewProjectName('');
      setModalVisible(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleExport = async () => {
    await exportDataToCSV(db);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Projects</Text>

        <Pressable style={styles.createButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.createButtonText}>+ Create New Project</Text>
        </Pressable>
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Link
            href={{ pathname: '/project/[id]', params: { id: item.id.toString() } }}
            asChild
          >
            <Pressable style={styles.projectItem}>
              <View style={styles.projectHeader}>
                <Octicons name="project" size={20} color="#333" style={styles.projectIcon} />
                <Text style={styles.projectName}>{item.name}</Text>
              </View>

              {item.description && item.description.length > 0 && (
                <Text style={styles.projectDescription}>{item.description}</Text>
              )}

              {item.budget != null && item.budget !== 0 && (
                <Text style={styles.projectBudget}>Budget: ₱{item.budget}</Text>
              )}

              <Text style={styles.projectDate}>Created: {item.created_at}</Text>
            </Pressable>
          </Link>
        )}
      />


      <TouchableOpacity onPress={handleExport}>
        <Text>Export to CSV</Text>
      </TouchableOpacity>


      <TouchableOpacity onPress={handleExport}>
        <Text>Export All Uploaded Images</Text>
      </TouchableOpacity>

      <CreateProjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleCreateProject}
        newProjectName={newProjectName}
        setNewProjectName={setNewProjectName}
      />
    </SafeAreaView>
  );
}
