import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { analyzeClothing } from '../services/outfitAnalyzerBridge';

const AnalysisResultScreen = ({ route }) => {
  const { image, occasion, season, stylePreference, colorPreference, eventType, timeOfDay } = route.params;
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    analyzeOutfit();
  }, []);

  const analyzeOutfit = async () => {
    try {
      setLoading(true);
      
      const analysisResult = await analyzeClothing({
        image,
        occasion,
        season,
        stylePreference,
        colorPreference,
        eventType,
        timeOfDay,
      });
      
      setResult(analysisResult);
      setLoading(false);

    } catch (error) {
      console.error('Analiz sırasında hata:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={36} color="#000" />
        <Text style={styles.loadingText}>Kombinin analiz ediliyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
      
      <View style={styles.resultContainer}>
        <Text style={styles.score}>Kombin Puanı: {result.score}/10</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tespit Edilen Kıyafetler:</Text>
          {result.detected_items.map((item, index) => (
            <Text key={index} style={styles.item}>• {item}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Renk Analizi:</Text>
          {result.colors.map((color, index) => (
            <View key={index} style={[styles.colorBox, { backgroundColor: color }]} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Öneriler:</Text>
          {result.recommendations.map((recommendation, index) => (
            <Text key={index} style={styles.item}>• {recommendation}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detaylı Analiz:</Text>
          <Text style={styles.item}>• Mevsim Uygunluğu: {result.season_appropriate ? '✅ Uygun' : '❌ Uygun Değil'}</Text>
          <Text style={styles.item}>• Durum: {result.occasion}</Text>
          <Text style={styles.item}>• Etkinlik: {result.event_type}</Text>
          <Text style={styles.item}>• Zaman: {result.time_of_day}</Text>
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => {
            // TODO: Save to wardrobe
            navigation.navigate('Wardrobe');
          }}
        >
          <Text style={styles.saveButtonText}>Gardrobuma Kaydet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  colorBox: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#E6F3FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6F3FF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000000',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  resultContainer: {
    padding: 20,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  item: {
    fontSize: 16,
    marginBottom: 5,
    lineHeight: 22,
  },
});

export default AnalysisResultScreen;
