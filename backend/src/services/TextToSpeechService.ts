import OpenAI from 'openai';

export class TextToSpeechService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async synthesizeSpeech(text: string, language: string): Promise<Buffer> {
    try {
      // Déterminer la voix appropriée selon la langue
      const voice = this.getVoiceForLanguage(language);
      
      const response = await this.openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: text,
        response_format: "wav",
        speed: 1.0
      });

      // Convertir le stream en Buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.body as any) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Text-to-speech error:', error);
      throw new Error('Failed to synthesize speech');
    }
  }

  private getVoiceForLanguage(language: string): "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" {
    // Mapping des langues vers les voix OpenAI
    const voiceMapping: Record<string, "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"> = {
      'fr': 'nova',      // Voix féminine claire pour le français
      'en': 'alloy',     // Voix neutre pour l'anglais
      'es': 'echo',      // Voix masculine pour l'espagnol
      'ar': 'fable',     // Voix féminine pour l'arabe
      'default': 'nova'
    };

    return voiceMapping[language] || voiceMapping['default'];
  }

  async synthesizeWithCustomSettings(
    text: string, 
    language: string, 
    speed: number = 1.0,
    voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"
  ): Promise<Buffer> {
    try {
      const selectedVoice = voice || this.getVoiceForLanguage(language);
      
      // Limiter la vitesse entre 0.25 et 4.0
      const safeSpeed = Math.max(0.25, Math.min(4.0, speed));
      
      const response = await this.openai.audio.speech.create({
        model: "tts-1",
        voice: selectedVoice,
        input: text,
        response_format: "wav",
        speed: safeSpeed
      });

      // Convertir le stream en Buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.body as any) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Custom text-to-speech error:', error);
      throw new Error('Failed to synthesize speech with custom settings');
    }
  }

  async synthesizeWithEmotion(
    text: string, 
    language: string, 
    emotion: 'happy' | 'sad' | 'neutral' | 'excited' | 'calm'
  ): Promise<Buffer> {
    try {
      // Adapter le texte selon l'émotion souhaitée
      const emotionalText = this.addEmotionalContext(text, emotion);
      
      return await this.synthesizeSpeech(emotionalText, language);
    } catch (error) {
      console.error('Emotional text-to-speech error:', error);
      throw new Error('Failed to synthesize emotional speech');
    }
  }

  private addEmotionalContext(text: string, emotion: string): string {
    const emotionalPrefixes: Record<string, string> = {
      'happy': '[Avec joie et enthousiasme] ',
      'sad': '[Avec tristesse et émotion] ',
      'excited': '[Avec excitation et énergie] ',
      'calm': '[Avec calme et sérénité] ',
      'neutral': ''
    };

    const prefix = emotionalPrefixes[emotion] || '';
    return prefix + text;
  }
}
