
export enum MessageRole {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
}

export interface ChatSession {
  id: string;
  timestamp: number;
  messages: Message[];
}
