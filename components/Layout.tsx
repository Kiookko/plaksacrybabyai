import React from 'react';
import { AppMode } from '../types';
import { MessageSquare, FileAudio, FileSearch, Menu } from 'lucide-react';
import { isConfigured } from '../services/geminiService';

interface LayoutProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentMode, onModeChange, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const isApiReady = isConfigured();

  const navItems = [
    { mode: AppMode.CHAT, label: 'Чат с Плаксой', icon: <MessageSquare size={20} /> },
    { mode: AppMode.TRANSCRIPTION, label: 'Расшифровка Аудио', icon: <FileAudio size={20} /> },
    { mode: AppMode.ANALYSIS, label: 'Анализ Файлов', icon: <FileSearch size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-800 border-r border-slate-700">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">
            😭
          </div>
          <h1 className="font-bold text-xl text-blue-100">Плакса AI</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => onModeChange(item.mode)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentMode === item.mode
                  ? 'bg-blue-600/20 text-blue-200 border border-blue-500/30'
                  : 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700 flex flex-col gap-2">
           <div className="flex items-center justify-center gap-2 text-xs bg-slate-900/50 py-2 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${isApiReady ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
              <span className="text-slate-400 font-medium">
                {isApiReady ? 'API: Подключен' : 'API: Не найден'}
              </span>
           </div>
           <div className="text-xs text-slate-500 text-center italic">
            "Опять работать..." 
           </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col h-full relative">
        <header className="md:hidden h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">😭</span>
            <span className="font-bold text-lg">Плакса</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300">
            <Menu size={24} />
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-slate-800 border-b border-slate-700 z-50 shadow-xl md:hidden">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.mode}
                  onClick={() => {
                    onModeChange(item.mode);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                    currentMode === item.mode
                      ? 'bg-blue-600/20 text-blue-200'
                      : 'text-slate-400'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-2 px-4">
                 <div className={`w-2 h-2 rounded-full ${isApiReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
                 <span className="text-xs text-slate-400">
                   {isApiReady ? 'API Подключен' : 'API Отключен'}
                 </span>
              </div>
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};