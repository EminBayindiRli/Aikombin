import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signUp } from '../services/firebase';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Lütfen adınızı girin.');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Hata', 'Lütfen email adresinizi girin.');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Hata', 'Lütfen şifrenizi girin.');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return false;
    }
    if (!agreeToTerms) {
      Alert.alert('Hata', 'Devam etmek için kullanım koşullarını kabul etmelisiniz.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    const { user, error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Hata', error);
      return;
    }

    // Kullanıcı başarıyla oluşturuldu
    Alert.alert(
      'Başarılı',
      'Hesabınız başarıyla oluşturuldu!',
      [{ text: 'Tamam', onPress: () => navigation.navigate('Login') }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>

      <View style={styles.formContainer}>
        <View style={styles.decorativeLine} />
        
        <TextInput
          style={styles.input}
          placeholder="Ad Soyad"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.termsContainer}
          onPress={() => setAgreeToTerms(!agreeToTerms)}
        >
          <View style={styles.checkbox}>
            {agreeToTerms && (
              <Ionicons name="checkmark" size={18} color="#000000" />
            )}
          </View>
          <Text style={styles.termsText}>Kullanım koşullarını kabul ediyorum</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.registerButton, (!agreeToTerms || loading) && styles.disabledButton]}
          onPress={handleRegister}
          disabled={!agreeToTerms || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.registerButtonText}>Kayıt Ol</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.googleButton}
          onPress={() => console.log('Google ile kayıt')}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Google ile Kayıt Ol</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>
            Zaten hesabın var mı? <Text style={styles.loginTextBold}>Giriş Yap</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F3FF',
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 40
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20
  },
  decorativeLine: {
    width: '80%',
    height: 2,
    backgroundColor: '#000000',
    opacity: 0.1,
    borderRadius: 1,
    marginBottom: 40
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 16
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    alignSelf: 'flex-start'
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  termsText: {
    color: '#666666',
    fontSize: 14
  },
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#000000',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  disabledButton: {
    backgroundColor: '#CCCCCC'
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  googleButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10
  },
  googleButtonText: {
    color: '#000000',
    fontSize: 16
  },
  loginLink: {
    marginTop: 'auto',
    marginBottom: 20
  },
  loginText: {
    fontSize: 14,
    color: '#666666'
  },
  loginTextBold: {
    fontWeight: '600',
    color: '#000000'
  }
});

export default RegisterScreen;
