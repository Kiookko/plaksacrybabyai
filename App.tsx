import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ChatInterface } from './components/ChatInterface';
import { AudioTranscriber } from './components/AudioTranscriber';
import { FileAnalyzer } from './components/FileAnalyzer';
import { AppMode } from './types';

function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.CHAT);

  const renderContent = () => {
    switch (currentMode) {
      case AppMode.CHAT:
        return <ChatInterface />;
      case AppMode.TRANSCRIPTION:
        return <AudioTranscriber />;
      case AppMode.ANALYSIS:
        return <FileAnalyzer />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <Layout currentMode={currentMode} onModeChange={setCurrentMode}>
      {renderContent()}
    </Layout>
  );
}

export default App;