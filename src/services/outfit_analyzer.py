import os
import cv2
import numpy as np
from PIL import Image
import torch
from ultralytics import YOLO
import json
import threading
from concurrent.futures import ThreadPoolExecutor
import concurrent.futures
import time
from transformers import pipeline, ViTFeatureExtractor, ViTForImageClassification
from torchvision import models, transforms

# Apple Silicon MPS optimizasyonu
import torch.mps

# API Configuration
API_URL = "http://localhost:8080"

# Temel kıyafet sınıfları
CLOTHING_CLASSES = {
    398: 'üst giyim',  # t-shirt
    399: 'üst giyim',  # coat
    400: 'üst giyim',  # sweatshirt
    401: 'alt giyim',   # pants
    402: 'alt giyim',   # shorts
    403: 'ayakkabı',    # shoes
    404: 'ayakkabı',    # sneakers
    405: 'aksesuar',    # hat
    406: 'aksesuar',    # bag
    407: 'aksesuar'     # sunglasses
}

# Model ayarları
MODEL_CONFIG = {
    'input_size': (224, 224),  # ResNet giriş boyutu
    'threshold': 0.3,         # Güven eşiği
}

# Basit kıyafet kategorileri
CLOTHING_CATEGORIES = {
    'üst_giyim': ['beyaz', 'açık', 'koyu'],
    'alt_giyim': ['kot', 'kumaş', 'spor'],
    'ayakkabı': ['spor', 'klasik', 'bot'],
    'aksesuar': ['küçük', 'orta', 'büyük']
}

