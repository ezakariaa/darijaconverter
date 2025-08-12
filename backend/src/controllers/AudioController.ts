import { Request, Response, NextFunction } from 'express';
import { AudioService } from '../services/AudioService';
import { TranscriptionService } from '../services/TranscriptionService';
import { TranslationService } from '../services/TranslationService';
import { TextToSpeechService } from '../services/TextToSpeechService';

export class AudioController {
  private audioService: AudioService;
  private transcriptionService: TranscriptionService;
  private translationService: TranslationService;
  private textToSpeechService: TextToSpeechService;

  constructor() {
    this.audioService = new AudioService();
    this.transcriptionService = new TranscriptionService();
    this.translationService = new TranslationService();
    this.textToSpeechService = new TextToSpeechService();
  }

  uploadAudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
      }

      const audioBuffer = req.file.buffer;
      const originalName = req.file.originalname;
      
      // Sauvegarder l'audio temporairement
      const audioId = await this.audioService.saveAudio(audioBuffer, originalName);
      
      res.json({ 
        success: true, 
        audioId, 
        message: 'Audio uploaded successfully' 
      });
    } catch (error) {
      next(error);
    }
  };

  convertAudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { audioId, targetLanguage = 'fr' } = req.body;

      if (!audioId) {
        return res.status(400).json({ error: 'Audio ID is required' });
      }

      // Démarrer la conversion en arrière-plan
      const conversionId = await this.audioService.startConversion(audioId, targetLanguage);
      
      res.json({ 
        success: true, 
        conversionId, 
        message: 'Conversion started' 
      });

      // Traitement en arrière-plan
      this.processConversion(audioId, conversionId, targetLanguage);
    } catch (error) {
      next(error);
    }
  };

  getConversionStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const status = await this.audioService.getConversionStatus(id);
      res.json(status);
    } catch (error) {
      next(error);
    }
  };

  downloadConvertedAudio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const audioStream = await this.audioService.getConvertedAudio(id);
      
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Disposition', `attachment; filename="converted_${id}.wav"`);
      
      audioStream.pipe(res);
    } catch (error) {
      next(error);
    }
  };

  private async processConversion(audioId: string, conversionId: string, targetLanguage: string) {
    try {
      // 1. Transcription (darija → texte)
      const transcription = await this.transcriptionService.transcribeAudio(audioId);
      
      // 2. Traduction (texte darija → français)
      const translation = await this.translationService.translateText(transcription, 'ar', targetLanguage);
      
      // 3. Synthèse vocale (texte français → audio)
      const audioBuffer = await this.textToSpeechService.synthesizeSpeech(translation, targetLanguage);
      
      // 4. Sauvegarder l'audio converti
      await this.audioService.saveConvertedAudio(conversionId, audioBuffer);
      
      // 5. Mettre à jour le statut
      await this.audioService.updateConversionStatus(conversionId, 'completed');
      
    } catch (error) {
      console.error('Conversion error:', error);
      await this.audioService.updateConversionStatus(conversionId, 'failed');
    }
  }
}
