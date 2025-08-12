import React, { useState, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { Download, Play, Pause, RotateCcw, Languages, Mic, Upload } from 'lucide-react';
import AudioRecorder from './components/AudioRecorder';
import AudioUploader from './components/AudioUploader';
import ConversionStatus from './components/ConversionStatus';
import AudioService from './services/AudioService';
import { ConversionState } from './types';

function App() {
  const [conversionState, setConversionState] = useState<ConversionState>({
    audioId: null,
    conversionId: null,
    status: 'idle',
    progress: 0,
    originalAudio: null,
    convertedAudio: null,
    transcription: null,
    translation: null,
  });

  const [isRecording, setIsRecording] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('fr');
  const audioService = useRef(new AudioService());

  const handleAudioRecorded = async (audioBlob: Blob) => {
    try {
      setConversionState(prev => ({ ...prev, status: 'uploading' }));
      
      const audioId = await audioService.current.uploadAudio(audioBlob);
      setConversionState(prev => ({ ...prev, audioId, status: 'converting' }));
      
      // Démarrer la conversion
      const conversionId = await audioService.current.convertAudio(audioId, targetLanguage);
      setConversionState(prev => ({ ...prev, conversionId }));
      
      // Surveiller le statut
      monitorConversion(conversionId);
      
    } catch (error) {
      console.error('Error processing recorded audio:', error);
      toast.error('Erreur lors du traitement de l\'audio enregistré');
      setConversionState(prev => ({ ...prev, status: 'error' }));
    }
  };

  const handleAudioUploaded = async (audioFile: File) => {
    try {
      setConversionState(prev => ({ ...prev, status: 'uploading' }));
      
      const audioId = await audioService.current.uploadAudio(audioFile);
      setConversionState(prev => ({ ...prev, audioId, status: 'converting' }));
      
      // Démarrer la conversion
      const conversionId = await audioService.current.convertAudio(audioId, targetLanguage);
      setConversionState(prev => ({ ...prev, conversionId }));
      
      // Surveiller le statut
      monitorConversion(conversionId);
      
    } catch (error) {
      console.error('Error processing uploaded audio:', error);
      toast.error('Erreur lors du traitement de l\'audio uploadé');
      setConversionState(prev => ({ ...prev, status: 'error' }));
    }
  };

  const monitorConversion = async (conversionId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await audioService.current.getConversionStatus(conversionId);
        
        if (status?.status === 'completed') {
          setConversionState(prev => ({
            ...prev,
            status: 'completed',
            progress: 100,
            convertedAudio: status.id
          }));
          
          // Récupérer les détails de la conversion
          const details = await audioService.current.getConversionDetails(conversionId);
          setConversionState(prev => ({
            ...prev,
            transcription: details.transcription,
            translation: details.translation
          }));
          
          toast.success('Conversion terminée avec succès !');
          clearInterval(interval);
          
        } else if (status?.status === 'failed') {
          setConversionState(prev => ({ ...prev, status: 'error' }));
          toast.error('Échec de la conversion');
          clearInterval(interval);
          
        } else if (status?.progress) {
          setConversionState(prev => ({ ...prev, progress: status.progress }));
        }
        
      } catch (error) {
        console.error('Error monitoring conversion:', error);
        clearInterval(interval);
      }
    }, 1000);
  };

  const resetConversion = () => {
    setConversionState({
      audioId: null,
      conversionId: null,
      status: 'idle',
      progress: 0,
      originalAudio: null,
      convertedAudio: null,
      transcription: null,
      translation: null,
    });
  };

  const downloadConvertedAudio = async () => {
    if (!conversionState.conversionId) return;
    
    try {
      await audioService.current.downloadConvertedAudio(conversionState.conversionId);
    } catch (error) {
      console.error('Error downloading audio:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Languages className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Darija Converter</h1>
                <p className="text-sm text-gray-600">Convertisseur Audio Darija-Français</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="input-field w-32"
              >
                <option value="fr">Français</option>
                <option value="en">Anglais</option>
                <option value="es">Espagnol</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Audio Input */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Mic className="w-5 h-5 mr-2 text-primary-600" />
                Enregistrement Audio
              </h2>
              <AudioRecorder
                isRecording={isRecording}
                onRecordingChange={setIsRecording}
                onAudioRecorded={handleAudioRecorded}
                disabled={conversionState.status !== 'idle'}
              />
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-primary-600" />
                Upload Audio
              </h2>
              <AudioUploader
                onAudioUploaded={handleAudioUploaded}
                disabled={conversionState.status !== 'idle'}
              />
            </div>
          </div>

          {/* Right Column - Conversion Status & Results */}
          <div className="space-y-6">
            <ConversionStatus
              conversionState={conversionState}
              onDownload={downloadConvertedAudio}
              onReset={resetConversion}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 card">
          <h2 className="text-xl font-semibold mb-4">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-medium mb-2">Enregistrez ou Uploadez</h3>
              <p className="text-sm text-gray-600">Parlez en darija ou uploadez un fichier audio existant</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-medium mb-2">Conversion IA</h3>
              <p className="text-sm text-gray-600">Notre IA transcrit, traduit et synthétise l'audio</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-medium mb-2">Téléchargez</h3>
              <p className="text-sm text-gray-600">Récupérez votre audio converti en français</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
