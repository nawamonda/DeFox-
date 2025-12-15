import React, { useState, useRef } from 'react';
import { VideoClip, SkillSet, Review } from '../types';
import { 
  Plus, 
  X, 
  Trash2, 
  Shield, 
  Bold, 
  Italic, 
  Search, 
  AlertCircle,
  Type,
  Link as LinkIcon,
  Image as ImageIcon,
  Clock,
  FileText,
  Youtube,
  HardDrive,
  Layout,
  ChevronDown,
  Hash,
  Cpu,
  Save,
  MessageSquare,
  Star,
  Check,
  Ban,
  User,
  PenTool,
  RotateCcw
} from 'lucide-react';

interface AdminPanelProps {
  videos: VideoClip[];
  onAddVideo: (video: VideoClip) => void;
  onDeleteVideo: (id: string) => void;
  onClose: () => void;
  skills: SkillSet;
  onUpdateSkills: (skills: SkillSet) => void;
  reviews: Review[];
  onUpdateReviews: (reviews: Review[]) => void;
  onResetData: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ videos, onAddVideo, onDeleteVideo, onClose, skills, onUpdateSkills, reviews, onUpdateReviews, onResetData }) => {
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'review'>('video');
  
  // Video Form State
  const [formData, setFormData] = useState<Partial<VideoClip>>({
    title: '',
    url: '',
    thumbnail: '',
    type: 'youtube',
    category: 'Gaming',
    description: '',
    timestamp: 0
  });

  // Review Form State
  const [reviewForm, setReviewForm] = useState({
    name: '',
    role: '',
    text: '',
    stars: 5
  });
  
  const [skillForm, setSkillForm] = useState<SkillSet>(skills);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [configSaved, setConfigSaved] = useState(false);

  const handleFormat = (tag: 'b' | 'i') => {
    if (!descriptionRef.current) return;

    const textarea = descriptionRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.description || '';
    
    // If no text is selected, insert empty tags at cursor
    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newText = `${before}<${tag}>${selectedText}</${tag}>${after}`;
    
    setFormData({ ...formData, description: newText });

    // Restore focus and cursor position inside tags
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + 2 + tag.length + selectedText.length; // Pos after text inside tag
      textarea.setSelectionRange(newCursorPos, newCursorPos); 
    }, 0);
  };

  const validateUrl = (url: string, type: string): boolean => {
    try {
      const parsedUrl = new URL(url.trim());
      
      if (type === 'youtube') {
        const isYoutubeDomain = parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname.includes('youtu.be');
        if (!isYoutubeDomain) return false;

        // Check for common video patterns (Watch ID, Shorts, Embed, or Short URL path)
        const hasVideoId = 
          parsedUrl.searchParams.has('v') || // standard watch
          parsedUrl.pathname.includes('/shorts/') || // shorts
          parsedUrl.pathname.includes('/embed/') || // embed
          (parsedUrl.hostname.includes('youtu.be') && parsedUrl.pathname.length > 1); // short url with ID
        
        return hasVideoId;
      }
      
      if (type === 'drive') {
        if (!parsedUrl.hostname.includes('drive.google.com')) return false;
        
        // Check for file structure
        const hasFileId = 
          parsedUrl.pathname.includes('/file/d/') || 
          parsedUrl.pathname.includes('/open') ||
          parsedUrl.pathname.includes('/uc'); 
          
        return hasFileId;
      }
      
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmitVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!formData.title?.trim()) {
      setError("Title is required.");
      return;
    }
    if (!formData.url?.trim()) {
      setError("URL is required.");
      return;
    }
    
    const cleanUrl = formData.url.trim();

    // URL Validation
    if (!validateUrl(cleanUrl, formData.type || 'youtube')) {
      const typeName = formData.type === 'drive' ? 'Google Drive' : 'YouTube';
      let hint = "Please check the link.";
      
      if (formData.type === 'youtube') {
        hint = "Use a valid Watch (v=), Shorts, or youtu.be link.";
      } else if (formData.type === 'drive') {
        hint = "Use a valid drive.google.com/file/d/... link.";
      }

      setError(`Invalid URL format for ${typeName}. ${hint}`);
      return;
    }

    // Timestamp Validation
    if (formData.timestamp && formData.timestamp < 0) {
      setError("Start time cannot be negative.");
      return;
    }

    const newVideo: VideoClip = {
      id: Date.now().toString(),
      title: formData.title,
      url: cleanUrl,
      thumbnail: formData.thumbnail,
      type: formData.type as 'youtube' | 'drive' | 'direct',
      category: formData.category as any,
      description: formData.description,
      timestamp: formData.timestamp || 0
    };

    onAddVideo(newVideo);
    
    // Reset Form
    setFormData({
      title: '',
      url: '',
      thumbnail: '',
      type: 'youtube',
      category: 'Gaming',
      description: '',
      timestamp: 0
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.text) {
      setError("Name and Review text are required.");
      return;
    }

    const newReview: Review = {
      id: Date.now().toString(),
      name: reviewForm.name,
      role: reviewForm.role || 'Client',
      text: reviewForm.text,
      stars: reviewForm.stars,
      status: 'approved', // Admin manually added reviews are auto-approved
      date: new Date().toISOString()
    };

    onUpdateReviews([newReview, ...reviews]);
    setReviewForm({ name: '', role: '', text: '', stars: 5 });
  };

  const handleSkillsChange = (key: keyof SkillSet, value: number) => {
    const newValue = Math.min(100, Math.max(0, value));
    const newSkills = { ...skillForm, [key]: newValue };
    setSkillForm(newSkills);
    onUpdateSkills(newSkills);
    setConfigSaved(false);
  };

  const handleSaveConfig = () => {
    onUpdateSkills(skillForm);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  // Review Handlers
  const handleApproveReview = (id: string, e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    const updated = reviews.map(r => r.id === id ? { ...r, status: 'approved' as const } : r);
    onUpdateReviews(updated);
  };

  const handleDeleteReview = (id: string, e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    if (window.confirm('Delete this review permanently?')) {
       const updated = reviews.filter(r => r.id !== id);
       onUpdateReviews(updated);
    }
  };
  
  const handleDeleteVideoClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this clip from the database?')) {
        onDeleteVideo(id);
    }
  };

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    video.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingReviews = reviews.filter(r => r.status === 'pending');
  const activeReviews = reviews.filter(r => r.status === 'approved');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-dark-900 w-full max-w-7xl rounded-2xl border border-gray-200 dark:border-brand-900 shadow-2xl dark:shadow-glow-lg max-h-[90vh] flex flex-col overflow-hidden relative transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/40">
          <h2 className="text-2xl font-black text-navy-900 dark:text-white flex items-center gap-3 uppercase tracking-wider">
            <Shield className="text-brand-600 dark:text-brand-500" size={28} />
            Command Center
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-navy-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 p-2 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white dark:bg-gradient-to-br dark:from-dark-900 dark:to-black">
          
          {/* Left Column: Input Forms */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* System Config / Skills */}
            <div className="bg-gray-50 dark:bg-dark-800 p-6 rounded-2xl border border-gray-200 dark:border-white/5">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-white/5">
                  <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center border border-brand-200 dark:border-brand-500/30 text-brand-600 dark:text-brand-500 shadow-sm dark:shadow-glow-sm">
                      <Cpu size={20} />
                  </div>
                  <div>
                      <h3 className="text-lg font-bold text-navy-900 dark:text-white">System Configuration</h3>
                      <p className="text-xs text-gray-500 font-mono">ADJUST SKILL METRICS</p>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <div className="flex justify-between">
                         <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Premiere Pro Level</label>
                         <span className="text-xs font-mono font-bold text-brand-500">{skillForm.premiere}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={skillForm.premiere} 
                        onChange={(e) => handleSkillsChange('premiere', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-black rounded-lg appearance-none cursor-pointer accent-brand-500"
                      />
                   </div>

                   <div className="space-y-2">
                      <div className="flex justify-between">
                         <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">After Effects Level</label>
                         <span className="text-xs font-mono font-bold text-brand-500">{skillForm.afterEffects}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={skillForm.afterEffects} 
                        onChange={(e) => handleSkillsChange('afterEffects', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-black rounded-lg appearance-none cursor-pointer accent-brand-500"
                      />
                   </div>

                   {/* Save Configuration Button */}
                   <button 
                     type="button"
                     onClick={handleSaveConfig}
                     className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                       configSaved 
                         ? 'bg-green-500 text-white shadow-lg' 
                         : 'bg-navy-900 dark:bg-white text-white dark:text-navy-900 hover:bg-brand-600 dark:hover:bg-brand-500 dark:hover:text-white shadow-md'
                     }`}
                   >
                      {configSaved ? <Check size={18} /> : <Save size={18} />}
                      {configSaved ? 'Changes Saved' : 'Save Configuration'}
                   </button>
                   
                   <button 
                     type="button"
                     onClick={onResetData}
                     className="w-full mt-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 py-3 rounded-lg border border-red-200 dark:border-red-900/30 transition-colors"
                   >
                      <RotateCcw size={14} /> Factory Reset Data
                   </button>
                </div>
            </div>

            {/* Input Toggle */}
            <div>
               <div className="flex gap-2 mb-4 p-1 bg-gray-100 dark:bg-dark-800 rounded-xl">
                  <button 
                    onClick={() => setActiveTab('video')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'video' ? 'bg-white dark:bg-brand-500 text-brand-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}
                  >
                     <Plus size={16} /> Add Video
                  </button>
                  <button 
                    onClick={() => setActiveTab('review')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'review' ? 'bg-white dark:bg-brand-500 text-brand-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}
                  >
                     <MessageSquare size={16} /> Add Review
                  </button>
               </div>

               {/* Error Feedback */}
               {error && (
                 <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 mb-6">
                   <AlertCircle className="text-red-600 dark:text-red-500 shrink-0 mt-0.5" size={20} />
                   <div>
                     <h4 className="text-red-600 dark:text-red-500 font-bold text-sm">System Error</h4>
                     <p className="text-red-500 dark:text-red-400/80 text-xs mt-1">{error}</p>
                   </div>
                 </div>
               )}

               {activeTab === 'video' ? (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-white/5">
                       <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center border border-brand-200 dark:border-brand-500/30 text-brand-600 dark:text-brand-500 shadow-sm dark:shadow-glow-sm">
                          <Plus size={20} />
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-navy-900 dark:text-white">New Transmission</h3>
                          <p className="text-xs text-gray-500 font-mono">ADD CONTENT TO DATABASE</p>
                       </div>
                    </div>
                    
                    <form onSubmit={handleSubmitVideo} className="space-y-6">
                      
                      {/* Title Input */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Video Title</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-600 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-500 transition-colors">
                            <Type size={18} />
                          </div>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-navy-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-700 focus:outline-none focus:border-brand-500 focus:shadow-sm dark:focus:shadow-glow-sm transition"
                            placeholder="e.g. Valorant // Ace Montage"
                          />
                        </div>
                      </div>

                      {/* Type and Category Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Source</label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-600 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-500 transition-colors">
                               {formData.type === 'youtube' ? <Youtube size={18} /> : <HardDrive size={18} />}
                            </div>
                            <select
                              value={formData.type}
                              onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                              className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-10 text-navy-900 dark:text-white focus:outline-none focus:border-brand-500 transition appearance-none cursor-pointer"
                            >
                              <option value="youtube">YouTube</option>
                              <option value="drive">Google Drive</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-600">
                              <ChevronDown size={14} />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Category</label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-600 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-500 transition-colors">
                               <Layout size={18} />
                            </div>
                            <select
                              value={formData.category}
                              onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                              className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-10 text-navy-900 dark:text-white focus:outline-none focus:border-brand-500 transition appearance-none cursor-pointer"
                            >
                              <option value="Gaming">Gaming</option>
                              <option value="Showreel">Showreel</option>
                              <option value="Short">Short</option>
                              <option value="Vlog">Vlog</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-600">
                              <ChevronDown size={14} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* URL Input */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Secure Link (URL)</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-600 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-500 transition-colors">
                            <LinkIcon size={18} />
                          </div>
                          <input
                            type="url"
                            value={formData.url}
                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-navy-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-700 focus:outline-none focus:border-brand-500 focus:shadow-sm dark:focus:shadow-glow-sm transition font-mono text-sm"
                            placeholder={
                              formData.type === 'drive' 
                                ? "https://drive.google.com/file/d/.../view" 
                                : "https://www.youtube.com/watch?v=..."
                            }
                          />
                        </div>
                      </div>

                      {/* Thumbnail and Time Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <div className="sm:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Thumbnail (Opt)</label>
                            <div className="flex gap-2">
                                <div className="relative group flex-1">
                                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-600 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-500 transition-colors">
                                    <ImageIcon size={18} />
                                  </div>
                                  <input
                                    type="url"
                                    value={formData.thumbnail}
                                    onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-navy-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-700 focus:outline-none focus:border-brand-500 focus:shadow-sm dark:focus:shadow-glow-sm transition font-mono text-sm"
                                    placeholder="https://imgur.com/..."
                                  />
                                </div>
                                {formData.thumbnail && (
                                    <div className="w-12 h-12 rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden bg-gray-100 dark:bg-black shrink-0 relative group cursor-help">
                                        <img 
                                          src={formData.thumbnail} 
                                          alt="Preview" 
                                          className="w-full h-full object-cover" 
                                          onError={(e) => e.currentTarget.style.display = 'none'} 
                                        />
                                    </div>
                                )}
                            </div>
                         </div>

                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Start (Sec)</label>
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-600 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-500 transition-colors">
                                <Clock size={18} />
                              </div>
                              <input
                                type="number"
                                min="0"
                                value={formData.timestamp}
                                onChange={e => setFormData({ ...formData, timestamp: Number(e.target.value) })}
                                className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-navy-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-700 focus:outline-none focus:border-brand-500 focus:shadow-sm dark:focus:shadow-glow-sm transition text-center font-mono"
                                placeholder="0"
                              />
                            </div>
                         </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                           <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Briefing</label>
                           <div className="flex gap-1">
                              <button 
                                type="button" 
                                onClick={() => handleFormat('b')}
                                className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 dark:bg-dark-800 hover:bg-brand-600 dark:hover:bg-brand-600 text-gray-500 dark:text-gray-400 hover:text-white transition border border-gray-300 dark:border-white/10"
                                title="Bold"
                              >
                                 <Bold size={12} />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleFormat('i')}
                                className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 dark:bg-dark-800 hover:bg-brand-600 dark:hover:bg-brand-600 text-gray-500 dark:text-gray-400 hover:text-white transition border border-gray-300 dark:border-white/10"
                                title="Italic"
                              >
                                 <Italic size={12} />
                              </button>
                           </div>
                        </div>
                        <div className="relative group">
                          <div className="absolute top-4 left-4 pointer-events-none text-gray-400 dark:text-gray-600 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-500 transition-colors">
                             <FileText size={18} />
                          </div>
                          <textarea
                            ref={descriptionRef}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-navy-900 dark:text-white focus:outline-none focus:border-brand-500 focus:shadow-sm dark:focus:shadow-glow-sm transition h-32 resize-none font-sans leading-relaxed placeholder-gray-400 dark:placeholder-gray-700"
                            placeholder="Enter clip details and context..."
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg hover:shadow-xl dark:shadow-glow dark:hover:shadow-glow-lg uppercase tracking-wider group"
                      >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        Deploy Clip
                      </button>
                    </form>
                  </div>
               ) : (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-white/5">
                       <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center border border-brand-200 dark:border-brand-500/30 text-brand-600 dark:text-brand-500 shadow-sm dark:shadow-glow-sm">
                          <PenTool size={20} />
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-navy-900 dark:text-white">Manual Entry</h3>
                          <p className="text-xs text-gray-500 font-mono">ADD REVIEW MANUALLY</p>
                       </div>
                    </div>

                    <form onSubmit={handleSubmitReview} className="space-y-6">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Client Name</label>
                             <div className="relative">
                               <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                               <input 
                                  type="text" 
                                  value={reviewForm.name}
                                  onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                                  className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-navy-900 dark:text-white focus:outline-none focus:border-brand-500"
                                  placeholder="Client Name"
                               />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Role</label>
                             <input 
                                type="text" 
                                value={reviewForm.role}
                                onChange={(e) => setReviewForm({...reviewForm, role: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-navy-900 dark:text-white focus:outline-none focus:border-brand-500"
                                placeholder="e.g. YouTuber"
                             />
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Rating</label>
                          <div className="flex gap-2">
                             {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                   key={star}
                                   type="button"
                                   onClick={() => setReviewForm({...reviewForm, stars: star})}
                                   className={`transition-transform hover:scale-110 ${reviewForm.stars >= star ? 'text-brand-500' : 'text-gray-300 dark:text-gray-700'}`}
                                >
                                   <Star size={32} fill={reviewForm.stars >= star ? "currentColor" : "none"} />
                                </button>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Review Text</label>
                          <textarea 
                             value={reviewForm.text}
                             onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})}
                             className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-navy-900 dark:text-white focus:outline-none focus:border-brand-500 h-32 resize-none"
                             placeholder="Copy paste review here..."
                          />
                       </div>

                       <button
                        type="submit"
                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg hover:shadow-xl dark:shadow-glow uppercase tracking-wider"
                      >
                        <Save size={20} />
                        Save Review
                      </button>
                    </form>
                  </div>
               )}
            </div>
          </div>

          {/* Right Column: Reviews & Database List */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Review Inbox - Pending */}
            <div className={`space-y-4 ${pendingReviews.length > 0 ? '' : 'hidden'}`}>
               <h3 className="text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-white/5">
                 <MessageSquare className="text-brand-600 dark:text-brand-500" size={20} />
                 Review Inbox
                 <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingReviews.length} New</span>
               </h3>
               
               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                  {pendingReviews.map(review => (
                     <div key={review.id} className="relative bg-white dark:bg-dark-800 p-4 rounded-xl border-l-4 border-brand-500 shadow-md">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <div className="font-bold text-navy-900 dark:text-white flex items-center gap-2">
                                 {review.name}
                                 <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-black/30 px-2 py-0.5 rounded-full">{review.role}</span>
                              </div>
                              <div className="flex text-brand-500 text-xs mt-1">
                                 {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} fill={i < review.stars ? "currentColor" : "none"} className={i >= review.stars ? "text-gray-300" : ""} />
                                 ))}
                              </div>
                           </div>
                           <div className="flex gap-2 z-20">
                              <button 
                                 type="button"
                                 onClick={(e) => handleApproveReview(review.id, e)}
                                 className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition"
                                 title="Approve & Publish"
                              >
                                 <Check size={16} />
                              </button>
                              <button 
                                 type="button"
                                 onClick={(e) => handleDeleteReview(review.id, e)}
                                 className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition"
                                 title="Reject"
                              >
                                 <Ban size={16} />
                              </button>
                           </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm italic">"{review.text}"</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Published Reviews - Approved */}
            <div className="space-y-4">
               <h3 className="text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-white/5">
                 <Check className="text-green-600 dark:text-green-500" size={20} />
                 Published Reviews
                 <span className="text-gray-500 text-sm font-normal font-mono ml-auto">COUNT: {activeReviews.length}</span>
               </h3>

               {activeReviews.length === 0 ? (
                 <div className="p-6 text-center border-2 border-dashed border-gray-200 dark:border-white/5 rounded-xl text-gray-500 text-sm">
                   No reviews published yet.
                 </div>
               ) : (
                 <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                    {activeReviews.map(review => (
                       <div key={review.id} className="relative bg-gray-50 dark:bg-dark-800 p-4 rounded-xl border border-gray-200 dark:border-white/5 flex justify-between items-start group hover:border-brand-500/30 transition">
                          <div>
                             <div className="font-bold text-navy-900 dark:text-white flex items-center gap-2">
                                {review.name}
                                <span className="text-[10px] font-bold uppercase text-gray-400 border border-gray-200 dark:border-white/10 px-1.5 rounded">{review.role}</span>
                             </div>
                             <div className="flex text-brand-500 text-xs my-1">
                                {[...Array(5)].map((_, i) => (
                                   <Star key={i} size={10} fill={i < review.stars ? "currentColor" : "none"} className={i >= review.stars ? "text-gray-300 dark:text-gray-700" : ""} />
                                ))}
                             </div>
                             <p className="text-gray-600 dark:text-gray-400 text-xs italic line-clamp-2">"{review.text}"</p>
                          </div>
                          <button 
                             type="button"
                             onClick={(e) => handleDeleteReview(review.id, e)}
                             className="relative z-20 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition"
                             title="Delete Review"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    ))}
                 </div>
               )}
            </div>

            {/* Video Database */}
            <div className="space-y-6">
               <h3 className="text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2 pb-4 border-b border-gray-200 dark:border-white/5">
                 <Hash className="text-brand-600 dark:text-brand-500" size={20} />
                 Video Database 
                 <span className="text-gray-500 text-sm font-normal font-mono ml-auto">COUNT: {videos.length}</span>
               </h3>

               {/* Search Bar */}
               <div className="relative group">
                 <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-500 transition-colors">
                     <Search size={18} />
                 </div>
                 <input
                   type="text"
                   placeholder="Search database..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-navy-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-700 focus:outline-none focus:border-brand-500 focus:shadow-sm dark:focus:shadow-glow-sm transition text-sm"
                 />
               </div>

               <div className="relative group rounded-2xl">
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 via-brand-200 to-brand-500 rounded-2xl opacity-0 group-hover:opacity-50 blur-sm transition duration-500 bg-[length:200%_100%] animate-shimmer pointer-events-none"></div>
                 
                 <div className="relative space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-2 rounded-2xl bg-gray-50/50 dark:bg-black/40 border border-gray-200 dark:border-white/5 backdrop-blur-sm z-10">
                   {filteredVideos.map(video => (
                     <div key={video.id} className="relative bg-gray-50 dark:bg-dark-800 p-5 rounded-xl border border-gray-200 dark:border-white/5 flex justify-between items-center group/item hover:border-brand-500/50 hover:bg-gray-100 dark:hover:bg-dark-800/80 transition duration-300">
                       <div className="flex-1 min-w-0 pr-4">
                         <h4 className="font-bold text-navy-900 dark:text-white truncate group-hover/item:text-brand-600 dark:group-hover/item:text-brand-500 transition">{video.title}</h4>
                         <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-bold uppercase bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded flex items-center gap-1">
                               <Layout size={10} /> {video.category}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${video.type === 'youtube' ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20' : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-500 border border-blue-200 dark:border-blue-500/20'}`}>
                               {video.type === 'youtube' ? <Youtube size={10} /> : <HardDrive size={10} />}
                               {video.type}
                            </span>
                            {video.timestamp > 0 && (
                              <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                <Clock size={10} /> {video.timestamp}s
                              </span>
                            )}
                         </div>
                       </div>
                       <button
                         type="button"
                         onClick={(e) => handleDeleteVideoClick(video.id, e)}
                         className="relative z-20 text-gray-400 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-3 rounded-xl transition"
                         title="Delete Clip"
                       >
                         <Trash2 size={20} />
                       </button>
                     </div>
                   ))}
                   {filteredVideos.length === 0 && (
                     <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl">
                        <p className="text-gray-500 dark:text-gray-600 font-mono text-sm uppercase tracking-widest">
                          {searchTerm ? "No matches found" : "Database Empty"}
                        </p>
                     </div>
                   )}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;