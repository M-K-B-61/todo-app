import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Calendar, Flag, Star, Sparkles, Trophy, TrendingUp } from 'lucide-react';

interface Todo {
  id: number;
  text: string;
  isDaily: boolean;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  color: string;
}

const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isDaily, setIsDaily] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showForm, setShowForm] = useState(false);
  const [swipedId, setSwipedId] = useState<number | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      setTodos(JSON.parse(saved));
    }
    const savedStreak = localStorage.getItem('streak');
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: Todo = {
        id: Date.now(),
        text: newTodo,
        isDaily,
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      };
      setTodos([...todos, todo]);
      setNewTodo('');
      setIsDaily(false);
      setPriority('medium');
      setShowForm(false);
    }
  };

  const createParticles = (x: number, y: number) => {
    const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      angle: (i * 30) * Math.PI / 180,
      color: ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981'][Math.floor(Math.random() * 4)]
    }));
    setParticles([...particles, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 1000);
  };

  const toggleTodo = (id: number, event: React.MouseEvent) => {
    const todo = todos.find(t => t.id === id);
    if (todo && !todo.completed) {
      const rect = event.currentTarget.getBoundingClientRect();
      createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);

      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('streak', newStreak.toString());
    }

    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed, completedAt: !todo.completed ? new Date().toISOString() : null }
        : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
    setSwipedId(null);
  };

  const dailyTodos = todos.filter(t => t.isDaily);
  const todayTodos = todos.filter(t => !t.isDaily);

  const dailyCompleted = dailyTodos.filter(t => t.completed).length;
  const todayCompleted = todayTodos.filter(t => t.completed).length;

  const dailyProgress = dailyTodos.length ? (dailyCompleted / dailyTodos.length) * 100 : 0;
  const todayProgress = todayTodos.length ? (todayCompleted / todayTodos.length) * 100 : 0;
  const totalProgress = todos.length ? ((dailyCompleted + todayCompleted) / todos.length) * 100 : 0;

  const priorityColors = {
    low: { bg: 'from-emerald-400 via-teal-400 to-cyan-500', glow: 'shadow-emerald-500/50', ring: 'ring-emerald-400/30' },
    medium: { bg: 'from-amber-400 via-orange-400 to-red-400', glow: 'shadow-orange-500/50', ring: 'ring-orange-400/30' },
    high: { bg: 'from-rose-400 via-pink-500 to-fuchsia-600', glow: 'shadow-pink-500/50', ring: 'ring-pink-400/30' }
  };

  const priorityLabels = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek'
  };

  const TodoItem = ({ todo, index }: { todo: Todo; index: number }) => {
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const isSwiped = swipedId === todo.id;

    const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (touchStart - touchEnd > 75) {
        setSwipedId(todo.id);
      } else if (touchEnd - touchStart > 75) {
        setSwipedId(null);
      }
    };

    return (
      <div
        className="relative overflow-hidden group/item"
        style={{ animation: `slideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s both` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`transition-all duration-500 ease-out ${isSwiped ? '-translate-x-24' : ''}`}>
          <div
            className={`relative backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 rounded-3xl p-5 mb-4 border border-white/30 hover:border-white/50 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:shadow-2xl ${
              todo.completed ? 'opacity-70' : 'hover:shadow-purple-500/20'
            } ${priorityColors[todo.priority].ring} ring-2 ring-offset-0 ring-offset-transparent`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => toggleTodo(todo.id, e)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-3xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-500"></div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="mt-1 relative">
                <div className={`absolute inset-0 blur-xl ${todo.completed ? 'bg-green-400' : 'bg-purple-400'} opacity-0 group-hover/item:opacity-60 transition-opacity duration-500`}></div>
                {todo.completed ? (
                  <div className="relative">
                    <CheckCircle className="w-7 h-7 text-emerald-400" style={{ animation: 'checkBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
                    <div className="absolute inset-0 bg-emerald-400 rounded-full blur-md opacity-50 animate-ping"></div>
                  </div>
                ) : (
                  <Circle className="w-7 h-7 text-white/50 group-hover/item:text-white/90 transition-all duration-300 group-hover/item:scale-110" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="relative">
                  <p className={`text-white text-lg font-medium mb-3 leading-relaxed transition-all duration-500 ${
                    todo.completed ? 'text-white/60' : ''
                  }`}>
                    {todo.text}
                    {todo.completed && (
                      <span className="absolute inset-0 flex items-center">
                        <span
                          className="h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                          style={{ animation: 'lineThrough 0.6s ease-out forwards' }}
                        ></span>
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-4 py-1.5 rounded-2xl text-xs font-bold bg-gradient-to-r ${priorityColors[todo.priority].bg} text-white shadow-lg ${priorityColors[todo.priority].glow} transform transition-all duration-300 hover:scale-105`}>
                    <Flag className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                    {priorityLabels[todo.priority]}
                  </span>

                  {todo.completed && todo.completedAt && (
                    <span className="text-xs text-emerald-300 flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 rounded-2xl backdrop-blur-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                      {new Date(todo.completedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-1000 ${
              isHovered ? 'translate-x-full' : ''
            }`}></div>

            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-3xl opacity-0 group-hover/item:opacity-20 blur-xl transition-opacity duration-500"></div>
          </div>
        </div>

        {isSwiped && (
          <button
            onClick={() => deleteTodo(todo.id)}
            className="absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center rounded-r-3xl shadow-2xl hover:from-red-600 hover:to-rose-700 transition-all duration-300"
            style={{ animation: 'slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <Trash2 className="w-6 h-6 text-white animate-bounce" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl -top-48 -left-48 animate-float"></div>
        <div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl top-1/3 -right-48 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-3xl -bottom-24 left-1/4 animate-float" style={{ animationDelay: '4s' }}></div>

        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-3 h-3 rounded-full pointer-events-none"
            style={{
              left: particle.x,
              top: particle.y,
              backgroundColor: particle.color,
              animation: 'particleFloat 1s ease-out forwards',
              transform: `translate(-50%, -50%) rotate(${particle.angle}rad)`,
              boxShadow: `0 0 20px ${particle.color}`
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12" style={{ animation: 'fadeInDown 1s ease-out' }}>
          <div className="inline-block relative mb-4">
            <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 animate-gradient">
              Görevlerim
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 blur-2xl animate-pulse"></div>
          </div>
          <p className="text-white/80 text-xl font-light">Hedeflerine adım adım ulaş</p>

          <div className="mt-8 flex items-center justify-center gap-8">
            <div className="backdrop-blur-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl px-8 py-4 border border-white/30 shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
                <div className="text-left">
                  <p className="text-white/60 text-xs uppercase tracking-wider">Seri</p>
                  <p className="text-white text-2xl font-bold">{streak} 🔥</p>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl px-8 py-4 border border-white/30 shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
                <div className="text-left">
                  <p className="text-white/60 text-xs uppercase tracking-wider">Toplam İlerleme</p>
                  <p className="text-white text-2xl font-bold">{Math.round(totalProgress)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 rounded-[2rem] p-8 border border-white/30 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500" style={{ animation: 'slideInLeft 1s ease-out' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="relative">
                  <Calendar className="w-9 h-9 text-purple-400" />
                  <div className="absolute inset-0 blur-xl bg-purple-400 opacity-50"></div>
                </div>
                Günlük Rutinler
              </h2>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{dailyCompleted}</p>
                <p className="text-white/60 text-sm">/ {dailyTodos.length}</p>
              </div>
            </div>

            <div className="relative w-full bg-white/10 rounded-full h-4 mb-6 overflow-hidden shadow-inner">
              <div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 animate-gradient"
                style={{ width: `${dailyProgress}%`, transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold drop-shadow-lg">{Math.round(dailyProgress)}%</span>
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {dailyTodos.length === 0 ? (
                <div className="text-center py-16">
                  <Star className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/50 text-lg">Henüz günlük rutin eklenmemiş</p>
                </div>
              ) : (
                dailyTodos.map((todo, idx) => <TodoItem key={todo.id} todo={todo} index={idx} />)
              )}
            </div>
          </div>

          <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 rounded-[2rem] p-8 border border-white/30 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500" style={{ animation: 'slideInRight 1s ease-out' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="relative">
                  <CheckCircle className="w-9 h-9 text-blue-400" />
                  <div className="absolute inset-0 blur-xl bg-blue-400 opacity-50"></div>
                </div>
                Bugünün Görevleri
              </h2>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{todayCompleted}</p>
                <p className="text-white/60 text-sm">/ {todayTodos.length}</p>
              </div>
            </div>

            <div className="relative w-full bg-white/10 rounded-full h-4 mb-6 overflow-hidden shadow-inner">
              <div
                className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 animate-gradient"
                style={{ width: `${todayProgress}%`, transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold drop-shadow-lg">{Math.round(todayProgress)}%</span>
              </div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {todayTodos.length === 0 ? (
                <div className="text-center py-16">
                  <Sparkles className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/50 text-lg">Bugün için görev eklenmemiş</p>
                </div>
              ) : (
                todayTodos.map((todo, idx) => <TodoItem key={todo.id} todo={todo} index={idx} />)
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="fixed bottom-8 right-8 w-20 h-20 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-pink-500/50 transition-all duration-500 hover:scale-110 active:scale-95 group z-50"
          style={{ animation: 'float 3s ease-in-out infinite' }}
        >
          <Plus className={`w-10 h-10 text-white transition-all duration-500 ${showForm ? 'rotate-[135deg]' : 'group-hover:rotate-90'}`} />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
        </button>

        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-6" onClick={() => setShowForm(false)} style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div
              className="backdrop-blur-2xl bg-gradient-to-br from-white/20 to-white/10 rounded-[2rem] p-10 border border-white/30 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{ animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white">Yeni Görev</h3>
              </div>

              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                placeholder="Görev açıklaması yazın..."
                className="w-full bg-white/10 border-2 border-white/30 focus:border-purple-400 rounded-2xl px-6 py-4 text-white text-lg placeholder-white/50 focus:outline-none transition-all duration-300 mb-6 backdrop-blur-xl"
                autoFocus
              />

              <div className="mb-6">
                <label className="text-white/90 text-sm font-semibold mb-3 block uppercase tracking-wider">Öncelik Seviyesi</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`py-4 rounded-2xl font-bold transition-all duration-300 ${
                        priority === p
                          ? `bg-gradient-to-r ${priorityColors[p].bg} text-white shadow-2xl ${priorityColors[p].glow} scale-105 border-2 border-white/50`
                          : 'bg-white/10 text-white/60 hover:bg-white/20 border-2 border-white/20'
                      }`}
                    >
                      {priorityLabels[p]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isDaily}
                    onChange={(e) => setIsDaily(e.target.checked)}
                    className="w-6 h-6 rounded-lg border-2 border-white/30 bg-white/10 checked:bg-gradient-to-r checked:from-purple-500 checked:to-pink-500 transition-all duration-300 cursor-pointer"
                  />
                  <span className="text-white/90 text-base font-semibold group-hover:text-white transition-colors">Günlük Rutin</span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all duration-300 border-2 border-white/20"
                >
                  İptal
                </button>
                <button
                  onClick={addTodo}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 hover:from-pink-600 hover:via-purple-700 hover:to-blue-700 text-white font-bold transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoApp;
