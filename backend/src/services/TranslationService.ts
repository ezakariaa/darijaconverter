import OpenAI from 'openai';

export class TranslationService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async translateText(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    try {
      const prompt = this.buildTranslationPrompt(text, sourceLanguage, targetLanguage);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Vous êtes un expert traducteur spécialisé dans la traduction de l'arabe dialectal marocain (darija) vers le français. Traduisez fidèlement le sens et l'intention du message."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const translation = completion.choices[0]?.message?.content;
      if (!translation) {
        throw new Error('No translation received');
      }

      return translation.trim();
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Failed to translate text');
    }
  }

  private buildTranslationPrompt(text: string, sourceLanguage: string, targetLanguage: string): string {
    const languageNames = {
      'ar': 'arabe dialectal marocain (darija)',
      'fr': 'français',
      'en': 'anglais',
      'es': 'espagnol'
    };

    const sourceLang = languageNames[sourceLanguage as keyof typeof languageNames] || sourceLanguage;
    const targetLang = languageNames[targetLanguage as keyof typeof languageNames] || targetLanguage;

    return `Traduisez le texte suivant du ${sourceLang} vers le ${targetLang}:

Texte original:
"${text}"

Instructions:
- Conservez le sens et l'intention du message
- Adaptez la traduction pour qu'elle soit naturelle en ${targetLang}
- Si le texte contient des expressions culturelles spécifiques, expliquez-les ou trouvez un équivalent approprié
- Gardez un registre de langue cohérent avec l'original

Traduction:`;
  }

  async translateWithContext(text: string, context: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    try {
      const prompt = `Contexte: ${context}

Texte à traduire du ${sourceLanguage} vers le ${targetLanguage}:
"${text}"

Traduisez en tenant compte du contexte fourni:`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Vous êtes un traducteur expert qui prend en compte le contexte pour fournir des traductions précises et appropriées."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      });

      const translation = completion.choices[0]?.message?.content;
      if (!translation) {
        throw new Error('No translation received');
      }

      return translation.trim();
    } catch (error) {
      console.error('Translation with context error:', error);
      throw new Error('Failed to translate text with context');
    }
  }
}
