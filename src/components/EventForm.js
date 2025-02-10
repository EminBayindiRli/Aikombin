import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

const EventForm = ({ isVisible, onClose, onSubmit }) => {
  const [occasion, setOccasion] = useState('');
  const [season, setSeason] = useState('');
  const [weather, setWeather] = useState('');
  const [time, setTime] = useState('');
  const [mood, setMood] = useState('');

  const handleSubmit = () => {
    if (!occasion || !season || !weather || !time || !mood) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    console.log('Form gönderiliyor:', { occasion, season, weather, time, mood });

    // Önce Modalı kapat
    onClose();

    // Hemen sonra form verilerini gönder
    onSubmit({
      occasion,
      season,
      weather,
      time,
      mood
    });
  };

  React.useEffect(() => {
    console.log('EventForm isVisible changed:', isVisible);
    if (isVisible) {
      // Form görünür olduğunda state'leri sıfırla
      setOccasion('');
      setSeason('');
      setWeather('');
      setTime('');
      setMood('');
    }
  }, [isVisible]);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={100}
      animationOutTiming={100}
      backdropTransitionInTiming={100}
      backdropTransitionOutTiming={100}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
    >
      <View style={styles.modalContent}>
        <Text style={styles.title}>Nereye Bakalım?</Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="calendar" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Hangi etkinlik için? (ör: iş, düğün, parti)"
              value={occasion}
              onChangeText={setOccasion}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="leaf" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Hangi mevsim için?"
              value={season}
              onChangeText={setSeason}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="sunny" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Hava nasıl? (ör: yağmurlu, güneşli)"
              value={weather}
              onChangeText={setWeather}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="time" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Günün hangi saati? (ör: sabah, akşam)"
              value={time}
              onChangeText={setTime}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="happy" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Kendini nasıl hissediyorsun?"
              value={mood}
              onChangeText={setMood}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, !occasion || !season || !weather || !time || !mood ? styles.submitButtonDisabled : null]}
          onPress={handleSubmit}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>Analiz Et</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>İptal</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  }
});

export default EventForm;
