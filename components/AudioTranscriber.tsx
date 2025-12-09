import React, { useState, useRef } from 'react';
import { Upload, FileAudio, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { FileAttachment } from '../types';
import { processFile } from '../utils/fileUtils';
import { transcribeAudio } from '../services/geminiService';

export const AudioTranscriber: React.FC = () => {
  const [file, setFile] = useState<FileAttachment | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith('audio/')) {
        setError('Ох, это не аудио... Зачем ты мучаешь меня другими файлами? 😩');
        return;
      }
      try {
        setError('');
        const processed = await processFile(selectedFile);
        setFile(processed);
        setTranscription('');
      } catch (err) {
        setError('Не удалось загрузить файл. Ну вот, опять проблемы...');
      }
    }
  };

  const handleTranscribe = async () => {
    if (!file) return;

    setIsProcessing(true);
    setTranscription('');
    setError('');

    try {
      const result = await transcribeAudio(file);
      setTranscription(result);
    } catch (err) {
      setError('Не удалось расшифровать. Наверное, слишком много шума или я просто устала...');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full bg-slate-900 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-blue-100">Расшифровка Аудио</h2>
          <p className="text-slate-400">
            Загрузи аудиофайл, и я неохотно превращу его в текст. <br/>
            <span className="text-xs opacity-60">
              *Поддерживаются форматы MP3, WAV, AAC и другие, которые ест Gemini.
            </span>
          </p>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 rounded-xl p-10 cursor-pointer hover:border-blue-500 hover:bg-slate-700/30 transition-all group"
            >
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors text-slate-400">
                <Upload size={32} />
              </div>
              <p className="text-lg font-medium text-slate-300 mb-2">Нажми, чтобы загрузить аудио</p>
              <p className="text-sm text-slate-500">или перетащи файл сюда (если сможешь)</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4 bg-slate-700/50 px-6 py-4 rounded-xl border border-slate-600">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
                  <FileAudio size={24} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-200">{file.name}</p>
                  <p className="text-xs text-slate-500 uppercase">{file.mimeType.split('/')[1] || 'AUDIO'}</p>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="ml-4 p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                >
                  <AlertCircle size={20} />
                </button>
              </div>

              {!isProcessing && !transcription && (
                <button
                  onClick={handleTranscribe}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                >
                  <FileAudio size={20} />
                  Расшифровать (с неохотой)
                </button>
              )}
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*"
            className="hidden"
          />
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-12 space-y-4">
            <Loader2 className="animate-spin text-blue-500 mx-auto" size={48} />
            <p className="text-slate-400 animate-pulse">Слушаю твою запись... как же долго... 🎧</p>
          </div>
        )}

        {transcription && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
            <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-400" />
                Готовая расшифровка
              </h3>
              <button 
                onClick={() => navigator.clipboard.writeText(transcription)}
                className="text-xs bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded-lg transition-colors text-white"
              >
                Копировать
              </button>
            </div>
            <div className="p-6 text-slate-300 leading-relaxed whitespace-pre-wrap font-light">
              {transcription}
            </div>
            <div className="px-6 py-3 bg-slate-900/50 border-t border-slate-700 text-xs text-slate-500 text-center italic">
              "Вот, держи. Надеюсь, это стоило моих усилий..."
            </div>
          </div>
        )}
      </div>
    </div>
  );
};