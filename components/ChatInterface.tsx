import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Loader2, ExternalLink } from 'lucide-react';
import { ChatMessage, MessageRole, FileAttachment } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { processFile } from '../utils/fileUtils';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: MessageRole.MODEL,
      text: "Ох... привет. Ты снова здесь? Чего тебе на этот раз? Я так устала, но спрашивай, что уж там... 😩",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: input,
      timestamp: Date.now(),
      attachments: [...attachments]
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      // Prepare history for context
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await sendMessageToGemini(userMsg.text, history, userMsg.attachments);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: response.text,
        sources: response.sources,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const attachment = await processFile(file);
        setAttachments(prev => [...prev, attachment]);
      } catch (err) {
        console.error("File upload failed", err);
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-lg ${
                msg.role === MessageRole.USER
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
              }`}
            >
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {msg.attachments.map((att, i) => (
                    <div key={i} className="bg-black/20 rounded p-2 text-xs flex items-center gap-2">
                      <span className="opacity-70">📎</span>
                      <span className="truncate max-w-[150px]">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="whitespace-pre-wrap leading-relaxed">
                 {msg.text}
              </div>
              
              {/* Sources display */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-2 font-medium">Источники (опять искать пришлось...):</div>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source, idx) => (
                      <a 
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs bg-slate-700/50 hover:bg-blue-900/30 text-blue-300 px-3 py-2 rounded-lg transition-colors border border-slate-700 hover:border-blue-500/30"
                      >
                        <ExternalLink size={10} />
                        <span className="truncate max-w-[200px]">{source.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className={`text-xs mt-2 opacity-50 ${msg.role === MessageRole.USER ? 'text-blue-200' : 'text-slate-500'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 rounded-bl-none flex items-center gap-3">
              <Loader2 className="animate-spin text-blue-400" size={20} />
              <span className="text-slate-400 italic text-sm">Вздыхает и печатает...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-800/50 border-t border-slate-700">
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {attachments.map((att, i) => (
              <div key={i} className="relative group bg-slate-700 rounded-lg p-2 pr-8 flex items-center gap-2 text-sm text-slate-300 border border-slate-600">
                <span className="truncate max-w-[120px]">{att.name}</span>
                <button
                  onClick={() => removeAttachment(i)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-600 rounded-full text-slate-400 hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-xl transition-colors"
            title="Прикрепить файл"
          >
            <Paperclip size={24} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple={false}
          />
          
          <div className="flex-1 bg-slate-700/50 rounded-xl border border-slate-600 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Напиши что-нибудь, если обязательно нужно..."
              className="w-full bg-transparent border-none p-3 text-slate-200 placeholder-slate-500 focus:ring-0 resize-none max-h-32 min-h-[48px]"
              rows={1}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={(!input.trim() && attachments.length === 0) || isLoading}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};