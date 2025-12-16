import { VideoClip, SkillSet, Review } from './types';

// Initial data based on user request
export const INITIAL_VIDEOS: VideoClip[] = [
  {
    id: 'sample-1',
    title: 'High Energy Edit',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=dD8guRK_neU',
    category: 'Gaming',
    description: 'A showcase of sync and flow. (Start: 49s)',
    timestamp: 49
  },
  {
    id: 'sample-3',
    title: 'Dynamic Intro',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=3tJZHRG4NNw',
    category: 'Showreel',
    description: 'Clean motion graphics intro. (Start: 25s)',
    timestamp: 25
  },
  {
    id: 'drive-clip',
    title: 'Custom Drive Portfolio Piece',
    type: 'drive',
    url: 'https://drive.google.com/file/d/1WVvrmNR9Rhn6yYxxlKaExACQZKsa9OsW/preview',
    category: 'Showreel',
    description: 'Exclusive portfolio upload from Google Drive.'
  },
  {
    id: 'sample-2',
    title: 'Short Form Content',
    type: 'youtube',
    url: 'https://www.youtube.com/shorts/Sqj3t8w9XzY', // Replaced placeholder with a random valid short
    category: 'Short',
    description: 'Engaging short form content designed for retention.'
  }
];

export const INITIAL_SKILLS: SkillSet = {
  premiere: 70,
  afterEffects: 40
};

export const INITIAL_REVIEWS: Review[] = [
  { 
    id: 'r1',
    name: "Alex G.", 
    role: "YouTuber (100k+)", 
    text: "Defox transformed my channel. The retention rate skyrocketed after the first edit!", 
    stars: 5,
    status: 'approved',
    date: new Date().toISOString()
  },
  { 
    id: 'r2',
    name: "Sarah M.", 
    role: "Streamer", 
    text: "Fastest delivery I've ever seen without compromising quality. The orange branding fits my vibe perfectly!", 
    stars: 5, 
    status: 'approved',
    date: new Date().toISOString()
  },
  { 
    id: 'r3',
    name: "CreativeStudio", 
    role: "Agency", 
    text: "Professional communication and top-tier After Effects skills. Highly recommended.", 
    stars: 5,
    status: 'approved',
    date: new Date().toISOString()
  }
];

export const SOCIAL_LINKS = {
  discord: 'https://discord.gg/xA5zuuJtUB', // Invite link
  discordId: 'itsdefox', // ID for display
  instagram: 'https://www.instagram.com/realdefox/',
  youtube: 'https://www.youtube.com/@realdefox',
  email: 'defoxbusiness1@gmail.com'
};

export const BANNER_IMAGE = "https://yt3.googleusercontent.com/QIQI2VAzTDE-ZoDqgx_TAnaO9Fvqf_He_Dg2J7SeDjIe798XbMTyy6srgY5tonIvPQbFfuhcfg=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj";

export const LOGO_URL = "https://cdn.discordapp.com/attachments/1450134694690553888/1450136589081645076/logostyleogh.jpg?ex=69417071&is=69401ef1&hm=344d4c5e7e797bd24a5b6b3a8c45eef816b17a31cf54f3f4be4a8154332235a2&";