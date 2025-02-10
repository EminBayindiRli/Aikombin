import AsyncStorage from '@react-native-async-storage/async-storage';

const OUTFITS_KEY = '@aikombin_outfits';

export const saveOutfitToStorage = async (outfit) => {
  try {
    // Mevcut outfitleri al
    const outfitsJson = await AsyncStorage.getItem(OUTFITS_KEY);
    const outfits = outfitsJson ? JSON.parse(outfitsJson) : [];
    
    // Yeni outfit'i ekle
    const newOutfit = {
      ...outfit,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    outfits.push(newOutfit);
    
    // Güncellenmiş listeyi kaydet
    await AsyncStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits));
    console.log('Outfit saved to local storage:', newOutfit);
    
    return newOutfit;
  } catch (error) {
    console.error('Error saving outfit to storage:', error);
    throw error;
  }
};

export const getOutfitsFromStorage = async () => {
  try {
    const outfitsJson = await AsyncStorage.getItem(OUTFITS_KEY);
    return outfitsJson ? JSON.parse(outfitsJson) : [];
  } catch (error) {
    console.error('Error getting outfits from storage:', error);
    throw error;
  }
};

export const deleteOutfitFromStorage = async (outfitId) => {
  try {
    const outfits = await getOutfitsFromStorage();
    const updatedOutfits = outfits.filter(outfit => outfit.id !== outfitId);
    await AsyncStorage.setItem(OUTFITS_KEY, JSON.stringify(updatedOutfits));
    console.log('Outfit deleted from storage:', outfitId);
  } catch (error) {
    console.error('Error deleting outfit from storage:', error);
    throw error;
  }
};