class OutfitAnalyzer:
    def __init__(self):
        # Önbellek sistemi
        self.cache = {}
        self.cache_stats = {'hits': 0, 'misses': 0}
        self.cache_max_size = 100  # Maksimum önbellek boyutu
        
        # Kıyafet sınıfları
        self.clothing_classes = [
            'short_sleeve_top', 'long_sleeve_top', 'short_sleeve_outwear', 'long_sleeve_outwear',
            'vest', 'sling', 'shorts', 'trousers', 'skirt', 'short_sleeve_dress',
            'long_sleeve_dress', 'vest_dress', 'sling_dress'
        ]
        
        # Türkçe karşılıklar
        self.clothing_map = {
            'short_sleeve_top': 'kısa kollu üst', 
            'long_sleeve_top': 'uzun kollu üst',
            'short_sleeve_outwear': 'kısa kollu dış giyim',
            'long_sleeve_outwear': 'uzun kollu dış giyim',
            'vest': 'yelek',
            'sling': 'askılı üst',
            'shorts': 'şort',
            'trousers': 'pantolon',
            'skirt': 'etek',
            'short_sleeve_dress': 'kısa kollu elbise',
            'long_sleeve_dress': 'uzun kollu elbise',
            'vest_dress': 'yelek elbise',
            'sling_dress': 'askılı elbise'
        }
        
        print("Optimize edilmiş modeller yükleniyor...")
        
        try:
            # Model dosyaları için cache dizini
            cache_base = os.path.expanduser('~/.aikombin_cache')
            self.model_cache_dir = os.path.join(cache_base, 'models')
            os.makedirs(self.model_cache_dir, exist_ok=True)
            
            # Model durumu dosyası
            self.model_state_file = os.path.join(cache_base, 'model_state.json')
            
            # Apple Silicon MPS optimizasyonu
            if torch.backends.mps.is_available():
                self.device = torch.device("mps")
                print("Apple Silicon GPU kullanılıyor (MPS)")
            else:
                self.device = torch.device("cpu")
                print("CPU kullanılıyor")
            
            # YOLO modelini yükle
            yolo_path = os.path.join(self.model_cache_dir, 'yolov8n.pt')
            if not os.path.exists(yolo_path):
                print("YOLO modeli indiriliyor...")
                self.yolo_model = YOLO('yolov8n.pt')
                self.yolo_model.export(format='pt')
                os.rename('yolov8n.pt', yolo_path)
            else:
                print("YOLO modeli cache'den yükleniyor...")
                self.yolo_model = YOLO(yolo_path)
            
            # ResNet50 modelini yükle
            print("ResNet50 modeli yükleniyor...")
            self.model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
            self.model.eval()
            
            # GPU'ya taşı
            if self.device.type == "mps":
                self.model = self.model.to(self.device)
                self.yolo_model.to(self.device)
            
            # Görüntü dönüştürme
            self.transform = transforms.Compose([
                transforms.Resize(MODEL_CONFIG['input_size']),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225]
                )
            ])
            
            # Model optimizasyonları
            self.yolo_model.conf = 0.55  # Yüksek güven eşiği
            self.yolo_model.iou = 0.45   # Çakışma toleransı
            self.yolo_model.max_det = 10  # Maksimum tespit sayısı
            
            # ViT modelini yükle
            print("ViT modeli yükleniyor...")
            model_name = "google/vit-base-patch16-224"
            model_path = os.path.join(self.model_cache_dir, 'vit-base')
            
            if os.path.exists(model_path):
                print("ViT modeli cache'den yükleniyor...")
                vit_model = ViTForImageClassification.from_pretrained(model_path)
                feature_extractor = ViTFeatureExtractor.from_pretrained(model_path)
            else:
                print("ViT modeli indiriliyor...")
                vit_model = ViTForImageClassification.from_pretrained(model_name)
                feature_extractor = ViTFeatureExtractor.from_pretrained(model_name)
                vit_model.save_pretrained(model_path)
                feature_extractor.save_pretrained(model_path)
            
            if self.device.type == "mps":
                vit_model = vit_model.to(self.device)
            
            self.classifier = pipeline(
                "image-classification",
                model=vit_model,
                feature_extractor=feature_extractor,
                device=self.device
            )
            
            # Model durumunu kaydet
            with open(self.model_state_file, 'w') as f:
                json.dump({'initialized': True}, f)
            
            print("Tüm modeller başarıyla yüklendi!")
                
        except Exception as e:
            print(f"Model yükleme hatası: {str(e)}")
            raise e

    def _iou(self, box1, box2):
        """Intersection over Union hesapla"""
        box1 = np.array(box1)
        box2 = np.array(box2)
        
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        
        intersection = max(0, x2 - x1) * max(0, y2 - y1)
        
        box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
        box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])
        union = box1_area + box2_area - intersection
        
        return intersection / union if union > 0 else 0.0

    def analyze_colors(self, image, mask=None):
        """K-means kullanarak baskın renkleri belirle"""
        if mask is None:
            mask = np.ones(image.shape[:2], dtype=np.uint8) * 255
            
        masked_image = cv2.bitwise_and(image, image, mask=mask)
        pixels = masked_image.reshape(-1, 3)
        pixels = pixels[mask.reshape(-1) > 0]
        
        if len(pixels) == 0:
            return []
            
        kmeans = cv2.kmeans(
            pixels.astype(np.float32),
            3,  # 3 baskın renk
            None,
            criteria=(cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0),
            attempts=10,
            flags=cv2.KMEANS_RANDOM_CENTERS
        )
        
        colors = ['#{:02x}{:02x}{:02x}'.format(int(c[0]), int(c[1]), int(c[2])) 
                 for c in kmeans[2]]
        return colors

    def _get_category(self, idx):
        """ImageNet indeksinden ana kategori dönüşü"""
        if idx in CLOTHING_CLASSES:
            return CLOTHING_CLASSES[idx]
        return "diğer"

    def _get_subcategory(self, idx):
        """ImageNet indeksinden alt kategori dönüşü"""
        if idx in range(398, 408):
            subcats = {
                398: "tişört",
                399: "palto",
                400: "sweatshirt",
                401: "pantolon",
                402: "şort",
                403: "klasik ayakkabı",
                404: "spor ayakkabı",
                405: "şapka",
                406: "çanta",
                407: "gözlük"
            }
            return subcats.get(idx, "diğer")
        return "diğer"

    def _predict_style(self, idx, color=None):
        """Basit kural tabanlı stil tahmini"""
        styles = {
            398: "casual",
            399: "formal",
            400: "sporty",
            401: "classic",
            402: "sporty",
            403: "formal",
            404: "sporty",
            405: "casual",
            406: "accessory",
            407: "accessory"
        }
        
        base_style = styles.get(idx, "casual")
        
        if color:
            if color.startswith("#00") or color.startswith("#11"):  # Koyu renkler
                if base_style == "casual":
                    return "smart-casual"
                elif base_style == "sporty":
                    return "athleisure"
            elif color.startswith("#FF") or color.startswith("#EE"):  # Açık renkler
                if base_style == "formal":
                    return "business-casual"
        
        return base_style

    def analyze_image(self, image_path: str):
        """Kıyafet analizi
        
        Args:
            image_path: Analiz edilecek görüntünün yolu
            
        Returns:
            Dict: Analiz sonuçlarını içeren sözlük
        """
        try:
            # Önbellekte varsa oradan al
            if image_path in self.cache:
                self.cache_stats['hits'] += 1
                return self.cache[image_path]
            
            # Görüntüyü yükle
            image = Image.open(image_path).convert('RGB')
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # YOLO ile tespit
            results = self.yolo_model(image)
            
            # Tespit edilen nesneleri işle
            detections = []
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    b = box.xyxy[0].tolist()
                    cls = int(box.cls)
                    conf = float(box.conf)
                    
                    if cls in CLOTHING_CLASSES:
                        detection = {
                            'class': CLOTHING_CLASSES[cls],
                            'confidence': conf,
                            'box': b
                        }
                        detections.append(detection)
            
            # Eğer kıyafet tespit edilmediyse
            if not detections:
                return {"kıyafet_var_mı": False}
            
            # Görüntü tensörünü hazırla
            image_tensor = self.transform(image).unsqueeze(0)
            if self.device.type == "mps":
                image_tensor = image_tensor.to(self.device)
            
            # ResNet50 ile sınıflandırma
            with torch.no_grad():
                output = self.model(image_tensor)
                probabilities = torch.nn.functional.softmax(output[0], dim=0)
                
            # En yüksek olasılıklı sınıfı al
            top_prob, top_catid = torch.topk(probabilities, 1)
            
            # Kategori ve alt kategori bilgilerini al
            category = self._get_category(top_catid.item())
            subcategory = self._get_subcategory(top_catid.item())
            
            # Renk analizi
            colors = self.analyze_colors(cv_image)
            
            # Stil tahmini
            style = self._predict_style(top_catid.item(), colors[0] if colors else None)
            
            # ViT ile ek analiz
            vit_results = self.classifier(image)
            
            # Sonuçları hazırla
            results = {
                "kıyafet_var_mı": True,
                "tespit": {
                    "kıyafetler": detections,
                    "güven": float(top_prob.item())
                },
                "analiz": {
                    "kategori": category,
                    "alt_kategori": subcategory,
                    "renkler": colors,
                    "stil": style,
                    "vit_analiz": vit_results[0] if vit_results else None
                }
            }
            
            # Önbellek istatistiklerini güncelle
            self.cache_stats['misses'] += 1
            
            # Sonuçları önbelleğe ekle
            if len(self.cache) >= self.cache_max_size:
                self.cache.pop(next(iter(self.cache)))
            self.cache[image_path] = results
            
            return results
        except Exception as e:
            print(f"Hata: {str(e)}")
            return {"kıyafet_var_mı": False}

    def process_and_save(self, input_path, output_path=None):
        """Görüntüyü analiz et ve sonuçları kaydet"""
        try:
            results = self.analyze_image(input_path)
            
            if not results["kıyafet_var_mı"]:
                if os.path.exists(input_path):
                    os.remove(input_path)
            elif output_path:
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(results, f, ensure_ascii=False, indent=2)
                    
            return results
        except Exception as e:
            print(f"İşleme hatası: {str(e)}")
            return {"kıyafet_var_mı": False}
