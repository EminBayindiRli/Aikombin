import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Firebase Error:', error.code, error.message);
    let errorMessage = 'Kayıt olurken bir hata oluştu.';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Bu email adresi zaten kullanımda.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Geçersiz email adresi.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Şifre çok zayıf.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Email/Şifre girişi etkin değil.';
        break;
      default:
        errorMessage = `Kayıt hatası: ${error.message}`;
    }
    return { user: null, error: errorMessage };
  }
};

export const signIn = async (email, password) => {
  try {
    console.log('Giriş deneniyor:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Giriş başarılı:', userCredential.user.email);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Firebase Giriş Hatası:', error.code, error.message);
    let errorMessage = 'Giriş yaparken bir hata oluştu.';
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Geçersiz email adresi.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Bu hesap devre dışı bırakılmış.';
        break;
      case 'auth/user-not-found':
        errorMessage = 'Kullanıcı bulunamadı.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Hatalı şifre.';
        break;
      default:
        errorMessage = `Giriş hatası: ${error.message}`;
    }
    return { user: null, error: errorMessage };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: 'Çıkış yaparken bir hata oluştu.' };
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};


