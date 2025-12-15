import React, { useState, useEffect, useRef } from 'react';
import { VideoClip, SkillSet, Review } from './types';
import { INITIAL_VIDEOS, INITIAL_SKILLS, INITIAL_REVIEWS, SOCIAL_LINKS, BANNER_IMAGE, LOGO_URL } from './constants';
import VideoPlayer from './components/VideoPlayer';
import AdminPanel from './components/AdminPanel';
import { 
  Instagram, 
  Youtube, 
  Mail, 
  CheckCircle, 
  Settings, 
  PlayCircle,
  Film,
  Zap,
  MonitorPlay,
  Sparkles,
  Shield,
  Lock,
  Key,
  CreditCard,
  AlertTriangle,
  Timer,
  Sun,
  Moon,
  Cpu,
  Copy,
  Star,
  TrendingUp,
  Users,
  Award,
  Clock,
  MessageSquarePlus,
  Send,
  User,
  X
} from 'lucide-react';

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 30; // seconds

const STATS = [
  { label: "Projects Completed", value: "50+", icon: <Film size={24} /> },
  { label: "Happy Clients", value: "27+", icon: <Users size={24} /> },
  { label: "Years Experience", value: "2+", icon: <Award size={24} /> },
  { label: "Hours Edited", value: "1500+", icon: <Clock size={24} /> }
];

