import React, { useState, useRef, useEffect } from 'react';
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
  RotateCcw,
  Palette,
  Edit2,
  RefreshCw,
  Upload
} from 'lucide-react';

interface AdminPanelProps {
  videos: VideoClip[];
  onAddVideo: (video: VideoClip) => void;
  onEditVideo: (video: VideoClip) => void;
  onDeleteVideo: (id: string) => void;
  onClose: () => void;
  skills: SkillSet;
  onUpdateSkills: (skills: SkillSet) => void;
  reviews: Review[];
  onUpdateReviews: (reviews: Review[]) => void;
  onResetData: () => void;
  profileImage: string;
  onUpdateProfileImage: (url: string) => void;
  bannerImage: string;
  onUpdateBannerImage: (url: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  videos, 
  onAddVideo, 
  onEditVideo,
  onDeleteVideo, 
  onClose, 
  skills, 
  onUpdateSkills, 
  reviews, 
  onUpdateReviews, 
  onResetData,
  profileImage,
  onUpdateProfileImage,
  bannerImage,
  onUpdateBannerImage
}) => {
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'video' | 'review'>('video');
  const [editingId, setEditingId] = useState<string | null>(null);
  
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
  
  // Visual Form State
  const [visualForm, setVisualForm] = useState({
     profile: profileImage,
     banner: bannerImage
  });

  // Sync state with props when they change (e.g. after Reset Data)
  useEffect(() => {
    setSkillForm(skills);
  }, [skills]);

  useEffect(() => {
    setVisualForm({ profile: profileImage, banner: bannerImage });
  }, [profileImage, bannerImage]);

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

  const validateMediaUrl = (url: string, type: string): { isValid: boolean; error?: string } => {
    if (!url || !url.trim()) return { isValid: false, error: "URL is required." };
    const cleanUrl = url.trim();

    try {
      const parsedUrl = new URL(cleanUrl);
      
      if (type === 'youtube') {
        const ytRegex = /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&].*)?$/;
        const match = cleanUrl.match(ytRegex);
        
        if (!match || !match[1]) {
          return { isValid: false, error: "Invalid YouTube URL. Could not extract a valid 11-character Video ID." };
        }
        return { isValid: true };
      }
      
      if (type === 'drive') {
        if (!parsedUrl.hostname.includes('drive.google.com')) {
          return { isValid: false, error: "URL must be from drive.google.com." };
        }
        
        const fileIdRegex = /(?:\/file\/d\/|id=)([-a-zA-Z0-9_]+)/;
        const match = cleanUrl.match(fileIdRegex);
        
        if (!match || !match[1]) {
           return { isValid: false, error: "Invalid Drive Link. Ensure it contains a File ID (e.g., /file/d/xyz...)." };
        }
        return { isValid: true };
      }

      if (type === 'direct') {
         if (!parsedUrl.pathname.match(/\.(mp4|webm|mov|m4v)$/i)) {
            // Warn but allow
         }
         return { isValid: true };
      }
      
      return { isValid: true };
    } catch (e) {
      return { isValid: false, error: "Invalid URL format. Please include https://" };
    }
  };

  const handleSubmitVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title?.trim()) {
      setError("Title is required.");
      return;
    }
    
    const urlValidation = validateMediaUrl(formData.url || '', formData.type || 'youtube');
    if (!urlValidation.isValid) {
      setError(urlValidation.error || "Invalid URL");
      return;
    }

    if (formData.timestamp && formData.timestamp < 0) {
      setError("Start time cannot be negative.");
      return;
    }

    const videoData: VideoClip = {
      id: editingId || Date.now().toString(),
      title: formData.title!,
      url: formData.url!.trim(),
      thumbnail: formData.thumbnail,
      type: formData.type as 'youtube' | 'drive' | 'direct',
      category: formData.category as any,
      description: formData.description,
      timestamp: formData.timestamp || 0
    };

    if (editingId) {
       onEditVideo(videoData);
    } else {
       onAddVideo(videoData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      thumbnail: '',
      type: 'youtube',
      category: 'Gaming',
      description: '',
      timestamp: 0
    });
    setEditingId(null);
    setError(null);
  };

  const handleEditClick = (video: VideoClip) => {
     setFormData(video);
     setEditingId(video.id);
     setActiveTab('video');
     setError(null);
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
      status: 'approved',
      date: new Date().toISOString()
    };

    onUpdateReviews([newReview, ...reviews]);
    setReviewForm({ name: '', role: '', text: '', stars: 5 });
  };

  const handleSkillsChange = (key: keyof SkillSet, value: number) => {
    const newValue = Math.min(100, Math.max(0, value));
    const newSkills = { ...skillForm, [key]: newValue };
    setSkillForm(newSkills);
    setConfigSaved(false);
  };

  const handleVisualChange = (key: 'profile' | 'banner', value: string) => {
     setVisualForm(prev => ({ ...prev, [key]: value }));
     setConfigSaved(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: 'profile' | 'banner') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Limit to 2MB to prevent LocalStorage quota issues
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large (max 2MB). Please compress it or use an external URL.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleVisualChange(key, event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveConfig = () => {
    // Commit all changes to parent state and LocalStorage here
    onUpdateSkills(skillForm);
    onUpdateProfileImage(visualForm.profile);
    onUpdateBannerImage(visualForm.banner);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

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
        if (editingId === id) {
           resetForm();
        }
        onDeleteVideo(id);
    }
  };

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    video.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/90 backdrop-blur-md p-4"
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
                      <p className="text-xs text-gray-500 font-mono">ADJUST SKILL METRICS & VISUALS</p>
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

                   {/* Visual Identity Section */}
                   <div className="pt-4 border-t border-gray-200 dark:border-white/5">
                      <div className="flex items-center gap-2 mb-4">
                        <Palette size={16} className="text-brand-500"/>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Visual Identity</span>
                      </div>
                      
                      <div className="space-y-6">
                         {/* Profile Image Input */}
                         <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Profile Image</label>
                                <button 
                                    type="button"
                                    onClick={() => profileInputRef.current?.click()}
                                    className="text-[10px] font-bold text-brand-500 hover:text-brand-600 flex items-center gap-1 uppercase"
                                >
                                    <Upload size={12} /> Upload File
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 overflow-hidden shrink-0 relative">
                                     <img src={visualForm.profile} alt="Preview" className="w-full h-full object-cover" onError={e => e.currentTarget.style.display = 'none'} />
                                </div>
                                <input 
                                   type="url"
                                   value={visualForm.profile}
                                   onChange={(e) => handleVisualChange('profile', e.target.value)}
                                   className="flex-1 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg py-2 px-3 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-brand-500 font-mono"
                                   placeholder="https://..."
                                />
                                <input 
                                    type="file" 
                                    ref={profileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={(e) => handleFileChange(e, 'profile')} 
                                />
                            </div>
                         </div>

                         {/* Banner Image Input */}
                         <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Banner Image</label>
                                <button 
                                    type="button"
                                    onClick={() => bannerInputRef.current?.click()}
                                    className="text-[10px] font-bold text-brand-500 hover:text-brand-600 flex items-center gap-1 uppercase"
                                >
                                    <Upload size={12} /> Upload File
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-20 h-12 rounded-lg bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 overflow-hidden shrink-0 relative">
                                     <img src={visualForm.banner} alt="Preview" className="w-full h-full object-cover" onError={e => e.currentTarget.style.display = 'none'} />
                                </div>
                                <input 
                                   type="url"
                                   value={visualForm.banner}
                                   onChange={(e) => handleVisualChange('banner', e.target.value)}
                                   className="flex-1 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg py-2 px-3 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-brand-500 font-mono"
                                   placeholder="https://..."
                                />
                                <input 
                                    type="file" 
                                    ref={bannerInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={(e) => handleFileChange(e, 'banner')} 
                                />
                            </div>
                         </div>
                      </div>
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
                    onClick={() => {
                       setActiveTab('video');
                       resetForm();
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'video' ? 'bg-white dark:bg-brand-500 text-brand-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'}`}
                  >
                     {editingId ? <Edit2 size={16} /> : <Plus size={16} />} 
                     {editingId ? 'Edit Video' : 'Add Video'}
                  </button>
                  <button 
                    onClick={() => {
                       setActiveTab('review');
                       setEditingId(null);
                    }}
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
                          {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-navy-900 dark:text-white">{editingId ? 'Edit Transmission' : 'New Transmission'}</h3>
                          <p className="text-xs text-gray-500 font-mono">{editingId ? 'UPDATE EXISTING CLIP' : 'ADD CONTENT TO DATABASE'}</p>
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

                      <div className="flex gap-2">
                        {editingId && (
                           <button
                             type="button"
                             onClick={resetForm}
                             className="px-6 py-4 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition"
                           >
                              Cancel
                           </button>
                        )}
                        <button
                           type="submit"
                           className={`flex-1 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-brand-500 hover:bg-brand-600'} text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg hover:shadow-xl dark:shadow-glow dark:hover:shadow-glow-lg uppercase tracking-wider group`}
                        >
                           {editingId ? <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" /> : <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />}
                           {editingId ? 'Update Clip' : 'Deploy Clip'}
                        </button>
                      </div>
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
                          <p className="text-xs text-gray-500 font-mono">ADD TESTIMONIAL</p>
                       </div>
                    </div>

                    <form onSubmit={handleSubmitReview} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Name</label>
                                <input 
                                    type="text"
                                    required
                                    value={reviewForm.name}
                                    onChange={e => setReviewForm({...reviewForm, name: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-navy-900 dark:text-white focus:outline-none focus:border-brand-500"
                                    placeholder="Client Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Role</label>
                                <input 
                                    type="text"
                                    value={reviewForm.role}
                                    onChange={e => setReviewForm({...reviewForm, role: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-navy-900 dark:text-white focus:outline-none focus:border-brand-500"
                                    placeholder="e.g. CEO"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Review</label>
                            <textarea
                                required
                                value={reviewForm.text}
                                onChange={e => setReviewForm({...reviewForm, text: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-navy-900 dark:text-white focus:outline-none focus:border-brand-500 h-24 resize-none"
                                placeholder="Feedback text..."
                            />
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
                                    <Star size={24} fill={reviewForm.stars >= star ? "currentColor" : "none"} />
                                 </button>
                              ))}
                           </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg hover:shadow-xl dark:shadow-glow dark:hover:shadow-glow-lg uppercase tracking-wider"
                        >
                            <Plus size={20} /> Add Review
                        </button>
                    </form>
                  </div>
               )}
            </div>
          </div>
          
          {/* Right Column: List View */}
          <div className="lg:col-span-7 bg-gray-50 dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-white/5 flex flex-col overflow-hidden">
             {/* Search/Filter Header */}
             <div className="p-4 border-b border-gray-200 dark:border-white/5 flex gap-4 bg-white dark:bg-black/20">
                <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input 
                      type="text" 
                      placeholder="Search database..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-dark-900/50 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-brand-500 text-navy-900 dark:text-white"
                   />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
                   {activeTab === 'video' ? (
                      <><HardDrive size={14} /> {filteredVideos.length} Clips</>
                   ) : (
                      <><User size={14} /> {reviews.length} Reviews</>
                   )}
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {activeTab === 'video' ? (
                   filteredVideos.length > 0 ? (
                      filteredVideos.map(video => (
                         <div key={video.id} className={`group bg-white dark:bg-dark-900 p-4 rounded-xl border transition-colors flex gap-4 items-center ${editingId === video.id ? 'border-brand-500 shadow-[0_0_15px_rgba(var(--brand-500),0.1)]' : 'border-gray-200 dark:border-white/5 hover:border-brand-500 dark:hover:border-brand-500'}`}>
                            <div className="w-24 aspect-video bg-gray-100 dark:bg-black rounded-lg overflow-hidden shrink-0 relative">
                               <img 
                                  src={video.thumbnail || (video.type === 'youtube' && video.url.includes('v=') ? `https://img.youtube.com/vi/${video.url.split('v=')[1]?.split('&')[0]}/default.jpg` : '')} 
                                  alt="" 
                                  className="w-full h-full object-cover opacity-80"
                                  onError={(e) => (e.target as HTMLImageElement).style.backgroundColor = '#222'}
                               />
                               <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  {video.type === 'youtube' ? <Youtube size={16} className="text-white" /> : <HardDrive size={16} className="text-white" />}
                               </div>
                            </div>
                            <div className="flex-1 min-w-0">
                               <h4 className="font-bold text-navy-900 dark:text-white truncate">{video.title}</h4>
                               <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  <span className="bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{video.category}</span>
                                  <span className="truncate max-w-[150px]">{video.url}</span>
                               </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                 onClick={() => handleEditClick(video)}
                                 className={`p-2 rounded-lg transition ${editingId === video.id ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20'}`}
                                 title="Edit Clip"
                              >
                                 <Edit2 size={18} />
                              </button>
                              <button 
                                 onClick={(e) => handleDeleteVideoClick(video.id, e)}
                                 className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                 title="Delete Clip"
                              >
                                 <Trash2 size={18} />
                              </button>
                            </div>
                         </div>
                      ))
                   ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2 opacity-50">
                         <Search size={32} />
                         <p className="text-sm font-mono">NO RECORDS FOUND</p>
                      </div>
                   )
                ) : (
                   reviews.length > 0 ? (
                      reviews.sort((a,b) => (a.status === 'pending' ? -1 : 1)).map(review => (
                         <div key={review.id} className={`group bg-white dark:bg-dark-900 p-4 rounded-xl border transition-colors flex gap-4 items-start ${review.status === 'pending' ? 'border-brand-500/50 shadow-[0_0_15px_rgba(var(--brand-500),0.1)]' : 'border-gray-200 dark:border-white/5'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${review.status === 'pending' ? 'bg-brand-500 animate-pulse' : 'bg-gray-300 dark:bg-dark-700'}`}>
                               {review.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-start">
                                  <div>
                                     <h4 className="font-bold text-navy-900 dark:text-white flex items-center gap-2">
                                        {review.name}
                                        {review.status === 'pending' && <span className="text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">New</span>}
                                     </h4>
                                     <p className="text-xs text-brand-500 font-bold uppercase tracking-wide">{review.role}</p>
                                  </div>
                                  <div className="flex text-brand-400">
                                     {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} fill={i < review.stars ? "currentColor" : "none"} className={i < review.stars ? "" : "text-gray-200 dark:text-dark-600"} />
                                     ))}
                                  </div>
                               </div>
                               <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">"{review.text}"</p>
                            </div>
                            <div className="flex flex-col gap-1">
                               {review.status === 'pending' && (
                                  <button 
                                     onClick={(e) => handleApproveReview(review.id, e)}
                                     className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                                     title="Approve"
                                  >
                                     <Check size={16} />
                                  </button>
                               )}
                               <button 
                                  onClick={(e) => handleDeleteReview(review.id, e)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                  title="Delete"
                               >
                                  <Trash2 size={16} />
                               </button>
                            </div>
                         </div>
                      ))
                   ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2 opacity-50">
                         <MessageSquare size={32} />
                         <p className="text-sm font-mono">NO REVIEWS FOUND</p>
                      </div>
                   )
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};