export interface VideoClip {
  id: string;
  title: string;
  thumbnail?: string; // Optional custom thumbnail
  type: 'youtube' | 'drive' | 'direct';
  url: string;
  category: 'Showreel' | 'Short' | 'Gaming' | 'Vlog';
  description?: string; // Supports basic HTML rich text (<b>, <i>)
  timestamp?: number; // Start time in seconds
}

export interface UserSettings {
  isAdminMode: boolean;
}

export interface SkillSet {
  premiere: number;
  afterEffects: number;
}

export interface Review {
  id: string;
  name: string;
  role: string; // e.g. "YouTuber" or "Client"
  text: string;
  stars: number; // 1-5
  status: 'pending' | 'approved';
  date: string;
}