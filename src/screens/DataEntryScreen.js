import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';

const DataEntryScreen = ({ route, navigation }) => {
  const { image } = route.params;
  const [occasion, setOccasion] = useState('');
  const [season, setSeason] = useState('');
  const [stylePreference, setStylePreference] = useState('');
  const [colorPreference, setColorPreference] = useState([]);
  const [eventType, setEventType] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');

  const occasions = [
    { id: 'casual', label: 'Günlük' },
    { id: 'formal', label: 'Resmi' },
    { id: 'business', label: 'İş' },
    { id: 'party', label: 'Parti' },
    { id: 'date', label: 'Randevu' },
  ];

  const seasons = [
    { id: 'summer', label: 'Yaz ☀️' },
    { id: 'fall', label: 'Sonbahar 🍂' },
    { id: 'winter', label: 'Kış ❄️' },
    { id: 'spring', label: 'İlkbahar 🌸' },
  ];

  const stylePreferences = [
    { id: 'minimalist', label: 'Minimalist' },
    { id: 'colorful', label: 'Renkli' },
    { id: 'classic', label: 'Klasik' },
    { id: 'trendy', label: 'Trend' },
    { id: 'vintage', label: 'Vintage' },
  ];

  const colorPreferences = [
    { id: 'black', label: 'Siyah ⚫' },
    { id: 'white', label: 'Beyaz ⚪' },
    { id: 'blue', label: 'Mavi 🔵' },
    { id: 'red', label: 'Kırmızı 🔴' },
    { id: 'green', label: 'Yeşil 💚' },
    { id: 'yellow', label: 'Sarı 💛' },
    { id: 'purple', label: 'Mor 💜' },
    { id: 'pink', label: 'Pembe 💗' },
  ];

  const eventTypes = [
    { id: 'daily', label: 'Günlük' },
    { id: 'business', label: 'İş' },
    { id: 'party', label: 'Parti' },
    { id: 'wedding', label: 'Düğün' },
    { id: 'sports', label: 'Spor' },
  ];

  const timesOfDay = [
    { id: 'morning', label: 'Sabah 🌅' },
    { id: 'afternoon', label: 'Öğlen ☀️' },
    { id: 'evening', label: 'Akşam 🌆' },
    { id: 'night', label: 'Gece 🌙' },
  ];

  const analyzeOutfit = async () => {
    if (!occasion || !season || !stylePreference || !eventType || !timeOfDay) {
      alert('Lütfen gerekli alanları doldurun');
      return;
    }

    // Yapay zeka analizi için sonuç ekranına git
    navigation.navigate('AnalysisResult', {
      image,
      occasion,
      season,
      stylePreference,
      colorPreference,
      eventType,
      timeOfDay,
    });
  };

  const SelectionGroup = ({ title, options, selected, onSelect, multiSelect = false }) => (
    <View style={styles.selectionGroup}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              multiSelect
                ? selected.includes(option.id) && styles.selectedOption
                : selected === option.id && styles.selectedOption
            ]}
            onPress={() => onSelect(option.id)}
          >
            <Text style={[
              styles.optionText,
              multiSelect
                ? selected.includes(option.id) && styles.selectedOptionText
                : selected === option.id && styles.selectedOptionText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Image source={{ uri: image }} style={styles.image} />

        <SelectionGroup
          title="Durum"
          options={occasions}
          selected={occasion}
          onSelect={setOccasion}
        />

        <SelectionGroup
          title="Mevsim"
          options={seasons}
          selected={season}
          onSelect={setSeason}
        />

        <SelectionGroup
          title="Stil Tercihi"
          options={stylePreferences}
          selected={stylePreference}
          onSelect={setStylePreference}
        />

        <SelectionGroup
          title="Renk Tercihleri (Birden fazla seçebilirsiniz)"
          options={colorPreferences}
          selected={colorPreference}
          onSelect={(id) => {
            setColorPreference(prev => {
              if (prev.includes(id)) {
                return prev.filter(p => p !== id);
              }
              return [...prev, id];
            });
          }}
          multiSelect={true}
        />

        <SelectionGroup
          title="Etkinlik Türü"
          options={eventTypes}
          selected={eventType}
          onSelect={setEventType}
        />

        <SelectionGroup
          title="Günün Zamanı"
          options={timesOfDay}
          selected={timeOfDay}
          onSelect={setTimeOfDay}
        />

        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={analyzeOutfit}
        >
          <Text style={styles.analyzeButtonText}>Kombini Analiz Et</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F3FF',
  },
  content: {
    padding: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    marginBottom: 20,
  },
  selectionGroup: {
    marginBottom: 25,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000000',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  optionText: {
    color: '#000000',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  analyzeButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DataEntryScreen;
