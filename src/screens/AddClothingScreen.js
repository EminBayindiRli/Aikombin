import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import OutfitAnalyzerBridge from '../services/outfitAnalyzerBridge';

const AddClothingScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      // Kamera izni kontrolü
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Hata', 'Kamera izni gerekli');
      }
    })();
  }, []);

  const takePhoto = async () => {

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setLoading(true);
        try {
          // Resmi sıkıştır
          const manipResult = await ImageManipulator.manipulateAsync(
            result.assets[0].uri,
            [{ resize: { width: 800, height: 600 } }],
            { compress: 0.7, format: 'jpeg' }
          );
          
          // Kıyafeti analiz et
          const analysisResult = await OutfitAnalyzerBridge.analyzeClothing(manipResult.uri);
          
          // Profil galerisine kaydet
          const profileGallery = JSON.parse(await AsyncStorage.getItem('profileGallery') || '[]');
          const newPhoto = {
            id: Date.now(),
            image: manipResult.uri,
            analysis: analysisResult,
            date: new Date().toISOString()
          };
          profileGallery.unshift(newPhoto); // En başa ekle
          await AsyncStorage.setItem('profileGallery', JSON.stringify(profileGallery));
          
          // Analiz sonuçlarını göster ve profil sayfasına yönlendir
          Alert.alert(
            'Analiz Tamamlandı',
            `Stil: ${analysisResult.style}\nRenk: ${analysisResult.colors.join(', ')}\n\nÖneriler:\n${analysisResult.recommendations.join('\n')}`,
            [{ text: 'Galeriye Git', onPress: () => navigation.navigate('Profile') }]
          );
        } catch (error) {
          Alert.alert('Hata', 'Analiz sırasında bir hata oluştu: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Fotoğraf çekerken hata:', error);
      Alert.alert('Hata', 'Fotoğraf çekerken bir hata oluştu');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={takePhoto}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Fotoğraf Çek</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={36} color="#000" />
          <Text style={styles.loadingText}>Fotoğraf işleniyor...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#000000',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000000',
  },
});

export default AddClothingScreen;
