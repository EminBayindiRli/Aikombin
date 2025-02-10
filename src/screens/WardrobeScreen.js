import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  ToastAndroid,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../services/firebase';
import * as ImagePicker from 'expo-image-picker';

export default function WardrobeScreen({ navigation }) {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedClothes, setSelectedClothes] = useState({});
  const [showCreateOutfitModal, setShowCreateOutfitModal] = useState(false);

  const categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'hat', name: 'Şapka' },
    { id: 'top', name: 'Üst Giyim' },
    { id: 'bottom', name: 'Alt Giyim' },
    { id: 'shoes', name: 'Ayakkabı' },
    { id: 'accessory', name: 'Aksesuar' },
  ];

  useEffect(() => {
    loadWardrobe();
  }, [selectedCategory]);

  const loadWardrobe = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (!user) {
        console.log('Kullanıcı giriş yapmamış');
        return;
      }

      const savedClothes = await AsyncStorage.getItem(`clothes_${user.uid}`);
      if (savedClothes) {
        const clothesData = JSON.parse(savedClothes);
        if (selectedCategory === 'all') {
          setClothes(clothesData);
        } else {
          setClothes(clothesData.filter(item => item.category === selectedCategory));
        }
        console.log('Yüklenen kıyafetler:', clothesData);
      } else {
        console.log('Kayıtlı kıyafet bulunamadı');
        setClothes([]);
      }
    } catch (error) {
      console.error('Gardırop yüklenirken hata:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Kıyafetler yüklenirken bir hata oluştu', ToastAndroid.SHORT);
      } else {
        Alert.alert('Hata', 'Kıyafetler yüklenirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Kamera izni gerekli', ToastAndroid.SHORT);
        } else {
          Alert.alert('İzin Gerekli', 'Kamera izni gerekli');
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedPhoto(result.assets[0].uri);
        setShowTagModal(true);
      }
    } catch (error) {
      console.error('Kamera hatası:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Kamera açılırken bir hata oluştu', ToastAndroid.SHORT);
      } else {
        Alert.alert('Hata', 'Kamera açılırken bir hata oluştu');
      }
    }
  };

  const handleAddClothes = async (category) => {
    try {
      const user = getCurrentUser();
      if (!user) {
        alert('Lütfen giriş yapın');
        return;
      }

      // Kayıt işlemi başlıyor mesajı
      if (Platform.OS === 'android') {
        ToastAndroid.show('Kıyafet kaydediliyor...', ToastAndroid.SHORT);
      } else {
        Alert.alert('Kaydediliyor', 'Kıyafet kaydediliyor...');
      }

      // Mevcut kıyafetleri al
      const savedClothes = await AsyncStorage.getItem(`clothes_${user.uid}`);
      const currentClothes = savedClothes ? JSON.parse(savedClothes) : [];

      // Yeni kıyafeti ekle
      const newClothes = {
        id: Date.now().toString(),
        userId: user.uid,
        photo: selectedPhoto,
        category: category,
        createdAt: new Date().toISOString(),
      };

      const updatedClothes = [newClothes, ...currentClothes];
      await AsyncStorage.setItem(`clothes_${user.uid}`, JSON.stringify(updatedClothes));
      console.log('Kıyafet kaydedildi');
      
      // State'i temizle
      setSelectedPhoto(null);
      setShowTagModal(false);
      
      // Başarılı mesajı göster
      if (Platform.OS === 'android') {
        ToastAndroid.show('Kıyafet başarıyla kaydedildi!', ToastAndroid.LONG);
      } else {
        Alert.alert('Başarılı', 'Kıyafet başarıyla kaydedildi!');
      }
      
      // Listeyi yenile
      loadWardrobe();
    } catch (error) {
      console.error('Kıyafet kaydedilirken hata:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const handleCreateOutfit = () => {
    setShowCreateOutfitModal(true);
  };

  const handleCloseCreateOutfitModal = () => {
    setShowCreateOutfitModal(false);
    setSelectedClothes({});
  };

  const renderClothingItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.clothingItem, selectedClothes[item.id] && styles.selectedClothingItem]}
      onPress={() => {
        if (selectedClothes[item.id]) {
          const newSelectedClothes = { ...selectedClothes };
          delete newSelectedClothes[item.id];
          setSelectedClothes(newSelectedClothes);
        } else {
          setSelectedClothes(prev => ({
            ...prev,
            [item.id]: item
          }));
        }
      }}
    >
      <Image source={{ uri: item.photo }} style={styles.clothingImage} />
      <View style={styles.clothingInfo}>
        <Text style={styles.clothingCategory}>
          {categories.find(cat => cat.id === item.category)?.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyListComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {selectedCategory === 'all'
            ? 'Henüz kıyafet eklenmemiş.'
            : `${categories.find(cat => cat.id === selectedCategory)?.name} kategorisinde kıyafet bulunamadı.`}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={36} color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gardırobum</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleTakePhoto}
          >
            <Ionicons name="camera-outline" size={24} color="#fff" />
            <Text style={styles.headerButtonText}>Kıyafet Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { marginLeft: 8 }]}
            onPress={() => setShowCreateOutfitModal(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text style={styles.headerButtonText}>Kombin Oluştur</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterButton,
              selectedCategory === category.id && styles.selectedFilter,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedCategory === category.id && styles.selectedFilterText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={clothes}
        renderItem={renderClothingItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.clothingGrid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyListComponent />}
      />



      {/* Etiket Seçme Modalı */}
      <Modal
        isVisible={showTagModal}
        onBackdropPress={() => setShowTagModal(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Kıyafet Türünü Seçin</Text>
          {categories
            .filter(category => category.id !== 'all')
            .map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.tagButton}
                onPress={() => handleAddClothes(category.id)}
              >
                <Text style={styles.tagButtonText}>{category.name}</Text>
              </TouchableOpacity>
            ))
          }
        </View>
      </Modal>

      {/* Kombin Oluşturma Modalı */}
      <Modal
        isVisible={showCreateOutfitModal}
        onBackdropPress={() => setShowCreateOutfitModal(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Kombin Oluştur</Text>
          <TouchableOpacity
            style={[styles.outfitButton, styles.activeButton]}
            onPress={() => {
              setShowCreateOutfitModal(false);
              navigation.navigate('CreateOutfit');
            }}
          >
            <Text style={styles.outfitButtonText}>Kendin Kombin Yap</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.outfitButton, styles.inactiveButton]}
            disabled={true}
          >
            <Text style={[styles.outfitButtonText, styles.inactiveText]}>
              AI ile Kombin Yap (Yakında)
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  selectedClothingItem: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  headerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  headerButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    marginTop: Platform.OS === 'ios' ? 44 : 16,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedFilter: {
    backgroundColor: '#000',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedFilterText: {
    color: '#fff',
  },
  clothingGrid: {
    padding: 8,
  },
  clothingItem: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  clothingImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  clothingInfo: {
    padding: 8,
  },
  clothingCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  tagButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  tagButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000',
  },
  outfitButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  activeButton: {
    backgroundColor: '#000',
  },
  inactiveButton: {
    backgroundColor: '#f0f0f0',
  },
  outfitButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
  },
  inactiveText: {
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  }
});
