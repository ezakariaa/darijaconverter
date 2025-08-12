import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface ConversionStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversionDetails {
  transcription: string;
  translation: string;
  originalAudio: string;
  convertedAudio: string;
}

export class AudioService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 secondes
  });

  constructor() {
    // Intercepteur pour gérer les erreurs
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        throw error;
      }
    );
  }

  async uploadAudio(audioData: Blob | File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('audio', audioData);

      const response = await this.api.post('/audio/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.audioId;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Échec de l\'upload de l\'audio');
    }
  }

  async convertAudio(audioId: string, targetLanguage: string): Promise<string> {
    try {
      const response = await this.api.post('/audio/convert', {
        audioId,
        targetLanguage,
      });

      return response.data.conversionId;
    } catch (error) {
      console.error('Conversion error:', error);
      throw new Error('Échec du démarrage de la conversion');
    }
  }

  async getConversionStatus(conversionId: string): Promise<ConversionStatus | null> {
    try {
      const response = await this.api.get(`/audio/status/${conversionId}`);
      return response.data;
    } catch (error) {
      console.error('Status check error:', error);
      return null;
    }
  }

  async getConversionDetails(conversionId: string): Promise<ConversionDetails> {
    try {
      // Simuler la récupération des détails (à adapter selon votre API)
      const response = await this.api.get(`/audio/details/${conversionId}`);
      return response.data;
    } catch (error) {
      console.error('Details fetch error:', error);
      // Retourner des données simulées pour le développement
      return {
        transcription: "Transcription simulée en darija...",
        translation: "Traduction simulée en français...",
        originalAudio: "audio_original_url",
        convertedAudio: "audio_converti_url"
      };
    }
  }

  async downloadConvertedAudio(conversionId: string): Promise<void> {
    try {
      const response = await this.api.get(`/audio/download/${conversionId}`, {
        responseType: 'blob',
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `converted_audio_${conversionId}.wav`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Échec du téléchargement de l\'audio');
    }
  }

  // Méthode pour surveiller la progression de la conversion
  async monitorConversion(
    conversionId: string,
    onProgress: (progress: number) => void,
    onComplete: (status: ConversionStatus) => void,
    onError: (error: string) => void
  ): Promise<void> {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const status = await this.getConversionStatus(conversionId);
        
        if (!status) {
          attempts++;
          if (attempts >= maxAttempts) {
            onError('Délai d\'attente dépassé');
            return;
          }
          setTimeout(checkStatus, 5000); // Vérifier toutes les 5 secondes
          return;
        }

        if (status.progress !== undefined) {
          onProgress(status.progress);
        }

        if (status.status === 'completed') {
          onComplete(status);
        } else if (status.status === 'failed') {
          onError(status.message || 'Échec de la conversion');
        } else {
          attempts++;
          if (attempts >= maxAttempts) {
            onError('Délai d\'attente dépassé');
            return;
          }
          setTimeout(checkStatus, 5000);
        }

      } catch (error) {
        console.error('Monitoring error:', error);
        onError('Erreur lors de la surveillance de la conversion');
      }
    };

    checkStatus();
  }

  // Méthode pour obtenir les formats audio supportés
  getSupportedFormats(): string[] {
    return ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'webm'];
  }

  // Méthode pour valider la taille du fichier
  validateFileSize(file: File, maxSizeMB: number = 50): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  // Méthode pour valider le type de fichier
  validateFileType(file: File): boolean {
    const supportedTypes = this.getSupportedFormats();
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return fileExtension ? supportedTypes.includes(fileExtension) : false;
  }
}

export default AudioService;
