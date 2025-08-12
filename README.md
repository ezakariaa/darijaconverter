# 🎤 Darija Converter

**Convertisseur Audio Darija-Français** - Une application web moderne qui transforme votre audio en darija (arabe dialectal marocain) en français grâce à l'intelligence artificielle.

## ✨ Fonctionnalités

- 🎙️ **Enregistrement audio en direct** via le microphone
- 📁 **Upload de fichiers audio** (MP3, WAV, M4A, AAC, OGG, WEBM)
- 🧠 **Transcription IA** avec OpenAI Whisper
- 🌍 **Traduction intelligente** darija → français
- 🔊 **Synthèse vocale** avec OpenAI TTS
- 📱 **Interface responsive** optimisée mobile et desktop
- ⚡ **Temps réel** - suivi de la progression en direct

## 🏗️ Architecture

```
darijaconverter/
├── backend/                 # API Node.js + TypeScript
│   ├── src/
│   │   ├── controllers/    # Contrôleurs API
│   │   ├── services/       # Services métier
│   │   ├── middleware/     # Middleware Express
│   │   └── routes/         # Routes API
│   └── package.json
├── frontend/               # Application React + TypeScript
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── services/       # Services API
│   │   └── ...
│   └── package.json
└── package.json            # Scripts globaux
```

## 🚀 Technologies Utilisées

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **OpenAI API** - Whisper (transcription) + GPT-4 (traduction) + TTS
- **FFmpeg** - Traitement audio
- **Multer** - Upload de fichiers
- **CORS** + **Helmet** - Sécurité

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** - Styling moderne
- **React Dropzone** - Upload drag & drop
- **MediaRecorder API** - Enregistrement audio
- **Axios** - Communication API
- **Lucide React** - Icônes

## 📋 Prérequis

- **Node.js** 18+ 
- **npm** ou **yarn**
- **Clé API OpenAI** (obligatoire)
- **FFmpeg** (installé globalement ou via ffmpeg-static)

## 🔧 Installation

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd darijaconverter
```

### 2. Installer les dépendances
```bash
npm run install:all
```

### 3. Configuration des variables d'environnement

#### Backend
```bash
cd backend
cp env.example .env
```

Éditer `.env` :
```env
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
```

#### Frontend
```bash
cd frontend
cp .env.example .env
```

Éditer `.env` :
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Lancer l'application

#### Développement (backend + frontend)
```bash
npm run dev
```

#### Ou séparément :
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

L'application sera accessible sur :
- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:5000

## 🎯 Utilisation

### 1. Enregistrement Audio
- Cliquez sur le bouton rouge pour commencer l'enregistrement
- Parlez clairement en darija dans votre microphone
- Cliquez sur le bouton carré pour arrêter
- Utilisez pause/reprise si nécessaire

### 2. Upload de Fichier
- Glissez-déposez un fichier audio ou cliquez pour sélectionner
- Formats supportés : MP3, WAV, M4A, AAC, OGG, WEBM
- Taille maximale : 50MB

### 3. Conversion
- Sélectionnez la langue cible (français, anglais, espagnol)
- La conversion se fait automatiquement en arrière-plan
- Suivez la progression en temps réel

### 4. Résultats
- **Transcription** : Texte original en darija
- **Traduction** : Texte traduit en français
- **Audio converti** : Fichier audio en français
- **Téléchargement** : Récupérez votre audio converti

## 🔑 Configuration OpenAI

### 1. Obtenir une clé API
- Créez un compte sur [OpenAI](https://platform.openai.com)
- Générez une clé API dans la section "API Keys"
- Ajoutez des crédits à votre compte

### 2. Modèles utilisés
- **Whisper-1** : Transcription audio → texte
- **GPT-4** : Traduction darija → français
- **TTS-1** : Synthèse vocale texte → audio

### 3. Coûts estimés
- **Whisper** : ~$0.006/minute
- **GPT-4** : ~$0.03/1K tokens
- **TTS** : ~$0.015/1K caractères

## 🚀 Déploiement

### Production
```bash
# Build du frontend
cd frontend
npm run build

# Build du backend
cd backend
npm run build

# Démarrer en production
npm start
```

### Docker (optionnel)
```dockerfile
# Dockerfile pour le backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

## 🧪 Tests

```bash
# Tests backend
cd backend
npm test

# Tests frontend
cd frontend
npm test
```

## 📱 Compatibilité Mobile

- **Enregistrement audio** : Compatible avec tous les navigateurs modernes
- **Interface responsive** : Optimisée pour mobile et tablette
- **PWA ready** : Peut être installée comme application mobile

## 🔒 Sécurité

- **Validation des fichiers** : Types et tailles contrôlés
- **CORS configuré** : Accès restreint aux origines autorisées
- **Helmet** : Protection des en-têtes HTTP
- **Limitation de taille** : Fichiers limités à 50MB
- **Nettoyage automatique** : Suppression des fichiers temporaires

## 🐛 Dépannage

### Problèmes courants

#### 1. Erreur d'accès au microphone
- Vérifiez les permissions du navigateur
- Utilisez HTTPS en production
- Testez sur différents navigateurs

#### 2. Erreur OpenAI API
- Vérifiez votre clé API
- Assurez-vous d'avoir des crédits
- Vérifiez les quotas et limites

#### 3. Erreur FFmpeg
- Installez FFmpeg globalement
- Ou utilisez ffmpeg-static (inclus)

#### 4. Problèmes de CORS
- Vérifiez la configuration CORS dans le backend
- Assurez-vous que les origines correspondent

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **OpenAI** pour les modèles d'IA
- **React** et **Node.js** pour les frameworks
- **Tailwind CSS** pour le styling
- **FFmpeg** pour le traitement audio

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

---

**Développé avec ❤️ pour la communauté marocaine et francophone**