export function App() {
  // Theme State
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  // Apply theme to HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Initialize videos from LocalStorage
  const [videos, setVideos] = useState<VideoClip[]>(() => {
    try {
      const savedVideos = localStorage.getItem('defox-videos');
      if (savedVideos) {
        return JSON.parse(savedVideos);
      }
    } catch (error) {
      console.error("Failed to load videos from storage:", error);
    }
    return INITIAL_VIDEOS;
  });

  // Initialize Skills from LocalStorage
  const [skills, setSkills] = useState<SkillSet>(() => {
    try {
      const savedSkills = localStorage.getItem('defox-skills');
      if (savedSkills) {
        return JSON.parse(savedSkills);
      }
    } catch (error) {
      console.error("Failed to load skills:", error);
    }
    return INITIAL_SKILLS;
  });

  // Initialize Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const savedReviews = localStorage.getItem('defox-reviews');
      if (savedReviews) {
        return JSON.parse(savedReviews);
      }
    } catch (error) {
       console.error("Failed to load reviews:", error);
    }
    return INITIAL_REVIEWS;
  });

  useEffect(() => {
    localStorage.setItem('defox-skills', JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem('defox-reviews', JSON.stringify(reviews));
  }, [reviews]);

  const handleUpdateSkills = (newSkills: SkillSet) => {
    setSkills(newSkills);
  };

  const handleUpdateReviews = (newReviews: Review[]) => {
    setReviews(newReviews);
  };

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoClip | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [scrolled, setScrolled] = useState(false);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', role: '', text: '', stars: 5 });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Password Protection State
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Categories derived from current videos
  const categories = ['All', ...Array.from(new Set(videos.map(v => v.category)))];

  const filteredVideos = filter === 'All' 
    ? videos 
    : videos.filter(v => v.category === filter);
  
  const approvedReviews = reviews.filter(r => r.status === 'approved');

  // Save videos to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem('defox-videos', JSON.stringify(videos));
  }, [videos]);

  const handleAddVideo = (video: VideoClip) => {
    setVideos([video, ...videos]);
  };

  const handleDeleteVideo = (id: string) => {
    // Confirmation is handled in AdminPanel to ensure proper event propagation
    setVideos(videos.filter(v => v.id !== id));
  };

  const handleResetData = () => {
    if (window.confirm("FACTORY RESET: This will delete all custom videos, reviews, and settings, returning the site to its original state. Are you sure?")) {
      localStorage.removeItem('defox-videos');
      localStorage.removeItem('defox-skills');
      localStorage.removeItem('defox-reviews');
      // Reload to re-initialize with INITIAL_ constants
      window.location.reload();
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) return;

    const review: Review = {
      id: Date.now().toString(),
      name: newReview.name,
      role: newReview.role || 'Client',
      text: newReview.text,
      stars: newReview.stars,
      status: 'pending', // Pending approval
      date: new Date().toISOString()
    };

    setReviews([review, ...reviews]);
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setShowReviewModal(false);
      setNewReview({ name: '', role: '', text: '', stars: 5 });
    }, 2000);
  };

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lockout Timer Logic
  useEffect(() => {
    let interval: number;
    if (isLockedOut && lockoutTimer > 0) {
      interval = window.setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    } else if (lockoutTimer === 0 && isLockedOut) {
      setIsLockedOut(false);
      setFailedAttempts(0); // Reset attempts after lockout expires
      setAuthError(false);
      // Focus input again when unlocked
      setTimeout(() => {
         if (showPasswordPrompt) passwordInputRef.current?.focus();
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isLockedOut, lockoutTimer, showPasswordPrompt]);

  // Admin Access Logic
  const requestAdminAccess = () => {
    if (isAdminMode) {
        setShowAdminPanel(true);
        return;
    }
    setPasswordInput('');
    setAuthError(false);
    setShowPasswordPrompt(true);
    // Focus input after a brief delay to allow modal to render
    setTimeout(() => {
      if (!isLockedOut) passwordInputRef.current?.focus();
    }, 100);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLockedOut) return;

    if (passwordInput === 'pakistaniarmy') {
      setShowPasswordPrompt(false);
      setIsAdminMode(true);
      setShowAdminPanel(true);
      setFailedAttempts(0);
      setAuthError(false);
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      setAuthError(true);
      setPasswordInput('');

      const form = e.currentTarget as HTMLFormElement;
      form.classList.add('animate-shake');
      setTimeout(() => form.classList.remove('animate-shake'), 500);

      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLockedOut(true);
        setLockoutTimer(LOCKOUT_DURATION);
      }
    }
  };

  // Secret shortcut to trigger admin auth (Alt + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'a') {
        requestAdminAccess();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminMode]);

  // Helper to generate correct thumbnail URL
  const getThumbnailUrl = (video: VideoClip) => {
    if (video.thumbnail && video.thumbnail.trim() !== '') {
      return video.thumbnail;
    }
    
    if (video.type === 'youtube') {
      // Robust regex for thumbnail extraction
      const match = video.url.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/);
      const id = match && match[1];
      if (id && id.length === 11) {
        return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
      }
    }
    
    return 'https://picsum.photos/600/340?grayscale&blur=2';
  };

  const copyDiscordId = () => {
    navigator.clipboard.writeText(SOCIAL_LINKS.discordId);
    alert(`Discord ID copied: ${SOCIAL_LINKS.discordId}`);
  };

  return (
    <div className="min-h-screen bg-brand-50 dark:bg-dark-900 text-navy-900 dark:text-brand-100 font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden transition-colors duration-300 relative">
      
      {/* Animated Background Elements (Blobs) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500/20 dark:bg-brand-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>
         <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-600/20 dark:bg-brand-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
         <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-brand-400/20 dark:bg-brand-400/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? 'glass border-b border-gray-200 dark:border-white/5 py-2 shadow-sm dark:shadow-glow-sm' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
               {/* Logo with Glow */}
               <div className="relative">
                 <div className="absolute inset-0 bg-brand-500 blur-lg opacity-20 dark:opacity-50 group-hover:opacity-60 dark:group-hover:opacity-100 transition duration-500"></div>
                 <img 
                   src={LOGO_URL} 
                   alt="Defox Logo" 
                   className="relative w-12 h-12 rounded-lg object-cover shadow-xl border border-gray-200 dark:border-white/10"
                 />
               </div>
               <span className="text-2xl font-black tracking-tighter text-navy-900 dark:text-brand-100 dark:drop-shadow-glow">DEFOX</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="#portfolio" className="hidden md:block text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-500 transition hover:drop-shadow-glow">PORTFOLIO</a>
              <a href="#contact" className="hidden md:block text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-500 transition hover:drop-shadow-glow">CONTACT</a>
              
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-brand-100 transition-colors"
                title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm dark:shadow-glow-green animate-pulse-slow backdrop-blur-md overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:animate-shimmer"></div>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2 inline-block"></span>
                COMMISSIONS OPEN
              </div>
              {isAdminMode && (
                <button 
                  onClick={() => setShowAdminPanel(true)}
                  className="bg-brand-500 hover:bg-brand-600 text-white p-2 rounded-lg transition shadow-lg dark:shadow-glow hover:shadow-xl"
                  title="Open Admin Panel"
                >
                  <Settings size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex flex-col justify-start pt-20">
        {/* Banner Image with Overlay */}
        <div className="absolute top-0 left-0 w-full h-[60vh] overflow-hidden z-0">
           {/* Light Mode Gradients: White to Transparent */}
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-50/80 to-brand-50 dark:from-transparent dark:via-dark-900/80 dark:to-dark-900 z-10"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-brand-50 via-brand-50/40 to-transparent dark:from-dark-900 dark:via-dark-900/40 dark:to-transparent z-10"></div>
           
           <img 
             src={BANNER_IMAGE} 
             alt="Defox Banner" 
             className="w-full h-full object-cover object-center transform scale-105 animate-pulse-slow opacity-80 dark:opacity-50 grayscale-[0.2] dark:grayscale-0 transition-all duration-500"
           />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-32 md:mt-48 w-full">
          <div className="flex flex-col md:flex-row items-end gap-10">
            {/* Profile Pic with floating animation */}
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-3xl bg-white dark:bg-dark-800 border-4 border-white dark:border-dark-700 shadow-2xl dark:shadow-glow-lg flex items-center justify-center overflow-hidden animate-float relative group">
               {/* Behind Profile Glow */}
               <div className="absolute inset-0 bg-brand-500 opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500"></div>
               <img 
                 src={LOGO_URL} 
                 alt="Defox Profile" 
                 className="w-full h-full object-cover relative z-10"
               />
            </div>
            
            <div className="flex-1 pb-4 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-500/30 text-brand-600 dark:text-brand-100 text-sm font-bold mb-4 shadow-sm dark:shadow-glow-sm">
                <Sparkles size={14} />
                <span>PROFESSIONAL VIDEO EDITOR</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-navy-900 dark:text-white tracking-tighter mb-4 leading-none drop-shadow-sm dark:drop-shadow-lg transition-colors">
                DEFOX<span className="text-brand-500 dark:drop-shadow-glow">.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-brand-100 max-w-2xl font-light leading-relaxed border-l-4 border-brand-500 pl-6 bg-gradient-to-r from-gray-100/50 to-transparent dark:from-brand-900/20 dark:to-transparent py-2 transition-colors">
                Specialized in <span className="text-navy-900 dark:text-white font-bold dark:drop-shadow-glow-white">Gaming</span>, <span className="text-navy-900 dark:text-white font-bold dark:drop-shadow-glow-white">Shorts</span>, & <span className="text-navy-900 dark:text-white font-bold dark:drop-shadow-glow-white">Motion Graphics</span>.
                <br /><span className="text-sm text-gray-500 dark:text-brand-200 uppercase tracking-widest mt-2 block">Quality Edits • Friendly Budget</span>
              </p>
              
              <div className="flex flex-wrap gap-4 mt-8">
                 <a 
                   href={SOCIAL_LINKS.discord} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="group relative px-6 py-3 rounded-xl font-bold text-white overflow-hidden transition-all hover:scale-105 shadow-lg hover:shadow-xl dark:hover:shadow-glow-blue bg-[#5865F2]"
                   title={`ID: ${SOCIAL_LINKS.discordId}`}
                 >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <div className="flex items-center gap-2 relative z-10">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 3.903 3.903 0 0 0-.74 1.488 19.268 19.268 0 0 0-6.177 0 4.12 4.12 0 0 0-.735-1.488.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.176 2.419 0 1.334-.966 2.42-2.176 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.176 2.419 0 1.334-.966 2.42-2.176 2.419z"/></svg>
                    Join Discord
                 </a>
                 <div className="flex items-center gap-2 bg-white/10 p-1 pr-3 rounded-xl border border-white/5 backdrop-blur-sm">
                   <div className="bg-[#5865F2]/20 p-2 rounded-lg">
                     <span className="text-white font-mono text-xs font-bold">ID</span>
                   </div>
                   <span className="text-navy-900 dark:text-white font-mono font-medium">{SOCIAL_LINKS.discordId}</span>
                   <button onClick={copyDiscordId} className="hover:text-brand-500 transition-colors" title="Copy ID">
                     <Copy size={16} />
                   </button>
                 </div>
              </div>
              <div className="mt-4 flex gap-4">
                  <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-navy-900 dark:text-gray-400 hover:text-[#FF0000] dark:hover:text-[#FF0000] transition-colors font-bold">
                    <Youtube size={20} /> YouTube
                  </a>
                  <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-navy-900 dark:text-gray-400 hover:text-[#E4405F] dark:hover:text-[#E4405F] transition-colors font-bold">
                    <Instagram size={20} /> Instagram
                  </a>
              </div>
           </div>
        </div>
      </header>

      {/* Stats/Why Choose Me Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[
                { icon: <Film size={32} />, title: 'High Quality', desc: '4K Rendering & Color Grading', color: 'text-brand-500', glow: 'shadow-glow', lightBg: 'bg-brand-100' },
                { icon: <Zap size={32} />, title: 'Fast Delivery', desc: '48h Turnaround Available', color: 'text-brand-300 dark:text-yellow-400', glow: 'shadow-[0_0_20px_rgba(250,204,21,0.3)]', lightBg: 'bg-yellow-50' },
                { icon: <CheckCircle size={32} />, title: 'Budget Friendly', desc: 'Prices that make sense', color: 'text-green-600 dark:text-green-500', glow: 'shadow-glow-green', lightBg: 'bg-green-50' }
              ].map((item, index) => (
                <div key={index} className="bg-white/80 dark:bg-dark-800/80 backdrop-blur border border-gray-200 dark:border-white/5 p-8 rounded-2xl flex items-center gap-6 group hover:bg-brand-50 dark:hover:bg-dark-700/80 transition duration-300 hover:-translate-y-1 shadow-sm dark:shadow-none">
                   <div className={`p-4 rounded-xl ${item.lightBg} dark:bg-dark-900 border border-transparent dark:border-white/5 ${item.color} dark:${item.glow} group-hover:scale-110 transition duration-500`}>
                      {item.icon}
                   </div>
                   <div>
                      <h3 className="font-black text-navy-900 dark:text-white text-xl uppercase tracking-wide group-hover:text-brand-600 dark:group-hover:text-brand-500 transition">{item.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>

           {/* Numeric Stats */}
           <div className="bg-white/90 dark:bg-dark-800/60 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-white/5 p-10 shadow-lg dark:shadow-glow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                 {STATS.map((stat, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center group">
                       <div className="mb-4 p-3 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-500 group-hover:scale-110 transition-transform duration-300">
                          {stat.icon}
                       </div>
                       <div className="text-4xl md:text-5xl font-black text-navy-900 dark:text-white mb-2">{stat.value}</div>
                       <div className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-brand-500 transition-colors">{stat.label}</div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* Software Proficiency / Skills Section */}
      <section className="py-20 bg-brand-50 dark:bg-dark-900 transition-colors duration-300 relative overflow-hidden border-t border-gray-200 dark:border-white/5">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-100 to-transparent dark:from-dark-900 dark:to-transparent opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-12 text-center md:text-left">
             <h2 className="text-4xl font-black text-navy-900 dark:text-white mb-4 flex items-center justify-center md:justify-start gap-3 drop-shadow-sm">
               <Cpu className="text-brand-600 dark:text-brand-500" size={36} />
               SOFTWARE ARSENAL
             </h2>
             <p className="text-gray-600 dark:text-gray-400 max-w-2xl font-light">
               Mastering industry-standard tools to deliver top-tier content.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Premiere Pro */}
             <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/5 rounded-3xl p-8 flex flex-col gap-6 shadow-lg dark:shadow-glow-sm hover:shadow-xl dark:hover:shadow-glow transition-all duration-300 group hover:-translate-y-1">
                <div className="flex items-center gap-5">
                   <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-[#00005b] border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/4/40/Adobe_Premiere_Pro_CC_icon.svg" alt="Premiere Pro" className="w-full h-full object-cover p-1.5" />
                   </div>
                   <div className="flex-1">
                      <h3 className="text-2xl font-black text-navy-900 dark:text-white tracking-tight">Premiere Pro</h3>
                      <p className="text-sm font-semibold text-[#9999FF] uppercase tracking-wider">Professional Editing</p>
                   </div>
                   <div className="text-3xl font-black text-[#9999FF] drop-shadow-sm">{skills.premiere}%</div>
                </div>
                {/* Bar */}
                <div className="w-full h-4 bg-gray-100 dark:bg-black rounded-full overflow-hidden border border-gray-100 dark:border-white/5">
                   <div 
                     className="h-full bg-gradient-to-r from-[#5a5a9e] to-[#9999FF] shadow-[0_0_15px_#9999FF] rounded-full relative overflow-hidden group-hover:shadow-[0_0_25px_#9999FF] transition-all duration-1000 ease-out"
                     style={{ width: `${skills.premiere}%` }}
                   >
                      <div className="absolute inset-0 bg-white/30 animate-[pulse_2s_infinite]"></div>
                   </div>
                </div>
             </div>

             {/* After Effects */}
             <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/5 rounded-3xl p-8 flex flex-col gap-6 shadow-lg dark:shadow-glow-sm hover:shadow-xl dark:hover:shadow-glow transition-all duration-300 group hover:-translate-y-1">
                <div className="flex items-center gap-5">
                   <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-[#00005b] border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Adobe_After_Effects_CC_icon.svg" alt="After Effects" className="w-full h-full object-cover p-1.5" />
                   </div>
                   <div className="flex-1">
                      <h3 className="text-2xl font-black text-navy-900 dark:text-white tracking-tight">After Effects</h3>
                      <p className="text-sm font-semibold text-[#D291FF] uppercase tracking-wider">Motion Graphics</p>
                   </div>
                   <div className="text-3xl font-black text-[#D291FF] drop-shadow-sm">{skills.afterEffects}%</div>
                </div>
                {/* Bar */}
                <div className="w-full h-4 bg-gray-100 dark:bg-black rounded-full overflow-hidden border border-gray-100 dark:border-white/5">
                   <div 
                      className="h-full bg-gradient-to-r from-[#6e4c85] to-[#D291FF] shadow-[0_0_15px_#D291FF] rounded-full relative overflow-hidden group-hover:shadow-[0_0_25px_#D291FF] transition-all duration-1000 ease-out"
                      style={{ width: `${skills.afterEffects}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-[pulse_2s_infinite]"></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-24 relative bg-brand-50 dark:bg-dark-900 transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-100/50 via-transparent to-transparent dark:from-brand-900/20 dark:via-transparent dark:to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="animate-slide-in">
              <h2 className="text-5xl font-black text-navy-900 dark:text-white mb-4 flex items-center gap-4 drop-shadow-sm dark:drop-shadow-lg transition-colors">
                <MonitorPlay className="text-brand-600 dark:text-brand-500 dark:drop-shadow-glow" size={48} />
                RECENT WORK
              </h2>
              <p className="text-gray-600 dark:text-brand-100 text-lg border-l-2 border-brand-500 pl-4">
                Explore a collection of my finest edits.
              </p>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                    filter === cat 
                      ? 'bg-brand-500 text-white shadow-lg dark:shadow-glow border border-brand-400 scale-105' 
                      : 'bg-white dark:bg-dark-800 text-gray-500 dark:text-brand-100 border border-gray-200 dark:border-dark-700 hover:text-brand-600 dark:hover:text-white hover:border-brand-500 dark:hover:shadow-glow-sm shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video) => (
              <div 
                key={video.id} 
                className="group bg-white dark:bg-dark-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5 hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-500 hover:shadow-xl dark:hover:shadow-glow flex flex-col hover:-translate-y-2"
              >
                {/* Thumbnail / Video Preview Area */}
                <div 
                  className="relative aspect-video bg-gray-100 dark:bg-black cursor-pointer overflow-hidden"
                  onClick={() => setSelectedVideo(video)}
                >
                  <img 
                    src={getThumbnailUrl(video)}
                    alt={video.title}
                    className="w-full h-full object-cover opacity-90 dark:opacity-60 group-hover:opacity-100 dark:group-hover:opacity-40 group-hover:scale-110 transition duration-700"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/600/340?grayscale&blur=2'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300"></div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                     <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center pl-2 text-white shadow-xl dark:shadow-glow-lg transform scale-50 group-hover:scale-100 transition duration-300 animate-pulse-glow">
                        <PlayCircle size={40} fill="white" className="text-white" />
                     </div>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 dark:bg-black/70 backdrop-blur text-xs font-bold text-navy-900 dark:text-white px-3 py-1.5 rounded-md border border-gray-200 dark:border-white/10 uppercase tracking-widest shadow-lg">
                       {video.type === 'drive' ? 'Drive' : video.type === 'direct' ? 'File' : 'YouTube'}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col bg-white dark:bg-gradient-to-b dark:from-dark-800 dark:to-dark-900 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-brand-600 dark:text-brand-500 text-xs font-bold uppercase tracking-widest border border-brand-200 dark:border-brand-500/30 px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-900/20 shadow-sm dark:shadow-glow-sm">{video.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-3 leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-500 transition drop-shadow-sm">{video.title}</h3>
                  <div 
                    className="text-gray-600 dark:text-brand-100 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed [&_b]:text-brand-600 dark:[&_b]:text-brand-500 [&_b]:font-black [&_strong]:text-brand-600 dark:[&_strong]:text-brand-500 [&_strong]:font-black [&_i]:italic [&_i]:text-gray-700 dark:[&_i]:text-white/80"
                    dangerouslySetInnerHTML={{ __html: video.description || '' }}
                  />
                  
                  <button 
                    onClick={() => setSelectedVideo(video)}
                    className="w-full mt-auto bg-gray-100 dark:bg-white/5 hover:bg-brand-500 dark:hover:bg-brand-500 text-navy-900 dark:text-white hover:text-white py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:shadow-lg dark:hover:shadow-glow flex items-center justify-center gap-2 group-hover:border-transparent border border-gray-200 dark:border-white/5"
                  >
                    <PlayCircle size={16} />
                    Watch Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials / Client Love */}
      <section className="py-20 relative z-10">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
               <div className="text-center md:text-left">
                  <h2 className="text-4xl font-black text-navy-900 dark:text-white mb-4 drop-shadow-sm">CLIENT LOVE</h2>
                  <div className="w-24 h-1 bg-brand-500 mx-auto md:mx-0 rounded-full"></div>
               </div>
               <button 
                  onClick={() => setShowReviewModal(true)}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl dark:shadow-glow transition-all duration-300 flex items-center gap-2 uppercase tracking-wide"
               >
                  <MessageSquarePlus size={20} />
                  Write a Review
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {approvedReviews.map((review, i) => (
                 <div key={review.id} className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/5 p-8 rounded-3xl relative hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl dark:hover:shadow-glow-sm flex flex-col">
                    <div className="absolute -top-4 right-8 bg-brand-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                       VERIFIED
                    </div>
                    <div className="flex text-brand-500 mb-4">
                       {[...Array(5)].map((_, si) => (
                          <Star 
                            key={si} 
                            size={16} 
                            fill={si < review.stars ? "currentColor" : "none"} 
                            className={si < review.stars ? "" : "text-gray-300 dark:text-gray-600"}
                          />
                       ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 italic leading-relaxed flex-1">"{review.text}"</p>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold uppercase">
                          {review.name.charAt(0)}
                       </div>
                       <div>
                          <h4 className="font-bold text-navy-900 dark:text-white">{review.name}</h4>
                          <span className="text-xs text-brand-500 font-bold uppercase tracking-wide">{review.role}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-900 py-10 border-t border-gray-200 dark:border-white/5 text-center relative transition-colors duration-300 z-10">
         
         {/* Payment Methods */}
         <div className="mb-10 max-w-4xl mx-auto px-4">
            <h4 className="text-gray-400 dark:text-brand-200 text-xs font-bold tracking-[0.3em] uppercase mb-6 opacity-70 flex items-center justify-center gap-3">
              <span className="w-8 h-[1px] bg-gray-300 dark:bg-brand-800"></span>
              Payment Options
              <span className="w-8 h-[1px] bg-gray-300 dark:bg-brand-800"></span>
            </h4>
            <div className="flex flex-wrap justify-center gap-4">
               {/* JazzCash */}
               <div className="px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-600/30 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-500 font-black text-sm tracking-wider shadow-sm dark:shadow-[0_0_15px_rgba(220,38,38,0.1)] flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,1)]"></div>
                  JAZZCASH
               </div>
               {/* EasyPaisa */}
               <div className="px-5 py-2.5 rounded-xl border border-green-200 dark:border-green-600/30 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 font-black text-sm tracking-wider shadow-sm dark:shadow-[0_0_15px_rgba(34,197,94,0.1)] flex items-center gap-2 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
                  EASYPAISA
               </div>
               {/* FamPay */}
               <div className="px-5 py-2.5 rounded-xl border border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-black text-sm tracking-wider shadow-sm dark:shadow-[0_0_15px_rgba(249,115,22,0.1)] flex items-center gap-2 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                   <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,1)]"></div>
                   FAMPAY
               </div>
               {/* PayPal */}
               <div className="px-5 py-2.5 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-black text-sm tracking-wider shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.1)] flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
                   PAYPAL
               </div>
            </div>
         </div>

         <p className="text-gray-500 dark:text-brand-200 text-sm font-medium tracking-widest">© {new Date().getFullYear()} DEFOX EDITS. EST 2024.</p>
         
         <button 
           onClick={requestAdminAccess}
           className="mx-auto mt-8 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-dark-800 border border-gray-200 dark:border-white/5 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-500 text-gray-400 dark:text-gray-600 transition-all duration-300 shadow-none hover:shadow-md dark:hover:shadow-glow-sm opacity-50 hover:opacity-100"
           title="Admin Access"
         >
            <Shield size={14} />
         </button>
      </footer>

      {/* Review Submission Modal */}
      {showReviewModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setShowReviewModal(false)}>
            <div className="w-full max-w-lg bg-white dark:bg-dark-900 rounded-3xl border border-gray-200 dark:border-brand-900 shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
               {/* Header */}
               <div className="bg-gray-50 dark:bg-black/50 p-6 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
                  <h3 className="text-2xl font-black text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                     <Star className="text-brand-500" fill="currentColor" /> Leave a Review
                  </h3>
                  <button onClick={() => setShowReviewModal(false)} className="text-gray-500 hover:text-red-500 transition">
                     <X size={24} />
                  </button>
               </div>

               <div className="p-8">
                  {reviewSubmitted ? (
                     <div className="flex flex-col items-center text-center py-8 animate-in zoom-in">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-500 mb-4">
                           <CheckCircle size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-navy-900 dark:text-white mb-2">Review Submitted!</h4>
                        <p className="text-gray-600 dark:text-gray-400">Your review is pending approval. Thanks for your feedback!</p>
                     </div>
                  ) : (
                     <form onSubmit={handleSubmitReview} className="space-y-6">
                        <div>
                           <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Rating</label>
                           <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                 <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewReview({...newReview, stars: star})}
                                    className={`transition-transform hover:scale-110 ${newReview.stars >= star ? 'text-brand-500' : 'text-gray-300 dark:text-gray-700'}`}
                                 >
                                    <Star size={32} fill={newReview.stars >= star ? "currentColor" : "none"} />
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Name</label>
                              <div className="relative">
                                 <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                 <input 
                                    type="text" 
                                    required
                                    value={newReview.name}
                                    onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-navy-900 dark:text-white focus:outline-none focus:border-brand-500"
                                    placeholder="Your Name"
                                 />
                              </div>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Role/Title</label>
                              <input 
                                 type="text" 
                                 value={newReview.role}
                                 onChange={(e) => setNewReview({...newReview, role: e.target.value})}
                                 className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl py-2.5 px-4 text-navy-900 dark:text-white focus:outline-none focus:border-brand-500"
                                 placeholder="e.g. YouTuber"
                              />
                           </div>
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Review</label>
                           <textarea 
                              required
                              value={newReview.text}
                              onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                              className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-navy-900 dark:text-white focus:outline-none focus:border-brand-500 h-24 resize-none"
                              placeholder="Share your experience..."
                           />
                        </div>

                        <button 
                           type="submit"
                           className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 uppercase tracking-wider"
                        >
                           <Send size={18} /> Submit Review
                        </button>
                     </form>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 dark:bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300" onClick={() => setSelectedVideo(null)}>
          <div className="w-full max-w-6xl bg-white dark:bg-dark-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-200 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 relative" onClick={e => e.stopPropagation()}>
             {/* Glowing border effect */}
             <div className="absolute inset-0 rounded-3xl pointer-events-none dark:shadow-glow-sm"></div>

             <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/50">
                <h3 className="text-xl font-black text-navy-900 dark:text-white truncate pr-4 uppercase tracking-wider flex items-center gap-3">
                   <div className="w-2 h-8 bg-brand-600 dark:bg-brand-500 rounded-full shadow-sm dark:shadow-glow"></div>
                   {selectedVideo.title}
                </h3>
                <button onClick={() => setSelectedVideo(null)} className="text-gray-500 hover:text-navy-900 dark:hover:text-white transition transform hover:rotate-90 duration-300">
                  <div className="bg-gray-200 dark:bg-white/5 hover:bg-red-500 dark:hover:bg-red-600 hover:text-white p-2 rounded-full transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </div>
                </button>
             </div>
             <div className="bg-black aspect-video w-full">
                <VideoPlayer clip={selectedVideo} autoPlay={true} />
             </div>
             <div className="p-8 bg-white dark:bg-dark-800 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                   <span className="bg-brand-600 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm dark:shadow-glow-sm">{selectedVideo.category}</span>
                   {selectedVideo.timestamp && selectedVideo.timestamp > 0 && (
                      <span className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1 font-mono border border-gray-200 dark:border-white/10 px-2 py-1 rounded">
                        <PlayCircle size={12} /> {Math.floor(selectedVideo.timestamp / 60)}:{String(selectedVideo.timestamp % 60).padStart(2, '0')}
                      </span>
                   )}
                </div>
                <div 
                  className="text-gray-700 dark:text-brand-100 leading-relaxed text-lg [&_b]:text-brand-600 dark:[&_b]:text-brand-500 [&_b]:font-black [&_strong]:text-brand-600 dark:[&_strong]:text-brand-500 [&_strong]:font-black [&_i]:italic [&_i]:text-gray-600 dark:[&_i]:text-white/80"
                  dangerouslySetInnerHTML={{ __html: selectedVideo.description || "No description provided." }} 
                />
             </div>
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel 
          videos={videos}
          onAddVideo={handleAddVideo}
          onDeleteVideo={handleDeleteVideo}
          onClose={() => setShowAdminPanel(false)}
          skills={skills}
          onUpdateSkills={handleUpdateSkills}
          reviews={reviews}
          onUpdateReviews={handleUpdateReviews}
          onResetData={handleResetData}
        />
      )}

    </div>
  );
}