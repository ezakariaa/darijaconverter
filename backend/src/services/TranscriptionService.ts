import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export class TranscriptionService {
  private openai: OpenAI;

  constructor() {
    // S'assurer que dotenv est chargé
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async transcribeAudio(audioId: string): Promise<string> {
    try {
      const audioPath = path.join(__dirname, '../../uploads', `${audioId}.wav`);
      
      if (!fs.existsSync(audioPath)) {
        throw new Error('Audio file not found');
      }

      const audioFile = fs.createReadStream(audioPath);
      
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "ar", // Arabe (darija)
        response_format: "text",
        prompt: "Ceci est un enregistrement en darija (arabe marocain dialectal). Transcrivez fidèlement ce qui est dit."
      });

      return transcription as string;
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async transcribeWithTimestamps(audioId: string): Promise<any> {
    try {
      const audioPath = path.join(__dirname, '../../uploads', `${audioId}.wav`);
      
      if (!fs.existsSync(audioPath)) {
        throw new Error('Audio file not found');
      }

      const audioFile = fs.createReadStream(audioPath);
      
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        language: "ar",
        response_format: "verbose_json",
        timestamp_granularities: ["word"],
        prompt: "Ceci est un enregistrement en darija (arabe marocain dialectal). Transcrivez fidèlement ce qui est dit."
      });

      return transcription;
    } catch (error) {
      console.error('Transcription with timestamps error:', error);
      throw new Error('Failed to transcribe audio with timestamps');
    }
  }
}
