
export enum EmotionType {
  Anxious = 'Anxious',
  Drained = 'Drained',
  Lonely = 'Lonely',
  Overwhelmed = 'Overwhelmed',
  Angry = 'Angry',
  Sad = 'Sad',
  Numb = 'Numb',
  Confused = 'Confused',
  Peaceful = 'Peaceful',
  Grateful = 'Grateful'
}

export type ViewMode = 'login' | 'home' | 'listener' | 'diary' | 'letter' | 'calendar' | 'profile';

export interface Entry {
  id: string;
  timestamp: number;
  content: string;
  type: 'vent' | 'letter' | 'reflection' | 'chat';
  emotions?: EmotionType[];
  isSilent?: boolean;
  isPinned?: boolean;
  isFavorite?: boolean;
  audioId?: string;

}

export interface UserProfile {
  name: string;
  joinedDate: number;
  streak: number;
  lastUsed: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
