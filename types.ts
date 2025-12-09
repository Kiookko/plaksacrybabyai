export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  attachments?: FileAttachment[];
  isError?: boolean;
  sources?: { title: string; uri: string }[];
}

export interface FileAttachment {
  name: string;
  mimeType: string;
  data: string; // Base64
}

export enum AppMode {
  CHAT = 'chat',
  TRANSCRIPTION = 'transcription',
  ANALYSIS = 'analysis'
}