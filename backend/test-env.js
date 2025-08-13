require('dotenv').config();

console.log('=== Test des variables d\'environnement ===');
console.log('PORT:', process.env.PORT);
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Chargée' : '❌ Manquante');
console.log('UPLOAD_DIR:', process.env.UPLOAD_DIR);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

if (process.env.OPENAI_API_KEY) {
  console.log('Longueur de la clé API:', process.env.OPENAI_API_KEY.length);
  console.log('Début de la clé:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
}
