import { Router } from 'express';
import multer from 'multer';
import { AudioController } from '../controllers/AudioController';

const router = Router();
const audioController = new AudioController();

// Configuration multer pour l'upload d'audio
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Routes
router.post('/upload', upload.single('audio'), audioController.uploadAudio);
router.post('/convert', audioController.convertAudio);
router.get('/status/:id', audioController.getConversionStatus);
router.get('/download/:id', audioController.downloadConvertedAudio);

export { router as audioRoutes };
