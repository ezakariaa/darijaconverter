import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, RotateCcw } from 'lucide-react';

interface AudioRecorderProps {
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
  onAudioRecorded: (audioBlob: Blob) => void;
  disabled: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  isRecording,
  onRecordingChange,
  onAudioRecorded,
  disabled
}) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onAudioRecorded(audioBlob);
        
        // Arrêter le stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      onRecordingChange(true);
      setRecordingTime(0);
      setIsPaused(false);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Erreur lors de l\'accès au microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      onRecordingChange(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const resetRecording = () => {
    setRecordingTime(0);
    setAudioURL(null);
    setIsPaused(false);
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 rounded-full flex items-center justify-center text-white transition-colors duration-200"
          >
            <Mic className="w-8 h-8" />
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={stopRecording}
              className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors duration-200"
            >
              <Square className="w-6 h-6" />
            </button>
            
            {isPaused ? (
              <button
                onClick={resumeRecording}
                className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors duration-200"
              >
                <Mic className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={pauseRecording}
                className="w-12 h-12 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center text-white transition-colors duration-200"
              >
                <Square className="w-6 h-6" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Recording Time */}
      {isRecording && (
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-red-500">
            {formatTime(recordingTime)}
          </div>
          <div className="text-sm text-gray-600">
            {isPaused ? 'En pause' : 'Enregistrement...'}
          </div>
        </div>
      )}

      {/* Audio Preview */}
      {audioURL && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">Aperçu de l'enregistrement :</div>
          <audio controls className="w-full" src={audioURL} />
          <button
            onClick={resetRecording}
            className="btn-secondary w-full flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Recommencer
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600 text-center">
        {!isRecording ? (
          <p>Cliquez sur le bouton rouge pour commencer l'enregistrement</p>
        ) : (
          <p>Parlez clairement en darija dans votre microphone</p>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
