import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import { FontAwesome5 } from '@expo/vector-icons';

const LoadingModal = ({ isVisible }) => {
  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.7}
      animationIn="fadeIn"
      animationOut="fadeOut"
      useNativeDriver={true}
      style={styles.modal}
    >
      <View style={styles.container}>
        <FontAwesome5 name="tshirt" size={60} color="#4CAF50" style={styles.icon} />
        <ActivityIndicator size="large" color="#4CAF50" style={styles.spinner} />
        <Text style={styles.text}>Kombin Analiz Ediliyor...</Text>
        <Text style={styles.subText}>Yapay zeka stilinizi değerlendiriyor</Text>
        <Text style={styles.subText}>Lütfen bekleyin</Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 300,
  },
  spinner: {
    marginVertical: 20,
    transform: [{ scale: 1.2 }],
  },
  icon: {
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default LoadingModal;
