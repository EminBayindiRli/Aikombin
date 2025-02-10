import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Mock veri
const MOCK_ANALYSIS = {
  detected_items: [
    {
      name: 't-shirt',
      color: 'siyah',
      confidence: 0.95,
      box: [10, 10, 100, 100]
    }
  ],
  analysis_date: new Date().toISOString()
};

class OutfitAnalyzerBridge {
  constructor() {
    // Offline mod
    this.isOffline = true;
    
    // Kullanıcı ID'si
    this.userId = 1;
    
    // Local storage
    this._storage = {
      preferences: {},
      authToken: null,
      outfits: [] // Kombinleri local'de tut
    };
  }
  
  // Tercihleri kaydet
  async savePreferences(preferences) {
    this._storage.preferences = preferences;
  }

  // Tercihleri getir
  async getPreferences() {
    return this._storage.preferences;
  }

  // Auth token kaydet
  async saveAuthToken(token) {
    this._storage.authToken = token;
  }

  // Auth token getir
  async getAuthToken() {
    return this._storage.authToken;
  }

  // Kıyafet analizi
  async analyzeClothing(imageUri) {
    try {
      console.log('Analiz başlıyor...');
      console.log('API URL:', this.serviceUrl);

      // Görüntü kontrolü
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Geçersiz görüntü');
      }
      console.log('Görüntü kontrolü başarılı');

      // Resmi base64'e çevir
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('Base64 dönüşümü başarılı, boyut:', base64Image.length);

      // Görüntü boyutu kontrolü (max 10MB)
      if (base64Image.length > 10 * 1024 * 1024) {
        throw new Error('Görüntü boyutu çok büyük (max 10MB)');
      }

      console.log('API isteği gönderiliyor...');
      // API'ye gönder
      const response = await fetch(`${this.serviceUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          image: base64Image
        })
      });

      console.log('API yanıtı:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API hata detayları:', errorText);
        throw new Error(`API hatası: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Analiz tamamlandı');
      return result;
    } catch (error) {
      console.error('Kıyafet analizi hatası:', error);
      if (error.message.includes('Network request failed')) {
        throw new Error('Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.');
      }
      throw error;
    }
  }

  // Gardıroba kıyafet ekleme
  async addToWardrobe(imageUri, metadata = {}) {
    try {
      // Authentication kontrolü
      const authToken = await AsyncStorage.getItem(this.CACHE_KEYS.AUTH_TOKEN);
      if (!authToken) {
        throw new Error('Lütfen giriş yapın');
      }

      // Görüntü kontrolü
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Geçersiz görüntü');
      }

      // Görüntü boyutu kontrolü (max 10MB)
      if (fileInfo.size > 10 * 1024 * 1024) {
        throw new Error('Görüntü boyutu çok büyük (max 10MB)');
      }

      // Form data oluştur
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'clothing.jpg'
      });
      
      // Metadata ekle
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      // API'ye gönder
      const response = await fetch(`${this.serviceUrl}/wardrobe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Kıyafet eklenemedi');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Kıyafet ekleme hatası:', error);
      throw error;
    }
  }

  // Gardırop içeriğini getir
  async getWardrobe(options = {}) {
    try {
      // Authentication kontrolü
      const authToken = await AsyncStorage.getItem(this.CACHE_KEYS.AUTH_TOKEN);
      if (!authToken) {
        throw new Error('Lütfen giriş yapın');
      }

      // URL parametrelerini oluştur
      const params = new URLSearchParams();
      if (options.category) params.append('category', options.category);
      if (options.season) params.append('season', options.season);
      if (options.color) params.append('color', options.color);
      if (options.style) params.append('style', options.style);
      if (options.limit) params.append('limit', options.limit);
      if (options.offset) params.append('offset', options.offset);

      // API'ye istek gönder
      const response = await fetch(`${this.serviceUrl}/wardrobe?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Gardırop getirilemedi');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Gardırop getirme hatası:', error);
      throw error;
    }
  }

  // Kombin oluştur
  async createOutfit(clothingIds) {
    try {
      // Authentication kontrolü
      const authToken = await AsyncStorage.getItem(this.CACHE_KEYS.AUTH_TOKEN);
      if (!authToken) {
        throw new Error('Lütfen giriş yapın');
      }

      // Kıyafet ID kontrolü
      if (!clothingIds || !Array.isArray(clothingIds) || clothingIds.length === 0) {
        throw new Error('Geçersiz kıyafet seçimi');
      }

      // API'ye gönder
      const response = await fetch(`${this.serviceUrl}/outfits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          clothing_ids: clothingIds
        })
      });

      if (!response.ok) {
        throw new Error('Kombin oluşturulamadı');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Kombin oluşturma hatası:', error);
      throw error;
    }
  }

  // Kombinleri getir
  async getOutfits(options = {}) {
    try {
      // Authentication kontrolü
      const authToken = await AsyncStorage.getItem(this.CACHE_KEYS.AUTH_TOKEN);
      if (!authToken) {
        throw new Error('Lütfen giriş yapın');
      }

      // URL parametrelerini oluştur
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.offset) params.append('offset', options.offset);

      // API'ye istek gönder
      const response = await fetch(`${this.serviceUrl}/outfits?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Kombinler getirilemedi');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Kombinleri getirme hatası:', error);
      throw error;
    }
  }
}

// Singleton instance oluştur ve export et
export default new OutfitAnalyzerBridge();
