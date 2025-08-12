import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Erreur de validation multer
  if (error.message === 'Only audio files are allowed') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only audio files are allowed'
    });
  }

  // Erreur de taille de fichier
  if (error.message && error.message.includes('File too large')) {
    return res.status(400).json({
      error: 'File too large',
      message: 'Maximum file size is 50MB'
    });
  }

  // Erreur OpenAI
  if (error.message && error.message.includes('OpenAI')) {
    return res.status(500).json({
      error: 'AI Service Error',
      message: 'Error with AI processing service'
    });
  }

  // Erreur de transcription
  if (error.message && error.message.includes('Failed to transcribe')) {
    return res.status(500).json({
      error: 'Transcription Error',
      message: 'Failed to convert audio to text'
    });
  }

  // Erreur de traduction
  if (error.message && error.message.includes('Failed to translate')) {
    return res.status(500).json({
      error: 'Translation Error',
      message: 'Failed to translate text'
    });
  }

  // Erreur de synthèse vocale
  if (error.message && error.message.includes('Failed to synthesize')) {
    return res.status(500).json({
      error: 'Speech Synthesis Error',
      message: 'Failed to convert text to speech'
    });
  }

  // Erreur par défaut
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: 'Server Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
