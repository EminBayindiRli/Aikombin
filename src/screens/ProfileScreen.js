import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../services/firebase';

export default function ProfileScreen({ navigation }) {
  const [outfits, setOutfits] = useState([]);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadOutfits();
    });

    return unsubscribe;
  }, [navigation]);

  const loadOutfits = async () => {
    setLoading(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        console.log('Kullanıcı giriş yapmamış');
        return;
      }

      console.log('Loading outfits for user:', user.uid);
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
      console.error('Outfitler yüklenirken hata:', error);
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
      }
    } catch (error) {
      console.error('Favori durumu güncellenirken hata:', error);
      Alert.alert('Hata', 'Favori durumu güncellenirken bir hata oluştu');
    }
  };

  const handleDeleteOutfit = async (outfit) => {
    try {
      const user = getCurrentUser();
      if (user) {
        const updatedOutfits = outfits.filter(item => item.id !== outfit.id);
        await AsyncStorage.setItem(`outfits_${user.uid}`, JSON.stringify(updatedOutfits));
        setOutfits(updatedOutfits);
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Kombin silinirken hata:', error);
      Alert.alert('Hata', 'Kombin silinirken bir hata oluştu');
    }
  };

  const renderOutfitItem = ({ item }) => {
    if (!item) return null;
    
    return (
      <TouchableOpacity
        style={styles.outfitItem}
        onPress={() => {
          setSelectedOutfit(item);
          setModalVisible(true);
        }}
      >
        <Image source={{ uri: item?.photo }} style={styles.outfitImage} />
        <TouchableOpacity
          style={[styles.favoriteButton, item?.isFavorite && styles.favoriteButtonActive]}
          onPress={() => handleToggleFavorite(item)}
        >
          <Ionicons
            name={item?.isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={item?.isFavorite ? '#FF3B30' : '#000'}
          />
        </TouchableOpacity>
        <View style={styles.outfitItemOverlay}>
          <Text style={styles.outfitStyle}>{item?.analysis?.style || 'Stil bilgisi yok'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOutfitModal = () => {
    if (!selectedOutfit) return null;
    
    return (
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>

          <Image
            source={{ uri: selectedOutfit?.photo }}
            style={styles.modalImage}
            resizeMode="contain"
          />

          <View style={styles.analysisContainer}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreTitle}>Kombin Skoru</Text>
              <Text style={styles.score}>{selectedOutfit?.analysis?.score || '0'}</Text>
            </View>

            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>Etkinlik Detayları</Text>
              <Text style={styles.eventText}>Etkinlik: {selectedOutfit?.eventDetails?.occasion || '-'}</Text>
              <Text style={styles.eventText}>Mevsim: {selectedOutfit?.eventDetails?.season || '-'}</Text>
              <Text style={styles.eventText}>Hava: {selectedOutfit?.eventDetails?.weather || '-'}</Text>
              <Text style={styles.eventText}>Saat: {selectedOutfit?.eventDetails?.time || '-'}</Text>
              <Text style={styles.eventText}>Ruh Hali: {selectedOutfit?.eventDetails?.mood || '-'}</Text>
            </View>

            <View style={styles.analysisDetails}>
              <Text style={styles.analysisTitle}>Analiz Sonuçları</Text>
              <Text style={styles.analysisText}>Stil: {selectedOutfit?.analysis?.style || '-'}</Text>
              <Text style={styles.analysisText}>Renkler: {selectedOutfit?.analysis?.colors?.join(', ') || '-'}</Text>
              {selectedOutfit?.analysis?.recommendations?.map((recommendation, index) => (
                <Text key={index} style={styles.recommendationText}>
                  • {recommendation}
                </Text>
              ))}
            </View>
          </View>

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
              <Text style={[styles.buttonText, styles.deleteButtonText]}>Kombini Sil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const filteredOutfits = showFavoritesOnly
    ? outfits.filter(outfit => outfit?.isFavorite)
    : outfits;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kombin Galerisi</Text>
        <TouchableOpacity
          style={[styles.filterButton, showFavoritesOnly && styles.filterButtonActive]}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Ionicons
            name={showFavoritesOnly ? 'heart' : 'heart-outline'}
            size={24}
            color={showFavoritesOnly ? '#FF3B30' : '#000'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : filteredOutfits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {showFavoritesOnly
                ? 'Henüz favori kombininiz yok'
                : 'Henüz kombin eklenmemiş'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredOutfits}
            renderItem={renderOutfitItem}
            keyExtractor={(item) => item?.id || Math.random().toString()}
            numColumns={2}
            contentContainerStyle={styles.outfitList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      {renderOutfitModal()}
    </View>
  );
}

const windowWidth = Dimensions.get('window').width;
const imageSize = (windowWidth - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 70 : 25,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  filterButtonActive: {
    backgroundColor: '#FFE5E5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outfitList: {
    padding: 8,
  },
  outfitItem: {
    margin: 8,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  outfitImage: {
    width: imageSize,
    height: imageSize,
  },
  outfitItemOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
  },
  outfitStyle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    marginVertical: 16,
  },
  analysisContainer: {
    marginTop: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#666666',
  },
  analysisDetails: {
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#666666',
  },
  recommendationText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666666',
    paddingLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
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
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  }
});
