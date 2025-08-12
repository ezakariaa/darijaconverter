import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio, X } from 'lucide-react';

interface AudioUploaderProps {
  onAudioUploaded: (audioFile: File) => void;
  disabled: boolean;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({
  onAudioUploaded,
  disabled
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const audioFile = acceptedFiles[0];
      onAudioUploaded(audioFile);
    }
  }, [onAudioUploaded]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles,
    fileRejections
  } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled
  });

  const removeFile = () => {
    // Reset the dropzone - acceptedFiles is readonly, so we can't modify it directly
    // The dropzone will reset automatically when a new file is selected
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('audio/')) {
      return <FileAudio className="w-8 h-8 text-blue-500" />;
    }
    return <FileAudio className="w-8 h-8 text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-3">
          <Upload className={`w-12 h-12 mx-auto ${isDragActive ? 'text-primary-500' : 'text-gray-400'}`} />
          
          {isDragActive ? (
            <p className="text-primary-600 font-medium">Déposez le fichier audio ici...</p>
          ) : (
            <div>
              <p className="text-gray-600 font-medium">
                Glissez-déposez un fichier audio ici, ou cliquez pour sélectionner
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Formats supportés: MP3, WAV, M4A, AAC, OGG, WEBM (max 50MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Accepted Files */}
      {acceptedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Fichier sélectionné :</h4>
          
          {acceptedFiles.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file)}
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)} • {file.type}
                  </p>
                </div>
              </div>
              
              <button
                onClick={removeFile}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                title="Supprimer le fichier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-red-700">Fichiers rejetés :</h4>
          
          {fileRejections.map(({ file, errors }) => (
            <div
              key={file.name}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <FileAudio className="w-6 h-6 text-red-500" />
                <div>
                  <p className="font-medium text-red-900">{file.name}</p>
                  <p className="text-sm text-red-600">
                    {errors.map(e => e.message).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600 text-center">
        <p>
          <strong>Conseils :</strong> Pour de meilleurs résultats, utilisez des fichiers audio clairs 
          avec une voix bien distincte en darija.
        </p>
      </div>
    </div>
  );
};

export default AudioUploader;
