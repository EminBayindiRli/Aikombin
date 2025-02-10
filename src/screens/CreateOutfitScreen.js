import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ToastAndroid,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../services/firebase';

const categories = [
  { id: 'hat', name: 'Şapka' },
  { id: 'top', name: 'Üst Giyim' },
  { id: 'bottom', name: 'Alt Giyim' },
  { id: 'shoes', name: 'Ayakkabı' },
  { id: 'accessory', name: 'Aksesuar' },
];

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2;

export default function CreateOutfitScreen({ navigation }) {
  const [clothes, setClothes] = useState({});
  const [selectedClothes, setSelectedClothes] = useState({});
  const [outfitName, setOutfitName] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllClothes();
  }, []);

  const loadAllClothes = async () => {
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
        const categorizedClothes = {};
        
        categories.forEach(category => {
          categorizedClothes[category.id] = clothesData.filter(
            item => item.category === category.id
          );
        });
        
        setClothes(categorizedClothes);
      }
    } catch (error) {
      console.error('Kıyafetler yüklenirken hata:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Kıyafetler yüklenirken bir hata oluştu', ToastAndroid.SHORT);
      } else {
        Alert.alert('Hata', 'Kıyafetler yüklenirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClothes = (item, category) => {
    setSelectedClothes(prev => {
      const newSelectedClothes = { ...prev };
      if (prev[category]?.id === item.id) {
        delete newSelectedClothes[category];
      } else {
        newSelectedClothes[category] = item;
      }
      return newSelectedClothes;
    });
  };

  const handleFinish = () => {
    if (Object.keys(selectedClothes).length === 0) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('En az bir kıyafet seçmelisiniz', ToastAndroid.SHORT);
      } else {
        Alert.alert('Uyarı', 'En az bir kıyafet seçmelisiniz.');
      }
      return;
    }
    setShowNameModal(true);
  };

  const saveOutfit = async () => {
    try {
      const user = getCurrentUser();
      if (!user) {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Lütfen giriş yapın', ToastAndroid.SHORT);
        } else {
          Alert.alert('Uyarı', 'Lütfen giriş yapın');
        }
        return;
      }

      if (!outfitName.trim()) {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Lütfen kombininize bir isim verin', ToastAndroid.SHORT);
        } else {
          Alert.alert('Uyarı', 'Lütfen kombininize bir isim verin.');
        }
        return;
      }

      const savedOutfits = await AsyncStorage.getItem(`outfits_${user.uid}`);
      const currentOutfits = savedOutfits ? JSON.parse(savedOutfits) : [];

      const newOutfit = {
        id: Date.now().toString(),
        userId: user.uid,
        name: outfitName,
        clothes: selectedClothes,
        createdAt: new Date().toISOString(),
        isFavorite: false,
      };

      const updatedOutfits = [newOutfit, ...currentOutfits];
      await AsyncStorage.setItem(`outfits_${user.uid}`, JSON.stringify(updatedOutfits));

      if (Platform.OS === 'android') {
        ToastAndroid.show('Kombin başarıyla kaydedildi!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Başarılı', 'Kombin başarıyla kaydedildi!');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Kombin kaydedilirken hata:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Bir hata oluştu', ToastAndroid.SHORT);
      } else {
        Alert.alert('Hata', 'Kombin kaydedilirken bir hata oluştu.');
      }
    }
  };

  const renderClothingItem = (item, category) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.clothingItem,
        selectedClothes[category]?.id === item.id && styles.selectedItem
      ]}
      onPress={() => handleSelectClothes(item, category)}
    >
      <Image source={{ uri: item.photo }} style={styles.clothingImage} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (Object.keys(selectedClothes).length > 0) {
              Alert.alert(
                'Uyarı',
                'Yaptığınız değişiklikler kaydedilmeyecek. Çıkmak istediğinize emin misiniz?',
                [
                  {
                    text: 'İptal',
                    style: 'cancel',
                  },
                  {
                    text: 'Çık',
                    style: 'destructive',
                    onPress: () => navigation.goBack(),
                  },
                ],
                { cancelable: true }
              );
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Kombin Oluştur</Text>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishText}>Bitir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {categories.map(category => (
          <View key={category.id} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clothesRow}>
              {clothes[category.id]?.map(item => renderClothingItem(item, category.id))}
              {(!clothes[category.id] || clothes[category.id].length === 0) && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Bu kategoride kıyafet yok</Text>
                </View>
              )}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      <Modal
        isVisible={showNameModal}
        onBackdropPress={() => setShowNameModal(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Kombine İsim Ver</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Yaz Kombini"
            value={outfitName}
            onChangeText={setOutfitName}
            autoFocus
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveOutfit}
          >
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  finishButton: {
    padding: 8,
  },
  finishText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  clothesRow: {
    flexGrow: 0,
  },
  clothingItem: {
    width: itemWidth,
    marginRight: 12,
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
  selectedItem: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  clothingImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    minWidth: itemWidth,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  }
});
