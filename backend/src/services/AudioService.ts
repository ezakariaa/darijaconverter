import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

// Configuration ffmpeg
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

interface ConversionStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AudioService {
  private uploadsDir: string;
  private conversionsDir: string;
  private conversions: Map<string, ConversionStatus>;

  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads');
    this.conversionsDir = path.join(__dirname, '../../conversions');
    this.conversions = new Map();
    
    this.ensureDirectories();
  }

  private ensureDirectories() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(this.conversionsDir)) {
      fs.mkdirSync(this.conversionsDir, { recursive: true });
    }
  }

  async saveAudio(audioBuffer: Buffer, originalName: string): Promise<string> {
    const audioId = uuidv4();
    const filePath = path.join(this.uploadsDir, `${audioId}.wav`);
    
    // Convertir en WAV si nécessaire
    await this.convertToWav(audioBuffer, filePath);
    
    return audioId;
  }

  async startConversion(audioId: string, targetLanguage: string): Promise<string> {
    const conversionId = uuidv4();
    
    const conversion: ConversionStatus = {
      id: conversionId,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.conversions.set(conversionId, conversion);
    
    return conversionId;
  }

  async getConversionStatus(conversionId: string): Promise<ConversionStatus | null> {
    return this.conversions.get(conversionId) || null;
  }

  async updateConversionStatus(conversionId: string, status: ConversionStatus['status'], progress?: number, message?: string) {
    const conversion = this.conversions.get(conversionId);
    if (conversion) {
      conversion.status = status;
      if (progress !== undefined) conversion.progress = progress;
      if (message) conversion.message = message;
      conversion.updatedAt = new Date();
    }
  }

  async saveConvertedAudio(conversionId: string, audioBuffer: Buffer): Promise<void> {
    const filePath = path.join(this.conversionsDir, `${conversionId}.wav`);
    fs.writeFileSync(filePath, audioBuffer);
  }

  async getConvertedAudio(conversionId: string): Promise<fs.ReadStream> {
    const filePath = path.join(this.conversionsDir, `${conversionId}.wav`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Converted audio not found');
    }
    
    return fs.createReadStream(filePath);
  }

  private async convertToWav(audioBuffer: Buffer, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Créer un fichier temporaire
      const tempPath = outputPath + '.temp';
      fs.writeFileSync(tempPath, audioBuffer);
      
      ffmpeg(tempPath)
        .toFormat('wav')
        .audioChannels(1)
        .audioFrequency(16000)
        .on('end', () => {
          fs.unlinkSync(tempPath);
          resolve();
        })
        .on('error', (err) => {
          fs.unlinkSync(tempPath);
          reject(err);
        })
        .save(outputPath);
    });
  }

  async cleanupOldFiles(): Promise<void> {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 heures
    
    // Nettoyer les uploads
    const uploadFiles = fs.readdirSync(this.uploadsDir);
    for (const file of uploadFiles) {
      const filePath = path.join(this.uploadsDir, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Nettoyer les conversions
    const conversionFiles = fs.readdirSync(this.conversionsDir);
    for (const file of conversionFiles) {
      const filePath = path.join(this.conversionsDir, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
      }
    }
  }
}
