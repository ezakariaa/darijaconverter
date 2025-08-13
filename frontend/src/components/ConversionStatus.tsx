import React from 'react';
import { Download, RotateCcw, Volume2, FileText, Languages } from 'lucide-react';
import { ConversionState } from '../types';

interface ConversionStatusProps {
  conversionState: ConversionState;
  onDownload: () => void;
  onReset: () => void;
}

const ConversionStatus: React.FC<ConversionStatusProps> = ({
  conversionState,
  onDownload,
  onReset
}) => {
  // Removed unused state variables
  
  const getStatusIcon = () => {
    switch (conversionState.status) {
      case 'idle':
        return <div className="w-8 h-8 bg-gray-200 rounded-full" />;
      case 'uploading':
        return <div className="w-8 h-8 bg-blue-200 rounded-full animate-pulse" />;
      case 'converting':
        return <div className="w-8 h-8 bg-yellow-200 rounded-full animate-spin" />;
      case 'completed':
        return <div className="w-8 h-8 bg-green-200 rounded-full" />;
      case 'error':
        return <div className="w-8 h-8 bg-red-200 rounded-full" />;
      default:
        return <div className="w-8 h-8 bg-gray-200 rounded-full" />;
    }
  };

  const getStatusText = () => {
    switch (conversionState.status) {
      case 'idle':
        return 'En attente d\'audio';
      case 'uploading':
        return 'Upload en cours...';
      case 'converting':
        return 'Conversion en cours...';
      case 'completed':
        return 'Conversion terminée !';
      case 'error':
        return 'Erreur de conversion';
      default:
        return 'Statut inconnu';
    }
  };

  const getStatusColor = () => {
    switch (conversionState.status) {
      case 'idle':
        return 'text-gray-600';
      case 'uploading':
        return 'text-blue-600';
      case 'converting':
        return 'text-yellow-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (conversionState.status === 'idle') {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Volume2 className="w-5 h-5 mr-2 text-primary-600" />
          Statut de Conversion
        </h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Volume2 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">
            Enregistrez ou uploadez un fichier audio pour commencer la conversion
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Volume2 className="w-5 h-5 mr-2 text-primary-600" />
          Statut de Conversion
        </h2>
        
        <div className="space-y-4">
          {/* Status Indicator */}
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <p className={`font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </p>
              {conversionState.status === 'converting' && (
                <p className="text-sm text-gray-500">
                  Progression: {conversionState.progress}%
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {conversionState.status === 'converting' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${conversionState.progress}%` }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {conversionState.status === 'completed' && (
              <button
                onClick={onDownload}
                className="btn-primary flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger l'audio
              </button>
            )}
            
            {(conversionState.status === 'converting' || conversionState.status === 'completed' || conversionState.status === 'error') && (
              <button
                onClick={onReset}
                className="btn-secondary flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Recommencer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Cards */}
      {conversionState.status === 'completed' && (
        <>
          {/* Transcription */}
          {conversionState.transcription && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Transcription (Darija)
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 leading-relaxed">
                  {conversionState.transcription}
                </p>
              </div>
            </div>
          )}

          {/* Translation */}
          {conversionState.translation && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Languages className="w-5 h-5 mr-2 text-green-600" />
                Traduction (Français)
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800 leading-relaxed">
                  {conversionState.translation}
                </p>
              </div>
            </div>
          )}

          {/* Audio Preview */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Aperçu Audio</h3>
            <div className="space-y-4">
              {conversionState.originalAudio && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Audio original (Darija) :</p>
                  <audio controls className="w-full" src={conversionState.originalAudio} />
                </div>
              )}
              
              {conversionState.convertedAudio && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Audio converti (Français) :</p>
                  <audio controls className="w-full" src={conversionState.convertedAudio} />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Error State */}
      {conversionState.status === 'error' && (
        <div className="card border-red-200 bg-red-50">
          <h3 className="text-lg font-semibold mb-3 text-red-800">
            Erreur de Conversion
          </h3>
          <p className="text-red-700 mb-4">
            Une erreur s'est produite lors de la conversion. Veuillez réessayer.
          </p>
          <button
            onClick={onReset}
            className="btn-secondary flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Recommencer
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversionStatus;
