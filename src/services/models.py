from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Table, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

# Kullanıcı-Kıyafet ilişki tablosu (Gardırop)
user_clothes = Table(
    'user_clothes',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('clothing_id', Integer, ForeignKey('clothes.id'))
)

# Kombin-Kıyafet ilişki tablosu
outfit_clothes = Table(
    'outfit_clothes',
    Base.metadata,
    Column('outfit_id', Integer, ForeignKey('outfits.id')),
    Column('clothing_id', Integer, ForeignKey('clothes.id'))
)

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # İlişkiler
    wardrobe = relationship("Clothing", secondary=user_clothes, back_populates="owners")
    outfits = relationship("Outfit", back_populates="user")
    style_preferences = relationship("StylePreference", back_populates="user")

class Clothing(Base):
    __tablename__ = 'clothes'
    
    id = Column(Integer, primary_key=True)
    category = Column(String, nullable=False)  # üst_giyim, alt_giyim, ayakkabı, aksesuar
    subcategory = Column(String, nullable=False)  # tişört, gömlek, pantolon, vs.
    color = Column(String)
    style = Column(String)  # spor, klasik, günlük vs.
    image_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # İlişkiler
    owners = relationship("User", secondary=user_clothes, back_populates="wardrobe")
    outfits = relationship("Outfit", secondary=outfit_clothes, back_populates="clothes")

class Outfit(Base):
    __tablename__ = 'outfits'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String)
    occasion = Column(String)  # iş, parti, günlük vs.
    mood = Column(String)  # mutlu, enerjik, rahat vs.
    weather = Column(String)  # sıcak, soğuk, yağmurlu vs.
    season = Column(String)  # ilkbahar, yaz, sonbahar, kış
    rating = Column(Integer)  # 1-5 arası
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # İlişkiler
    user = relationship("User", back_populates="outfits")
    clothes = relationship("Clothing", secondary=outfit_clothes, back_populates="outfits")

class StylePreference(Base):
    __tablename__ = 'style_preferences'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    style = Column(String)  # spor, klasik, günlük vs.
    weight = Column(Float)  # 0-1 arası tercih ağırlığı
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # İlişkiler
    user = relationship("User", back_populates="style_preferences")
