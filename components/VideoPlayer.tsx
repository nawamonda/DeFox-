import React from 'react';
import { VideoClip } from '../types';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  clip: VideoClip;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ clip, autoPlay = false }) => {
  const getEmbedUrl = (clip: VideoClip) => {
    const cleanUrl = clip.url.trim(); // Sanitize input

    if (clip.type === 'youtube') {
      // Robust Regex for YouTube ID extraction
      // Handles: v=, embed/, shorts/, youtu.be/, live/ and trailing params
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = cleanUrl.match(regExp);
      
      // Extract ID and ensure it's valid (YouTube IDs are 11 chars, but we allow basic sanity check)
      const rawId = match?.[2];
      const videoId = (rawId && rawId.trim().length >= 10) ? rawId.trim() : null;

      if (!videoId) return null;

      const startParam = clip.timestamp ? `&start=${clip.timestamp}` : '';
      const autoplayParam = autoPlay ? '&autoplay=1' : '';
      
      // Removing enablejsapi and origin to prevent Error 153 in some environments
      return `https://www.youtube.com/embed/${videoId}?rel=0${startParam}${autoplayParam}`;
    }
    
    if (clip.type === 'drive') {
      let url = cleanUrl;
      // Convert view links to preview links for embedding
      if (url.includes('/view')) {
         return url.replace(/\/view.*/, '/preview');
      }
      // If it's a file link without action, append preview
      if (url.includes('/file/d/') && !url.includes('/preview')) {
         if (url.endsWith('/')) return url + 'preview';
         return url + '/preview';
      }
      return url;
    }

    if (clip.type === 'direct') {
      return cleanUrl;
    }

    return cleanUrl;
  };

  const embedUrl = getEmbedUrl(clip);

  if (!embedUrl || clip.url.includes('placeholder')) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-gray-100 dark:bg-dark-900 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-dark-700 rounded-lg shadow-inner">
        <Play className="w-16 h-16 mb-4 opacity-20" />
        <p className="font-mono text-sm">VIDEO SOURCE UNAVAILABLE</p>
      </div>
    );
  }

  // Handle Direct Video Files (MP4/WebM)
  if (clip.type === 'direct') {
    return (
      <div className="relative w-full pt-[56.25%] bg-black shadow-lg dark:shadow-glow rounded-none overflow-hidden group">
         <video 
           src={embedUrl} 
           className="absolute top-0 left-0 w-full h-full object-contain"
           controls
           autoPlay={autoPlay}
         >
           Your browser does not support the video tag.
         </video>
      </div>
    );
  }

  return (
    <div className="relative w-full pt-[56.25%] bg-black shadow-lg dark:shadow-glow rounded-none overflow-hidden group">
      {/* Cinematic Glow Effect behind the player */}
      <div className="absolute -inset-1 bg-brand-600/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
      
      <iframe
        src={embedUrl}
        className="absolute top-0 left-0 w-full h-full z-10"
        title={clip.title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VideoPlayer;