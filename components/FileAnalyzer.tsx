import React, { useState, useRef } from 'react';
import { FileVideo, FileImage, Search, Loader2 } from 'lucide-react';
import { FileAttachment } from '../types';
import { processFile } from '../utils/fileUtils';
import { sendMessageToGemini } from '../services/geminiService';

export const FileAnalyzer: React.FC = () => {
  const [file, setFile] = useState<FileAttachment | null>(null);
  const [result, setResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      try {
        const processed = await processFile(selectedFile);
        setFile(processed);
        setResult('');
      } catch (err) {
        console.error("Error", err);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      // Send as a single prompt to Gemini
      const response = await sendMessageToGemini(
        "Проанализируй этот файл подробно. Расскажи, что здесь происходит, о чем идет речь. Если это видео, опиши действия. Если статья, сделай краткое содержание. Не забудь поныть.",
        [], 
        [file]
      );
      // We only care about the text here for now
      setResult(response.text);
    } catch (e) {
      setResult("Ошибка анализа. Даже файлы меня подводят...");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full bg-slate-900 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-blue-100">Анализ Медиа</h2>
          <p className="text-slate-400">
            Хочешь, чтобы я посмотрела видео из TikTok или прочитала статью? <br/>
            Просто загрузи файл сюда. (Прямое скачивание по ссылке не работает в браузере, так что качай сам и неси мне).
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all text-left group"
            >
                <div className="w-12 h-12 bg-pink-500/20 text-pink-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileVideo size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mb-1">Видео</h3>
                <p className="text-sm text-slate-500">Shorts, Reels, TikToks... У меня от них голова болит, но я посмотрю.</p>
            </button>

            <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all text-left group"
            >
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileImage size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mb-1">Изображения / Статьи</h3>
                <p className="text-sm text-slate-500">Скриншоты статей, мемы, фото документов.</p>
            </button>
        </div>

        <input 
            type="file" 
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,video/*,application/pdf"
        />

        {file && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                            {file.mimeType.includes('video') ? <FileVideo size={20} /> : <FileImage size={20} />}
                        </div>
                        <div>
                            <p className="font-medium text-slate-200">{file.name}</p>
                            <p className="text-xs text-slate-500">Готов к страданиям (анализу)</p>
                        </div>
                    </div>
                    {!isProcessing && !result && (
                        <button 
                            onClick={handleAnalyze}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Search size={16} />
                            Анализировать
                        </button>
                    )}
                </div>

                {isProcessing && (
                    <div className="py-8 text-center border-t border-slate-700/50">
                        <Loader2 className="animate-spin mx-auto text-blue-500 mb-3" />
                        <p className="text-slate-400 text-sm">Вникаю в суть... как же это утомительно...</p>
                    </div>
                )}

                {result && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Вердикт Плаксы:</h4>
                        <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {result}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};