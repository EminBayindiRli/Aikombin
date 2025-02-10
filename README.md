# 🎨 Aikombin - Akıllı Kombin Asistanı

Aikombin, yapay zeka destekli bir kişisel stil asistanıdır. Kullanıcıların kıyafetlerini analiz eder, kombinler oluşturur ve stil önerileri sunar.

## 🌟 Özellikler

### Mevcut Özellikler
- 📸 Kıyafet fotoğrafı çekme ve yükleme
- 🏷️ Otomatik kıyafet kategorilendirme
- 👗 Kombin oluşturma ve düzenleme
- ❤️ Favori kombinleri kaydetme
- 📊 Kombin analizi ve puanlama
- 🎯 Etkinliğe özel kombin önerileri
- 📱 Modern ve kullanıcı dostu arayüz

### 🔜 Gelecek Özellikler
1. **Gelişmiş AI Sistemleri**
   - Style Transfer: Farklı stillerde kombin önerileri
   - Renk Harmonisi Analizi: Renk uyumu önerileri
   - Mevsimsel Analiz: Mevsime uygun kombin önerileri
   - Vücut Tipi Analizi: Vücut tipine uygun stil önerileri

2. **Sosyal Özellikler**
   - Kombin paylaşımı
   - Stil topluluğu
   - Trend analizi
   - Stilist tavsiyeleri

## 🛠️ Teknik Detaylar

### API Yapısı
```javascript
// Kombin Analizi API
POST /api/analyze-outfit
{
  "image": "base64_encoded_image",
  "eventType": "casual|formal|business",
  "season": "summer|winter|spring|fall"
}

// Stil Önerisi API
POST /api/get-recommendations
{
  "userPreferences": {...},
  "occasion": "string",
  "weather": "string"
}

// Kıyafet Tanıma API
POST /api/detect-clothing
{
  "image": "base64_encoded_image"
}
```

### AI Sistemleri

#### 1. Kıyafet Tanıma Sistemi
- Model: YOLOv8
- Özellikler:
  - Kıyafet türü tanıma
  - Renk analizi
  - Desen tanıma
  - Materyal tahmini

#### 2. Stil Analiz Sistemi
- Özellikler:
  - Stil kategorilendirme
  - Trend analizi
  - Renk uyumu değerlendirmesi
  - Sezon uygunluğu

#### 3. Öneri Sistemi
- Algoritmalar:
  - Collaborative Filtering
  - Content-Based Filtering
  - Hybrid Recommendation System

### 🔧 Kurulum

1. Repository'yi klonlayın:
```bash
git clone https://github.com/EminBayindiRli/Aikombin.git
cd Aikombin
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. iOS için pod'ları yükleyin:
```bash
cd ios && pod install && cd ..
```

4. Model dosyalarını indirin:
```bash
# Model dosyaları ayrıca paylaşılacaktır
mkdir -p src/services/models
# Model dosyalarını models klasörüne kopyalayın
```

5. Uygulamayı başlatın:
```bash
npx expo start
```

### 📂 Proje Yapısı
```
aikombin/
├── src/
│   ├── screens/          # Uygulama ekranları
│   ├── components/       # Yeniden kullanılabilir bileşenler
│   ├── services/         # AI ve Firebase servisleri
│   ├── navigation/       # Navigasyon yapılandırması
│   └── config/          # Yapılandırma dosyaları
├── assets/              # Görsel ve medya dosyaları
└── docs/               # Dokümantasyon
```

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit'leyin (`git commit -m 'Add amazing feature'`)
4. Push'layın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Yapılacaklar

- [ ] Style Transfer AI modelinin entegrasyonu
- [ ] Renk harmonisi analiz sisteminin geliştirilmesi
- [ ] Sosyal özelliklerin eklenmesi
- [ ] Performans optimizasyonları
- [ ] Test coverage'ının artırılması

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

Emin Bayındırlı - [@EminBayindiRli](https://github.com/EminBayindiRli)

Proje Linki: [https://github.com/EminBayindiRli/Aikombin](https://github.com/EminBayindiRli/Aikombin)
