from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from .models import Base

from dotenv import load_dotenv
import os

# .env dosyasını yükle
load_dotenv()

# PostgreSQL bağlantı URL'i
DATABASE_URL = os.getenv("DATABASE_URL")

# Engine oluştur
engine = create_engine(DATABASE_URL)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Veritabanı tablolarını oluştur"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Database session context manager"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CRUD işlemleri
class DatabaseManager:
    def __init__(self, session):
        self.session = session
    
    # Kıyafet işlemleri
    def add_clothing(self, user_id, clothing_data):
        """Yeni kıyafet ekle"""
        from .models import Clothing, User
        
        user = self.session.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("Kullanıcı bulunamadı")
            
        clothing = Clothing(**clothing_data)
        clothing.owners.append(user)
        
        self.session.add(clothing)
        self.session.commit()
        return clothing
    
    def get_user_wardrobe(self, user_id):
        """Kullanıcının gardırobunu getir"""
        from .models import User
        
        user = self.session.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("Kullanıcı bulunamadı")
            
        return user.wardrobe
    
    # Kombin işlemleri
    def create_outfit(self, user_id, outfit_data, clothing_ids):
        """Yeni kombin oluştur"""
        from .models import Outfit, Clothing, User
        
        user = self.session.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("Kullanıcı bulunamadı")
            
        # Kıyafetleri kontrol et
        clothes = self.session.query(Clothing).filter(
            Clothing.id.in_(clothing_ids)
        ).all()
        
        if len(clothes) != len(clothing_ids):
            raise ValueError("Bazı kıyafetler bulunamadı")
            
        # Kombin oluştur
        outfit = Outfit(**outfit_data)
        outfit.user = user
        outfit.clothes = clothes
        
        self.session.add(outfit)
        self.session.commit()
        return outfit
    
    def get_user_outfits(self, user_id):
        """Kullanıcının kombinlerini getir"""
        from .models import User
        
        user = self.session.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("Kullanıcı bulunamadı")
            
        return user.outfits
    
    # Stil tercihleri işlemleri
    def update_style_preferences(self, user_id, preferences):
        """Kullanıcının stil tercihlerini güncelle"""
        from .models import StylePreference, User
        
        user = self.session.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("Kullanıcı bulunamadı")
            
        # Mevcut tercihleri temizle
        self.session.query(StylePreference).filter(
            StylePreference.user_id == user_id
        ).delete()
        
        # Yeni tercihleri ekle
        for style, weight in preferences.items():
            pref = StylePreference(
                user_id=user_id,
                style=style,
                weight=weight
            )
            self.session.add(pref)
            
        self.session.commit()
