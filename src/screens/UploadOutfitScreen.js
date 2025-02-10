import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import outfitAnalyzer from '../services/outfitAnalyzerBridge';

const UploadOutfitScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);


  const pickImage = async () => {
    try {
      // Galeri izinlerini kontrol et
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Hata', 'Galeriye erişim izni gerekiyor.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Fotoğraf seçme hatası:', error);
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Hata', 'Kamera izni gerekli!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      Alert.alert('Hata', 'Lütfen önce bir fotoğraf seçin.');
      return;
    }

    try {
      setUploading(true);

      // Kıyafet analizi yap
      const result = await outfitAnalyzer.analyzeOutfit(image);

      if (!result.kiyafet_var_mi) {
        Alert.alert(
          'Kıyafet Bulunamadı',
          'Seçilen fotoğrafta kıyafet tespit edilemedi. Lütfen başka bir fotoğraf seçin.'
        );
        setImage(null);
        return;
      }

      // Outfits klasörünü oluştur
      const outfitsDir = `${FileSystem.documentDirectory}outfits`;
      const dirInfo = await FileSystem.getInfoAsync(outfitsDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(outfitsDir);
      }

      // Benzersiz bir dosya adı oluştur
      const timestamp = new Date().getTime();
      const filename = `outfit_${timestamp}.jpg`;
      const newPath = `${outfitsDir}/${filename}`;

      // Fotoğrafı kaydet
      await FileSystem.copyAsync({
        from: image,
        to: newPath
      });

      // Analiz sonuçlarını JSON olarak kaydet
      const analysisPath = `${outfitsDir}/${filename}.json`;
      await FileSystem.writeAsStringAsync(analysisPath, JSON.stringify(result));

      // Başarı mesajı göster
      Alert.alert(
        'Kıyafet Analizi Tamamlandı',
        `Tespit edilen kıyafet sayısı: ${result.toplam_parca_sayisi}\n\n` +
        `Renkler:\n${result.renkler.map(renk => `• ${renk}`).join('\n')}\n\n` +
        `Tarz:\n${result.tarz.map(t => `• ${t}`).join('\n')}`
      );
      
      // Ana sayfaya dön
      navigation.navigate('Main');
    } catch (error) {
      console.error('Kıyafet analizi hatası:', error);
      Alert.alert('Hata', 'Kıyafet analizi sırasında bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>Fotoğraf seçilmedi</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Galeriden Seç</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Fotoğraf Çek</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.uploadButton, uploading && styles.disabledButton]} 
        onPress={handleUpload}
        disabled={!image || uploading}
      >
        {uploading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={24} color="#fff" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        ) : (
          <Text style={styles.uploadButtonText}>Yükle</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  imageContainer: {
    aspectRatio: 4/3,
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  buttonText: {
    textAlign: 'center',
    color: '#333',
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
  },
});

export default UploadOutfitScreen;
