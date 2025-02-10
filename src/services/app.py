from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import List, Optional
import base64
import tempfile
import os
import shutil
import uvicorn

from outfit_analyzer import OutfitAnalyzer
from database import get_db, init_db, DatabaseManager
from models import User, Clothing, Outfit

# Global analyzer nesnesi
analyzer = None

# Yükleme klasörü
UPLOAD_DIR = os.path.expanduser('~/.aikombin/uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global analyzer
    print("Model yükleniyor...")
    try:
        analyzer = OutfitAnalyzer()
        print("Model başarıyla yüklendi!")
        
        # Veritabanını başlat
        init_db()
        print("Veritabanı başlatıldı!")
    except Exception as e:
        print(f"Başlatma hatası: {str(e)}")
        raise e
    yield
    # Shutdown
    if analyzer:
        print("Model kapatılıyor...")

app = FastAPI(lifespan=lifespan)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Veri modelleri
class ImageRequest(BaseModel):
    image: str

class OutfitMetadata(BaseModel):
    name: Optional[str]
    occasion: str  # iş, parti, günlük vs.
    mood: str      # mutlu, enerjik, rahat vs.
    weather: str   # sıcak, soğuk, yağmurlu vs.
    season: str    # ilkbahar, yaz, sonbahar, kış
    notes: Optional[str]

# Kıyafet işlemleri
@app.post("/clothes/analyze")
async def analyze_clothing(file: UploadFile = File(...)):
    """Kıyafet analizi endpoint'i"""
    try:
        # Model hazır mı kontrol et
        if analyzer is None:
            return JSONResponse(
                status_code=503,
                content={"error": "Model henüz yüklenmedi"},
                headers={"Retry-After": "10"}
            )
        
        # Dosyayı kaydet
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            # Analiz yap
            result = analyzer.analyze_image(file_path)
            return JSONResponse(content=result)
            
        finally:
            # Dosyayı sil
            if os.path.exists(file_path):
                os.remove(file_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clothes")
async def add_clothing(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Gardıroba kıyafet ekleme"""
    try:
        # Dosyayı kaydet
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            # Analiz yap
            result = analyzer.analyze_image(file_path)
            if not result["success"]:
                raise HTTPException(status_code=400, detail=result["error"])
            
            # Kıyafeti veritabanına ekle
            db_manager = DatabaseManager(db)
            clothing_data = {
                "category": result["category"],
                "subcategory": result["subcategory"],
                "color": result["color"],
                "style": result["style"],
                "image_url": file_path  # Gerçek uygulamada S3 URL'i olacak
            }
            
            clothing = db_manager.add_clothing(user_id, clothing_data)
            return clothing
            
        finally:
            # Dosyayı sil
            if os.path.exists(file_path):
                os.remove(file_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/clothes/{user_id}")
async def get_wardrobe(
    user_id: int,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Gardırop içeriğini getir"""
    try:
        db_manager = DatabaseManager(db)
        clothes = db_manager.get_user_wardrobe(user_id)
        
        if category:
            clothes = [c for c in clothes if c.category == category]
            
        return clothes
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Kombin işlemleri
@app.post("/outfits")
async def create_outfit(
    user_id: int,
    clothing_ids: List[int],
    metadata: OutfitMetadata,
    db: Session = Depends(get_db)
):
    """Yeni kombin oluştur"""
    try:
        db_manager = DatabaseManager(db)
        outfit = db_manager.create_outfit(
            user_id,
            metadata.dict(),
            clothing_ids
        )
        return outfit
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/outfits/{user_id}")
async def get_outfits(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Kullanıcının kombinlerini getir"""
    try:
        db_manager = DatabaseManager(db)
        outfits = db_manager.get_user_outfits(user_id)
        return outfits
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Stil tercihleri
@app.put("/preferences/{user_id}")
async def update_preferences(
    user_id: int,
    preferences: dict,
    db: Session = Depends(get_db)
):
    """Kullanıcı stil tercihlerini güncelle"""
    try:
        db_manager = DatabaseManager(db)
        db_manager.update_style_preferences(user_id, preferences)
        return {"message": "Tercihler güncellendi"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
            
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        )

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=5002, reload=True)
