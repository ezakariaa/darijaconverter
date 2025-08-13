// Attendre un peu avant de charger dotenv
setTimeout(() => {
  require('dotenv').config();
  
  console.log('=== Test du serveur ===');
  console.log('OPENAI_API_KEY chargée:', !!process.env.OPENAI_API_KEY);
  
  try {
    // Essayer de créer une instance OpenAI
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ Instance OpenAI créée avec succès');
    
    // Démarrer le serveur
    const app = require('./dist/index.js');
    console.log('✅ Serveur démarré avec succès');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}, 1000);
