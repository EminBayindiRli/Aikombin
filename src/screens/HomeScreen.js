import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, ToastAndroid, Platform, Alert } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Modal from 'react-native-modal';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AddButton from '../components/AddButton';
import EventForm from '../components/EventForm';
import AnalysisModal from '../components/AnalysisModal';
import LoadingModal from '../components/LoadingModal';
import { getCurrentUser } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeOutfit } from '../services/outfit_analyzer';

function HomeScreen({ navigation }) {
  const [photo, setPhoto] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhotoTaken = (photoUri) => {
    console.log('handlePhotoTaken called with photoUri:', photoUri);
    setPhoto(photoUri);
    
    // Biraz bekleyip formu göster
    setTimeout(() => {
      setShowEventForm(true);
      console.log('EventForm should be visible now');
    }, 300);
  };

  const handleEventSubmit = async (data) => {
    try {
      console.log('handleEventSubmit called with data:', data);
      
      const user = getCurrentUser();
      if (!user) {
        alert('Lütfen giriş yapın');
        return;
      }

      // Form'u kapat ve loading'i göster
      setShowEventForm(false);
      setIsLoading(true);
      setShowAnalysis(false);

      // Toast/Alert mesajı göster
      if (Platform.OS === 'android') {
        ToastAndroid.show('Kombininiz analiz ediliyor...', ToastAndroid.SHORT);
      } else {
        Alert.alert('Analiz', 'Kombininiz analiz ediliyor...');
      }

      console.log('Starting outfit analysis...');
      
      // 3 saniye bekle
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Analiz yap
      const result = await analyzeOutfit(photo, data);
      console.log('Analysis result:', result);

      // Sonuçları göster
      setEventData(data);
      setAnalysisResult(result);
      setIsLoading(false);
      
      // Biraz bekleyip analiz sonuçlarını göster
      setTimeout(() => {
        setShowAnalysis(true);
      }, 300);
    } catch (error) {
      console.error('Error in handleEventSubmit:', error);
      setIsLoading(false);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleSaveOutfit = async (outfitData) => {
    try {
      console.log('handleSaveOutfit called with:', outfitData);
      
      const user = getCurrentUser();
      if (!user) {
        alert('Lütfen giriş yapın');
        return;
      }

      // Önce kaydediliyor mesajını göster
      if (Platform.OS === 'android') {
        ToastAndroid.show('Kombininiz kaydediliyor...', ToastAndroid.SHORT);
      } else {
        Alert.alert('Kaydediliyor', 'Kombininiz kaydediliyor...');
      }

      // Mevcut outfitleri al
      const savedOutfits = await AsyncStorage.getItem(`outfits_${user.uid}`);
      const currentOutfits = savedOutfits ? JSON.parse(savedOutfits) : [];

      // Yeni outfit'i ekle
      const outfitToSave = {
        id: Date.now().toString(),
        userId: user.uid,
        photo: outfitData.photo,
        eventDetails: outfitData.eventData,
        analysis: outfitData.analysis,
        createdAt: new Date().toISOString(),
        isFavorite: false
      };

      const updatedOutfits = [outfitToSave, ...currentOutfits];
      await AsyncStorage.setItem(`outfits_${user.uid}`, JSON.stringify(updatedOutfits));
      console.log('Outfit saved to local storage');
      
      // State'i temizle
      setPhoto(null);
      setEventData(null);
      setAnalysisResult(null);
      setShowAnalysis(false);
      
      // Başarılı mesajı göster
      if (Platform.OS === 'android') {
        ToastAndroid.show('Kombininiz başarıyla kaydedildi!', ToastAndroid.LONG);
      } else {
        Alert.alert('Başarılı', 'Kombininiz başarıyla kaydedildi!');
      }
      
      // Biraz bekleyip profil sayfasına yönlendir
      setTimeout(() => {
        navigation.navigate('Profile');
      }, 1000);
    } catch (error) {
      console.error('Error saving outfit:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AIKombin</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.centerLogo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeTitle}>Yapay Zeka Destekli</Text>
            <Text style={styles.welcomeTitle}>Stil Danışmanınız</Text>
            <Text style={styles.welcomeDescription}>
              Kişisel stilinizi geliştirmek ve gardrobunuzu düzenlemek için
              yapay zeka teknolojisinden yararlanan akıllı asistanınız.
            </Text>
          </View>

          <View style={styles.featureSection}>
            <View style={styles.featureItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="camera" size={32} color="#000" />
              </View>
              <Text style={styles.featureTitle}>Kıyafet Analizi</Text>
              <Text style={styles.featureDescription}>
                Gardrobunuzdaki kıyafetlerin fotoğraflarını yükleyin ve yapay zeka
                teknolojimiz ile detaylı stil analizleri alın. Her kıyafetinizin özelliklerini
                tanımlayarak size en uygun kombinleri oluşturmanıza yardımcı oluyoruz.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="color-palette" size={32} color="#000" />
              </View>
              <Text style={styles.featureTitle}>Renk Uyumu</Text>
              <Text style={styles.featureDescription}>
                Renk teorisi ve moda trendlerini birleştiren yapay zeka algoritmamız,
                kıyafetleriniz arasındaki renk uyumunu analiz eder. Size en uygun renk
                kombinasyonlarını önererek şık ve uyumlu görünmenizi sağlar.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="tshirt" size={32} color="#000" solid />
              </View>
              <Text style={styles.featureTitle}>Kişisel Kombin Önerileri</Text>
              <Text style={styles.featureDescription}>
                Kişisel stil tercihlerinizi ve vücut tipinizi analiz eden yapay zeka
                sistemimiz, gardrobunuzdaki parçalarla oluşturabileceğiniz en şık
                kombinleri size önerir. Her ortam ve durum için mükemmel kombinler yaratın.
              </Text>
            </View>
          </View>

          <View style={styles.messageContainer}>
            <Text style={styles.message}>Stilinizi keşfetmeye hazır mısınız?</Text>
          </View>
        </View>
      </ScrollView>

      <AddButton onPhotoTaken={handlePhotoTaken} />
      
      <EventForm 
        isVisible={showEventForm} 
        onClose={() => setShowEventForm(false)} 
        onSubmit={handleEventSubmit} 
      />
      
      <LoadingModal isVisible={isLoading} message="Analiz ediliyor..." />

      <AnalysisModal 
        isVisible={showAnalysis} 
        onClose={() => setShowAnalysis(false)} 
        photo={photo} 
        eventData={eventData} 
        onSave={handleSaveOutfit} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingModal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    marginBottom: 30
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 34
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 15,
    paddingHorizontal: 20,
    lineHeight: 24
  },
  featureSection: {
    marginBottom: 40
  },
  featureItem: {
    marginBottom: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12
  },
  featureDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24
  },
  messageContainer: {
    alignItems: 'center',
    marginVertical: 30
  },
  message: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 32
  },
  logo: {
    width: 40,
    height: 40
  },
  centerLogo: {
    width: 100,
    height: 100,
    marginBottom: 30
  }
});

export default HomeScreen;
