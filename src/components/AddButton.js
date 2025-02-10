import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const AddButton = ({ onPhotoTaken }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [photo, setPhoto] = useState(null);

  const toggleModal = () => {
    if (!isModalVisible) {
      // Modal açılırken
      setPhoto(null);
      setModalVisible(true);
    } else {
      // Modal kapanırken
      setModalVisible(false);
      setTimeout(() => setPhoto(null), 300);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Kamera izni gerekli!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      alert('Fotoğraf çekilirken bir hata oluştu');
    }
  };

  const handleContinue = () => {
    if (!photo) {
      alert('Lütfen önce bir fotoğraf çekin');
      return;
    }

    console.log('handleContinue called with photo:', photo);

    // Önce modalı kapat, sonra fotoğrafı gönder
    setModalVisible(false);
    
    // Biraz bekleyip fotoğrafı gönder
    setTimeout(() => {
      onPhotoTaken(photo);
    }, 300);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleModal} style={styles.addButton}>
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        onBackButtonPress={toggleModal}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Yeni Kombin</Text>
          
          {photo ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: photo }} style={styles.photoPreview} />
            </View>
          ) : null}

          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Fotoğraf Çek</Text>
          </TouchableOpacity>

          {photo && (
            <TouchableOpacity style={[styles.button, styles.continueButton]} onPress={handleContinue}>
              <Ionicons name="arrow-forward" size={24} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Nereye Bakalım?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
            <Text style={styles.closeButtonText}>İptal</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  addButton: {
    backgroundColor: '#000',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  photoPreviewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoPreview: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 25,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  continueButton: {
    backgroundColor: '#2196F3',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
  },
  closeButtonText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default AddButton;
