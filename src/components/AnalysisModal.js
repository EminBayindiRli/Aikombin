import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

const AnalysisModal = ({ isVisible, onClose, photo, eventData, onSave, onDelete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    console.log('AnalysisModal isVisible changed:', isVisible);
    console.log('Current state:', { isAnalyzing, eventData, photo });

    if (isVisible && eventData && photo) {
      console.log('Starting analysis with:', { photo, eventData });
      analyzeOutfit();
    }
  }, [isVisible, eventData, photo]);

  const analyzeOutfit = async () => {
    try {
      console.log('Starting outfit analysis in modal...');
      setIsAnalyzing(true);
      
      // Sonuçları güncelle
      const analysisResult = {
        style: "Casual",
        colors: ["Mavi", "Beyaz"],
        score: Math.floor(Math.random() * 21) + 80, // 80-100 arası rastgele skor
        occasion: eventData.occasion,
        season: eventData.season,
        weather: eventData.weather,
        time: eventData.time,
        mood: eventData.mood,
        recommendations: [
          "Bu kombinle harika görünüyorsun!",
          "Renk seçimlerin çok uyumlu.",
          "Bu tarz sana çok yakışmış."
        ]
      };
      
      console.log('Setting analysis results:', analysisResult);
      setAnalysis(analysisResult);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error analyzing outfit:', error);
      alert('Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      handleClose();
    }
  };



  const handleClose = () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    onClose();
  };

  const handleSave = async () => {
    try {
      if (!photo || !analysis) {
        alert('Fotoğraf ve analiz sonuçları eksik. Lütfen tekrar deneyin.');
        return;
      }

      console.log('Saving outfit:', { photo, analysis });
      
      // Profile kaydet
      await onSave({
        photo,
        eventData,
        analysis,
        timestamp: new Date().toISOString(),
      });

      // Başarılı mesajı göster
      alert('Kombin başarıyla kaydedildi!');
      
      // Modalı kapat
      handleClose();
    } catch (error) {
      console.error('Error saving outfit:', error);
      alert('Kaydetme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0}
      propagateSwipe={true}
      avoidKeyboard={true}
      useNativeDriver={true}
    >
      <View style={styles.modalContent}>
        {isAnalyzing ? (
          <View style={styles.loadingContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.loadingLogo}
              resizeMode="contain"
            />
            <ActivityIndicator size="large" color="#000" style={styles.loader} />
            <Text style={styles.loadingText}>Kombin Analiz Ediliyor...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.title}>Analiz Sonuçları</Text>
            
            <View style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
            </View>

            <View style={styles.resultsContainer}>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreTitle}>Kombin Skoru</Text>
                <Text style={styles.score}>{analysis.score}</Text>
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Stil:</Text>
                  <Text style={styles.detailValue}>{analysis.style}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Renkler:</Text>
                  <Text style={styles.detailValue}>{analysis.colors.join(', ')}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Etkinlik:</Text>
                  <Text style={styles.detailValue}>{analysis.occasion}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Sezon:</Text>
                  <Text style={styles.detailValue}>{analysis.season}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Hava Durumu:</Text>
                  <Text style={styles.detailValue}>{analysis.weather}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Zaman:</Text>
                  <Text style={styles.detailValue}>{analysis.time}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Mod:</Text>
                  <Text style={styles.detailValue}>{analysis.mood}</Text>
                </View>

                <View style={styles.recommendationContainer}>
                  <Text style={styles.recommendationLabel}>Öneriler:</Text>
                  {analysis.recommendations.map((recommendation, index) => (
                    <Text key={index} style={styles.recommendationText}>{recommendation}</Text>
                  ))}                  
                </View>
              </View>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={[styles.saveButton, !photo ? styles.buttonDisabled : null]} 
                onPress={handleSave}
                disabled={!photo}
              >
                <Ionicons name="save-outline" size={24} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Profile Kaydet</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteButton} onPress={handleClose}>
                <Ionicons name="trash-outline" size={24} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Sil</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.shareButton, { opacity: 0.5 }]} disabled={true}>
                <Ionicons name="share-outline" size={24} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Paylaş</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
    marginTop: 50, // Üst taraftan boşluk bırak
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 500,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 300,
  },
  loadingLogo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#000',
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  resultsContainer: {
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
  detailsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  recommendationContainer: {
    marginTop: 10,
  },
  recommendationLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  recommendationText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 25,
    padding: 15,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    borderRadius: 25,
    padding: 15,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AnalysisModal;
