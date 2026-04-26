import React, { useState, useEffect, useMemo } from 'react';
import { 
  Book, Star, Heart, GraduationCap, History, Send, X, Plus, 
  Search, Filter, ArrowLeft, Lightbulb, MessageCircle, HelpCircle,
  Smile, Award, CheckCircle2, Trophy, User, Home, BookOpen, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_STORIES, Story } from './data/books';

// --- Types ---
interface UserProgress {
  name?: string;
  age?: number;
  readBookIds: string[];
  favoriteBookIds: string[];
  lastReadId?: string;
  totalPoints: number;
}

const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={`${className} bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg overflow-hidden relative group transition-transform hover:scale-110`}>
    {/* Book Base */}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2/3 h-2/3 relative z-10 transition-transform group-hover:rotate-6">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="white" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="white" />
      {/* Sparkle/Star inside book */}
      <path d="M12 7l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="white" stroke="none" />
    </svg>
    {/* Decorative Elements */}
    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full blur-[2px] opacity-40 animate-pulse"></div>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20"></div>
  </div>
);

enum View {
  HOME = 'home',
  READ = 'read',
  PROFILE = 'profile',
}

export default function App() {
  // --- States ---
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [view, setView] = useState<View>(View.HOME);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [showSummary, setShowSummary] = useState(false);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  
  // Login Form States
  const [loginName, setLoginName] = useState('');
  const [loginAge, setLoginAge] = useState('');
  
  // Progress State
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('hibook_progress');
    const parsed = saved ? JSON.parse(saved) : {
      readBookIds: [],
      favoriteBookIds: [],
      totalPoints: 0
    };
    return parsed;
  });

  useEffect(() => {
    if (progress.name && progress.age) {
      setOnboardingComplete(true);
    }
  }, []);

  // Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: 'Chào em! Anh là trợ lý HiBook đây. Em cần anh giúp gì không?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('hibook_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    const customStories = localStorage.getItem('hibook_custom_stories');
    if (customStories) {
      setStories([...INITIAL_STORIES, ...JSON.parse(customStories)]);
    }
  }, []);

  // --- Handlers ---
  const handleRead = (story: Story) => {
    setSelectedStory(story);
    setView(View.READ);
    if (!progress.readBookIds.includes(story.id)) {
      setProgress(prev => ({
        ...prev,
        readBookIds: [...prev.readBookIds, story.id],
        lastReadId: story.id,
        totalPoints: prev.totalPoints + 10
      }));
    } else {
      setProgress(prev => ({ ...prev, lastReadId: story.id }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProgress(prev => {
      const isFav = prev.favoriteBookIds.includes(id);
      return {
        ...prev,
        favoriteBookIds: isFav 
          ? prev.favoriteBookIds.filter(fid => fid !== id)
          : [...prev.favoriteBookIds, id]
      };
    });
  };

  const categories = useMemo(() => {
    const cats = new Set(stories.map(s => s.category));
    return ['Tất cả', ...Array.from(cats)];
  }, [stories]);

  const filteredStories = useMemo(() => {
    return stories.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           s.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Tất cả' || s.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [stories, searchQuery, selectedCategory]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const userMsg = inputMessage.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputMessage('');

    // Simulated Bot Logic
    setTimeout(() => {
      let reply = `Câu hỏi này hay quá ${progress.name || 'em'} ơi! Em thử hỏi về nội dung sách hoặc bài học nhé!`;
      const lowerMsg = userMsg.toLowerCase();

      if (lowerMsg.includes('bài học')) {
        if (selectedStory) {
          reply = `Bài học của truyện "${selectedStory.title}" là: ${selectedStory.lesson}`;
        } else {
          reply = `Chào ${progress.name || 'em'}, em muốn hỏi bài học của truyện nào nhỉ? Hãy chọn một truyện rồi hỏi anh nhé!`;
        }
      } else if (lowerMsg.includes('nên đọc gì') || lowerMsg.includes('gợi ý')) {
        const randomStory = stories[Math.floor(Math.random() * stories.length)];
        reply = `Anh gợi ý ${progress.name || 'em'} đọc truyện "${randomStory.title}" của tác giả ${randomStory.author} nhé. Truyện rất hay và ý nghĩa đấy!`;
      } else if (lowerMsg.includes('chào')) {
        reply = `Chào ${progress.name || 'em'}! Chúc em một ngày đọc sách thật vui vẻ nhé!`;
      } else {
        const foundStory = stories.find(s => lowerMsg.includes(s.title.toLowerCase()));
        if (foundStory) {
          reply = `Truyện "${foundStory.title}" kể về: ${foundStory.summary}`;
        }
      }

      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    }, 600);
  };

  const getBadge = () => {
    const count = progress.readBookIds.length;
    if (count >= 5) return { name: 'Đại sứ văn hóa đọc nhí', icon: <Trophy className="w-8 h-8 text-yellow-500" /> };
    if (count >= 3) return { name: 'Người yêu sách', icon: <Award className="w-8 h-8 text-blue-500" /> };
    if (count >= 1) return { name: 'Người bạn của sách', icon: <Smile className="w-8 h-8 text-green-500" /> };
    return null;
  };

  const lastReadStory = stories.find(s => s.id === progress.lastReadId);
  const favoriteStories = stories.filter(s => progress.favoriteBookIds.includes(s.id));

  // --- Render Components ---
  if (!onboardingComplete) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 border-4 border-brand-primary/20"
        >
          <div className="text-center mb-8">
            <Logo className="w-24 h-24 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-gray-800">Chào mừng tới HiBook!</h2>
            <p className="text-gray-500 font-medium">Bé hãy điền tên và tuổi để bắt đầu nhé</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Tên của bé là gì?</label>
              <input 
                type="text" 
                placeholder="Ví dụ: Bảo Anh"
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-brand-primary rounded-2xl outline-none transition-all font-bold text-gray-800"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Bé bao nhiêu tuổi rồi?</label>
              <input 
                type="number" 
                placeholder="Ví dụ: 8"
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-brand-primary rounded-2xl outline-none transition-all font-bold text-gray-800"
                value={loginAge}
                onChange={(e) => setLoginAge(e.target.value)}
              />
            </div>
            <button 
              onClick={() => {
                if (loginName.trim() && loginAge) {
                  const nameStr = loginName.trim();
                  const ageNum = parseInt(loginAge);
                  setProgress(p => ({ ...p, name: nameStr, age: ageNum }));
                  setOnboardingComplete(true);
                }
              }}
              disabled={!loginName.trim() || !loginAge}
              className="w-full py-5 bg-brand-primary text-white rounded-3xl font-black text-lg shadow-xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
              Khám phá ngay!
            </button>
          </div>
          <p className="mt-8 text-center text-xs text-gray-400 font-medium italic">
            “Mở trang sách nhỏ, chạm tới ước mơ lớn”
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 glass-morphism border-b border-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView(View.HOME); setSelectedStory(null); }}>
          <Logo className="w-11 h-11" />
          <h1 className="text-2xl font-bold text-gray-800 hidden sm:block tracking-tight">HiBook</h1>
        </div>

        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm truyện..." 
              className="w-full pl-10 pr-4 py-2 border-2 border-transparent bg-white/50 rounded-full focus:outline-none focus:border-brand-secondary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setIsAddingBook(true)}
            className="p-2 bg-brand-secondary text-white rounded-full hover:scale-105 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setView(View.PROFILE)}
            className="p-2 bg-brand-accent text-gray-800 rounded-full hover:scale-105 transition-transform"
          >
            <User className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          {view === View.HOME && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8 text-center bg-white/40 p-8 rounded-[40px] border-4 border-dashed border-brand-secondary/30">
                <h2 className="text-4xl font-bold text-gray-800 mb-2">HiBook – Sách và ước mơ vươn xa</h2>
                <p className="text-gray-600 italic">“Mở trang sách nhỏ, chạm tới ước mơ lớn”</p>
                
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        selectedCategory === cat 
                        ? 'bg-brand-primary text-white shadow-lg' 
                        : 'bg-white text-gray-600 border border-gray-100 hover:border-brand-primary'
                      }`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStories.map(story => (
                  <motion.div
                    whileHover={{ y: -10 }}
                    key={story.id}
                    className="bg-white rounded-3xl overflow-hidden book-card-shadow border border-gray-50 flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden group">
                      <img 
                        src={story.coverImage} 
                        alt={story.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button 
                          onClick={(e) => toggleFavorite(e, story.id)}
                          className={`p-2 rounded-full glass-morphism ${progress.favoriteBookIds.includes(story.id) ? 'text-brand-primary' : 'text-gray-400'}`}
                        >
                          <Heart className={`w-5 h-5 ${progress.favoriteBookIds.includes(story.id) ? 'fill-current' : ''}`} />
                        </button>
                        {progress.readBookIds.includes(story.id) && (
                          <div className="p-2 rounded-full bg-green-500 text-white">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3 px-3 py-1 bg-brand-accent/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-800">
                        {story.category}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">{story.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">{story.author}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                        {story.summary}
                      </p>
                      <button 
                        onClick={() => handleRead(story)}
                        className="w-full py-3 bg-brand-primary text-white rounded-2xl font-bold shadow-md shadow-brand-primary/20 hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-5 h-5" /> Đọc ngay
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {view === View.READ && selectedStory && (
            <motion.div 
              key="read"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-4xl mx-auto"
            >
              <button 
                onClick={() => setView(View.HOME)}
                className="mb-6 flex items-center gap-2 text-brand-primary font-bold hover:gap-3 transition-all"
              >
                <ArrowLeft className="w-5 h-5" /> Quay lại thư viện
              </button>

              <div className="bg-white rounded-[40px] overflow-hidden book-card-shadow border-4 border-brand-accent/20 mb-8">
                <div className="relative h-[300px] sm:h-[400px]">
                  <img src={selectedStory.coverImage} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                    <span className="text-brand-accent font-bold mb-2">{selectedStory.category}</span>
                    <h2 className="text-4xl sm:text-5xl font-black text-white mb-2">{selectedStory.title}</h2>
                    <p className="text-white/80 font-medium italic">Tác giả: {selectedStory.author}</p>
                  </div>
                </div>

                <div className="p-8 sm:p-12">
                  <div className="flex justify-center gap-4 mb-8">
                    <button 
                      onClick={() => setShowSummary(!showSummary)}
                      className={`px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all ${showSummary ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      <History className="w-5 h-5" /> Tóm tắt sách
                    </button>
                  </div>

                  <AnimatePresence>
                    {showSummary && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-10"
                      >
                        <div className="bg-orange-50 border-2 border-orange-100 rounded-3xl p-6 relative">
                          <button onClick={() => setShowSummary(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                          </button>
                          <h4 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" /> Nội dung chính
                          </h4>
                          <p className="text-gray-700 mb-4 leading-relaxed">{selectedStory.summary}</p>
                          <ul className="space-y-2 mb-6">
                            {selectedStory.summaryKeyPoints.map((point, idx) => (
                              <li key={idx} className="flex gap-3 text-gray-600 italic">
                                <span className="text-orange-500 font-bold">•</span> {point}
                              </li>
                            ))}
                          </ul>
                          <div className="bg-white/60 rounded-2xl p-4 border border-orange-200">
                            <p className="text-orange-900 font-bold flex items-center gap-2">
                              <Lightbulb className="w-5 h-5" /> Bài học:
                            </p>
                            <p className="text-gray-700 italic">{selectedStory.lesson}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="prose prose-lg max-w-none text-gray-700 leading-loose text-justify font-medium">
                    {selectedStory.content.split('\n').map((para, i) => (
                      <p key={i} className="mb-6">{para}</p>
                    ))}
                  </div>

                  <div className="mt-12 pt-12 border-t border-gray-100">
                    <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <HelpCircle className="w-6 h-6 text-brand-secondary" /> Câu hỏi suy ngẫm
                    </h4>
                    <div className="grid gap-4">
                      {selectedStory.reflectionQuestions.map((q, i) => (
                        <div key={i} className="bg-brand-bg p-5 rounded-2xl border-l-4 border-brand-secondary flex gap-4">
                          <span className="w-8 h-8 rounded-full bg-brand-secondary text-white flex items-center justify-center shrink-0 font-bold">
                            {i + 1}
                          </span>
                          <p className="text-gray-700 font-bold">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === View.PROFILE && (
            <motion.div 
               key="profile"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-[40px] overflow-hidden book-card-shadow">
                <div className="bg-brand-primary p-12 text-center text-white relative">
                  <button onClick={() => setView(View.HOME)} className="absolute top-8 left-8 p-2 rounded-full bg-white/20 hover:bg-white/30">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div className="w-32 h-32 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl relative">
                    <User className="w-16 h-16 text-brand-primary" />
                    {getBadge() && (
                      <div className="absolute -bottom-2 -right-2 p-2 bg-brand-accent rounded-full border-4 border-white shadow-lg">
                        {getBadge()?.icon}
                      </div>
                    )}
                  </div>
                  <h2 className="text-4xl font-black mb-2">{progress.name || 'Góc đọc của em'}</h2>
                  <p className="text-white/80 font-medium italic">{progress.age ? `${progress.age} tuổi • ` : ''}“Mỗi ngày đọc một chút, ước mơ sẽ lớn thêm một chút.”</p>
                </div>

                <div className="p-8 sm:p-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-blue-50 p-6 rounded-3xl text-center">
                      <p className="text-gray-500 font-bold mb-1">Đã đọc</p>
                      <p className="text-4xl font-black text-blue-600">{progress.readBookIds.length}</p>
                      <p className="text-xs text-gray-400">quyển sách</p>
                    </div>
                    <div className="bg-pink-50 p-6 rounded-3xl text-center">
                      <p className="text-gray-500 font-bold mb-1">Yêu thích</p>
                      <p className="text-4xl font-black text-pink-600">{progress.favoriteBookIds.length}</p>
                      <p className="text-xs text-gray-400">câu chuyện</p>
                    </div>
                    <div className="bg-yellow-50 p-6 rounded-3xl text-center">
                      <p className="text-gray-500 font-bold mb-1">Điểm tri thức</p>
                      <p className="text-4xl font-black text-yellow-600">{progress.totalPoints}</p>
                      <p className="text-xs text-gray-400">điểm</p>
                    </div>
                  </div>

                  <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-brand-secondary" /> Tiến độ mục tiêu
                      </h4>
                      <span className="text-brand-secondary font-bold">{progress.readBookIds.length}/5 Đã hoàn thành</span>
                    </div>
                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((progress.readBookIds.length / 5) * 100, 100)}%` }}
                        className="h-full bg-brand-secondary"
                      />
                    </div>
                    {getBadge() && (
                      <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-100 rounded-2xl flex items-center gap-4">
                        <div className="p-2 bg-white rounded-xl">{getBadge()?.icon}</div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-black">Danh hiệu hiện tại</p>
                          <p className="text-lg font-bold text-yellow-700">{getBadge()?.name}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-brand-primary" /> Sách yêu thích
                      </h4>
                      <div className="space-y-4">
                        {favoriteStories.length > 0 ? favoriteStories.map(s => (
                          <div key={s.id} onClick={() => handleRead(s)} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-2xl hover:bg-pink-50 cursor-pointer transition-colors shadow-sm">
                            <img src={s.coverImage} className="w-12 h-16 object-cover rounded-lg" />
                            <div className="overflow-hidden">
                              <p className="font-bold text-gray-800 line-clamp-1">{s.title}</p>
                              <p className="text-xs text-gray-400">{s.category}</p>
                            </div>
                          </div>
                        )) : <p className="text-gray-400 italic">Chưa có sách yêu thích.</p>}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <History className="w-6 h-6 text-blue-500" /> Vừa đọc gần đây
                      </h4>
                      {lastReadStory ? (
                        <div onClick={() => handleRead(lastReadStory)} className="p-4 bg-blue-50 rounded-3xl border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
                          <img src={lastReadStory.coverImage} className="w-full h-32 object-cover rounded-2xl mb-4" />
                          <p className="font-bold text-blue-800 text-lg">{lastReadStory.title}</p>
                          <p className="text-blue-600 text-sm">Bấm để tiếp tục đọc</p>
                        </div>
                      ) : <p className="text-gray-400 italic">Chưa đọc truyện nào.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Chatbot Toggle */}
      <button 
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-brand-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <MessageCircle className="w-8 h-8" />
      </button>

      {/* Chatbot Modal */}
      <AnimatePresence>
        {chatOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="w-full max-w-sm h-[500px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col border-4 border-brand-primary pointer-events-auto"
            >
              <div className="bg-brand-primary p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-primary">
                    <Smile className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold">Trợ lý HiBook</h5>
                    <p className="text-xs text-white/70">Online</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-white/20 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-bg">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                      m.role === 'user' 
                        ? 'bg-brand-primary text-white rounded-tr-none' 
                        : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none'
                    }`}>
                      <p className="text-sm font-medium">{m.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border-t flex gap-2">
                <input 
                  type="text" 
                  placeholder="Hỏi HiBook về truyện..." 
                  className="flex-1 bg-gray-50 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  onClick={handleSendMessage}
                  className="p-2 bg-brand-primary text-white rounded-xl hover:bg-opacity-90"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Book Modal (Quick implementation) */}
      <AnimatePresence>
        {isAddingBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingBook(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b flex items-center justify-between bg-brand-secondary text-white">
                <h3 className="text-xl font-bold flex items-center gap-2"><Plus className="w-6 h-6" /> Thêm truyện mới</h3>
                <button onClick={() => setIsAddingBook(false)}><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newStory: Story = {
                    id: Date.now().toString(),
                    title: formData.get('title') as string,
                    author: formData.get('author') as string,
                    category: formData.get('category') as string,
                    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
                    content: formData.get('content') as string,
                    lesson: formData.get('lesson') as string,
                    summary: formData.get('summary') as string,
                    reflectionQuestions: [formData.get('q1') as string || 'Em thích gì ở truyện này?'],
                    summaryKeyPoints: [(formData.get('summary') as string).substring(0, 30) + '...'],
                    isDefault: false
                  };
                  
                  const updatedStories = [...stories, newStory];
                  setStories(updatedStories);
                  const currentCustom = JSON.parse(localStorage.getItem('hibook_custom_stories') || '[]');
                  localStorage.setItem('hibook_custom_stories', JSON.stringify([...currentCustom, newStory]));
                  setIsAddingBook(false);
                }}>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tên truyện</label>
                    <input name="title" required className="w-full px-4 py-2 bg-gray-50 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tác giả</label>
                    <input name="author" required className="w-full px-4 py-2 bg-gray-50 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Thể loại</label>
                    <input name="category" required className="w-full px-4 py-2 bg-gray-50 rounded-xl" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả ngắn (Tóm tắt)</label>
                    <textarea name="summary" required className="w-full px-4 py-2 bg-gray-50 rounded-xl min-h-[80px]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nội dung câu chuyện</label>
                    <textarea name="content" required className="w-full px-4 py-2 bg-gray-50 rounded-xl min-h-[150px]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Bài học rút ra</label>
                    <input name="lesson" required className="w-full px-4 py-2 bg-gray-50 rounded-xl" />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className="w-full py-4 bg-brand-secondary text-white rounded-2xl font-bold shadow-lg shadow-brand-secondary/20 hover:bg-opacity-90 transition-all">
                      Thêm vào thư viện ngay!
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation for Mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 glass-morphism border-t border-white px-8 py-3 flex justify-between items-center z-40">
        <button onClick={() => setView(View.HOME)} className={`p-2 rounded-xl transition-all ${view === View.HOME ? 'text-brand-primary' : 'text-gray-400'}`}>
          <Home className="w-6 h-6" />
        </button>
        <button onClick={() => setView(View.PROFILE)} className={`p-2 rounded-xl transition-all ${view === View.PROFILE ? 'text-brand-primary' : 'text-gray-400'}`}>
          <User className="w-6 h-6" />
        </button>
        <button onClick={() => setIsAddingBook(true)} className="p-3 bg-brand-primary text-white rounded-full shadow-lg -translate-y-6">
          <Plus className="w-6 h-6" />
        </button>
        <button className="p-2 text-gray-400 opacity-20 cursor-not-allowed">
           <Star className="w-6 h-6" />
        </button>
        <button className="p-2 text-gray-400 opacity-20 cursor-not-allowed">
           <History className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
