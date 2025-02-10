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
  ScrollView,
  Dimensions,
  Keyboard,
  ToastAndroid,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../services/firebase';

export default function OutfitsScreen({ navigation }) {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadOutfits();
    });

    return unsubscribe;
  }, [navigation]);

  const loadOutfits = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (!user) {
        console.log('Kullanıcı giriş yapmamış');
        return;
      }

      const savedOutfits = await AsyncStorage.getItem(`outfits_${user.uid}`);
      if (savedOutfits) {
        const outfitsData = JSON.parse(savedOutfits);
        console.log('Yüklenen kombinler:', outfitsData);
        setOutfits(outfitsData);
      } else {
        console.log('Kayıtlı kombin bulunamadı');
        setOutfits([]);
      }
    } catch (error) {
      console.error('Kombinler yüklenirken hata:', error);
      Alert.alert('Hata', 'Kombinler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (outfit) => {
    try {
      const user = getCurrentUser();
      if (user) {
        const updatedOutfits = outfits.map(item =>
          item.id === outfit.id ? { ...item, isFavorite: !item.isFavorite } : item
        );
        await AsyncStorage.setItem(`outfits_${user.uid}`, JSON.stringify(updatedOutfits));
        setOutfits(updatedOutfits);
        
        if (Platform.OS === 'android') {
          ToastAndroid.show(
            outfit.isFavorite ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi',
            ToastAndroid.SHORT
          );
        }
      }
    } catch (error) {
      console.error('Favori durumu güncellenirken hata:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Bir hata oluştu', ToastAndroid.SHORT);
      } else {
        Alert.alert('Hata', 'Favori durumu güncellenirken bir hata oluştu');
      }
    }
  };

  const handleDeleteOutfit = async (outfit) => {
    try {
      Alert.alert(
        'Kombini Sil',
        'Bu kombini silmek istediğinizden emin misiniz?',
        [
          {
            text: 'İptal',
            style: 'cancel',
          },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: async () => {
              const user = getCurrentUser();
              if (user) {
                const updatedOutfits = outfits.filter(item => item.id !== outfit.id);
                await AsyncStorage.setItem(`outfits_${user.uid}`, JSON.stringify(updatedOutfits));
                setOutfits(updatedOutfits);
                setModalVisible(false);
                
                if (Platform.OS === 'android') {
                  ToastAndroid.show('Kombin silindi', ToastAndroid.SHORT);
                }
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Kombin silinirken hata:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Bir hata oluştu', ToastAndroid.SHORT);
      } else {
        Alert.alert('Hata', 'Kombin silinirken bir hata oluştu');
      }
    }
  };

  const renderOutfitItem = ({ item }) => {
    if (!item || !item.clothes) return null;
    
    return (
      <TouchableOpacity
        style={styles.outfitItem}
        onPress={() => {
          setSelectedOutfit(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.outfitImagesContainer}>
          {Object.values(item.clothes || {}).map((clothing) => (
            <Image
              key={clothing?.id || Math.random().toString()}
              source={{ uri: clothing?.photo }}
              style={styles.outfitImage}
            />
          ))}
        </View>
        <View style={styles.outfitInfo}>
          <Text style={styles.outfitName}>{item.name || 'Kombin'}</Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleToggleFavorite(item)}
          >
            <Ionicons
              name={item.isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={item.isFavorite ? '#FF3B30' : '#000'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={36} color="#000" />
      </View>
    );
  }

  const filteredOutfits = showFavoritesOnly
    ? outfits.filter(outfit => outfit.isFavorite)
    : outfits;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kombinlerim</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Ionicons
            name={showFavoritesOnly ? 'heart' : 'heart-outline'}
            size={24}
            color={showFavoritesOnly ? '#FF3B30' : '#000'}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOutfits || []}
        renderItem={renderOutfitItem}
        keyExtractor={(item) => item?.id || Math.random().toString()}
        contentContainerStyle={styles.outfitsList}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {showFavoritesOnly
                ? 'Favori kombininiz bulunmuyor.'
                : 'Henüz kombin oluşturmadınız.'}
            </Text>
          </View>
        )}
      />

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
      >
        {selectedOutfit ? (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedOutfit?.name || 'Kombin'}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteOutfit(selectedOutfit)}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {Object.entries(selectedOutfit?.clothes || {}).map(([category, item]) => (
                <View key={item?.id || Math.random().toString()} style={styles.modalClothingItem}>
                  <Image
                    source={{ uri: item?.photo }}
                    style={styles.modalClothingImage}
                  />
                  <Text style={styles.modalClothingCategory}>
                    {category === 'hat' && 'Şapka'}
                    {category === 'top' && 'Üst Giyim'}
                    {category === 'bottom' && 'Alt Giyim'}
                    {category === 'shoes' && 'Ayakkabı'}
                    {category === 'accessory' && 'Aksesuar'}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.favoriteButton]}
                onPress={() => handleToggleFavorite(selectedOutfit)}
              >
                <Ionicons
                  name={selectedOutfit?.isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={selectedOutfit?.isFavorite ? '#FF3B30' : '#000'}
                />
                <Text style={styles.buttonText}>
                  {selectedOutfit?.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => handleDeleteOutfit(selectedOutfit)}
              >
                <Ionicons name="trash-outline" size={24} color="#FFF" />
                <Text style={[styles.buttonText, styles.deleteButtonText]}>
                  Kombini Sil
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
  },
  outfitsList: {
    padding: 16,
  },
  outfitItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outfitImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  outfitImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    margin: 4,
  },
  outfitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outfitName: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalScroll: {
    marginBottom: 16,
  },
  modalClothingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalClothingImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  modalClothingCategory: {
    fontSize: 16,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  favoriteButton: {
    backgroundColor: '#f8f8f8',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
