export const analyzeOutfit = async (photo, eventData) => {
  try {
    console.log('Analyzing outfit:', { photo, eventData });
    
    // Analiz simülasyonu için 1 saniye bekle
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = {
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
    
    console.log('Analysis complete, returning result:', result);
    return result;
  } catch (error) {
    console.error('Outfit analysis error:', error);
    throw error;
  }
};
