export interface ConversionState {
  audioId: string | null;
  conversionId: string | null;
  status: 'idle' | 'uploading' | 'converting' | 'completed' | 'error';
  progress: number;
  originalAudio: string | null;
  convertedAudio: string | null;
  transcription: string | null;
  translation: string | null;
}
