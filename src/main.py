from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from services.outfit_analyzer import OutfitAnalyzer
from services.database import DatabaseManager, get_db
import os

app = FastAPI()

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Güvenlik için production'da değiştirilmeli
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Outfit Analyzer servisi
outfit_analyzer = OutfitAnalyzer()

@app.post("/clothes/analyze")
async def analyze_clothing(file: UploadFile = File(...)):
    try:
        # Geçici dosya olarak kaydet
        file_path = f"temp_{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Analiz yap
        analysis = outfit_analyzer.analyze_image(file_path)
        
        # Geçici dosyayı sil
        os.remove(file_path)
        
        return analysis
    except Exception as e:
        return {"error": str(e)}

@app.post("/wardrobe/add")
async def add_to_wardrobe(file: UploadFile = File(...)):
    try:
        # Geçici dosya olarak kaydet
        file_path = f"temp_{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Analiz yap ve gardıroba ekle
        analysis = outfit_analyzer.analyze_image(file_path)
        
        # Veritabanına kaydet
        db = next(get_db())
        db_manager = DatabaseManager(db)
        result = db_manager.add_clothing(1, {
            "image_url": file_path,
            **analysis
        })
        
        # Geçici dosyayı sil
        os.remove(file_path)
        
        return result
    except Exception as e:
        return {"error": str(e)}
