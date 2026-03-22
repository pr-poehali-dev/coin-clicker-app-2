import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ───────────────────────────────────────────────
type Tab = "clicker" | "achievements" | "profile" | "settings";

interface Multiplier {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  cost: number;
  multiplier: number;
  purchased: boolean;
  level: number;
  maxLevel: number;
}

interface Achievement {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  target: number;
  unlocked: boolean;
  type: "clicks" | "score" | "multiplier";
}

interface Particle {
  id: number;
  x: number;
  y: number;
  value: number;
}

// ─── Stars background ────────────────────────────────────
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  duration: Math.random() * 4 + 2,
  delay: Math.random() * 5,
}));

// ─── Initial data ─────────────────────────────────────────
const INITIAL_MULTIPLIERS: Multiplier[] = [
  { id: "m1", name: "Ракетный двигатель", desc: "+2 за клик", emoji: "🚀", cost: 50, multiplier: 2, purchased: false, level: 0, maxLevel: 5 },
  { id: "m2", name: "Квантовый реактор", desc: "+5 за клик", emoji: "⚛️", cost: 200, multiplier: 5, purchased: false, level: 0, maxLevel: 5 },
  { id: "m3", name: "Звёздный коллайдер", desc: "+15 за клик", emoji: "💫", cost: 700, multiplier: 15, purchased: false, level: 0, maxLevel: 3 },
  { id: "m4", name: "Тёмная материя", desc: "+50 за клик", emoji: "🌑", cost: 2500, multiplier: 50, purchased: false, level: 0, maxLevel: 3 },
  { id: "m5", name: "Сингулярность", desc: "+200 за клик", emoji: "🌌", cost: 10000, multiplier: 200, purchased: false, level: 0, maxLevel: 2 },
  { id: "m6", name: "Большой Взрыв", desc: "+1000 за клик", emoji: "💥", cost: 50000, multiplier: 1000, purchased: false, level: 0, maxLevel: 1 },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: "a1", name: "Первый контакт", desc: "Сделай 10 кликов", emoji: "👆", target: 10, unlocked: false, type: "clicks" },
  { id: "a2", name: "Звёздный путь", desc: "Сделай 100 кликов", emoji: "⭐", target: 100, unlocked: false, type: "clicks" },
  { id: "a3", name: "Космонавт", desc: "Сделай 500 кликов", emoji: "👨‍🚀", target: 500, unlocked: false, type: "clicks" },
  { id: "a4", name: "Астронавт", desc: "Сделай 2000 кликов", emoji: "🧑‍🚀", target: 2000, unlocked: false, type: "clicks" },
  { id: "a5", name: "Первые монеты", desc: "Набери 100 очков", emoji: "💰", target: 100, unlocked: false, type: "score" },
  { id: "a6", name: "Тысячник", desc: "Набери 1 000 очков", emoji: "💎", target: 1000, unlocked: false, type: "score" },
  { id: "a7", name: "Миллионер", desc: "Набери 100 000 очков", emoji: "🏆", target: 100000, unlocked: false, type: "score" },
  { id: "a8", name: "Первое улучшение", desc: "Купи множитель", emoji: "🔧", target: 1, unlocked: false, type: "multiplier" },
];

// ─── Format number ────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return Math.floor(n).toString();
}

// ─── Component ────────────────────────────────────────────
export default function Index() {
  const [tab, setTab] = useState<Tab>("clicker");
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [multipliers, setMultipliers] = useState<Multiplier[]>(INITIAL_MULTIPLIERS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isClicking, setIsClicking] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  const [username, setUsername] = useState("Космонавт");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("Космонавт");
  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);
  const [autoClickOn, setAutoClickOn] = useState(false);
  const particleId = useRef(0);
  const autoClickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clickPower = multipliers.reduce((sum, m) => sum + (m.purchased ? m.multiplier * m.level : 0), 1);

  // ── Check achievements ──────────────────────────────────
  const checkAchievements = useCallback((newClicks: number, newTotal: number, purchasedCount: number) => {
    setAchievements(prev => {
      let triggered: string | null = null;
      const updated = prev.map(a => {
        if (a.unlocked) return a;
        let met = false;
        if (a.type === "clicks") met = newClicks >= a.target;
        if (a.type === "score") met = newTotal >= a.target;
        if (a.type === "multiplier") met = purchasedCount >= a.target;
        if (met && !triggered) triggered = a.name;
        return met ? { ...a, unlocked: true } : a;
      });
      if (triggered) setNewAchievement(triggered);
      return updated;
    });
  }, []);

  // ── Handle click ──────────────────────────────────────────
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    let cx: number, cy: number;
    if ("touches" in e) {
      cx = e.touches[0].clientX;
      cy = e.touches[0].clientY;
    } else {
      cx = (e as React.MouseEvent).clientX;
      cy = (e as React.MouseEvent).clientY;
    }

    const gained = clickPower;
    setScore(s => s + gained);
    setTotalScore(t => t + gained);
    setClicks(c => c + 1);
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 150);

    const pid = ++particleId.current;
    setParticles(p => [...p, { id: pid, x: cx, y: cy, value: gained }]);
    setTimeout(() => setParticles(p => p.filter(pt => pt.id !== pid)), 800);

    if (vibrationOn && navigator.vibrate) navigator.vibrate(20);
  }, [clickPower, vibrationOn]);

  // Check achievements on state change
  useEffect(() => {
    const purchasedCount = multipliers.filter(m => m.purchased).length;
    checkAchievements(clicks, totalScore, purchasedCount);
  }, [clicks, totalScore, multipliers, checkAchievements]);

  // Clear achievement toast
  useEffect(() => {
    if (newAchievement) {
      const t = setTimeout(() => setNewAchievement(null), 3000);
      return () => clearTimeout(t);
    }
  }, [newAchievement]);

  // Auto-click
  useEffect(() => {
    if (autoClickOn) {
      autoClickRef.current = setInterval(() => {
        setScore(s => s + clickPower);
        setTotalScore(t => t + clickPower);
        setClicks(c => c + 1);
      }, 1000);
    } else if (autoClickRef.current) {
      clearInterval(autoClickRef.current);
    }
    return () => { if (autoClickRef.current) clearInterval(autoClickRef.current); };
  }, [autoClickOn, clickPower]);

  // ── Buy multiplier ────────────────────────────────────────
  const buyMultiplier = (id: string) => {
    setMultipliers(prev => prev.map(m => {
      if (m.id !== id) return m;
      if (m.level >= m.maxLevel) return m;
      const cost = m.cost * (m.level + 1);
      if (score < cost) return m;
      setScore(s => s - cost);
      return { ...m, purchased: true, level: m.level + 1 };
    }));
  };

  // ── Rank ────────────────────────────────────────────────
  const rank = totalScore >= 100000 ? "Повелитель Галактики" :
    totalScore >= 10000 ? "Звёздный Капитан" :
    totalScore >= 1000 ? "Пилот" :
    totalScore >= 100 ? "Стажёр" : "Новобранец";
  const rankEmoji = totalScore >= 100000 ? "👑" : totalScore >= 10000 ? "🌟" : totalScore >= 1000 ? "🚀" : totalScore >= 100 ? "🛸" : "🪐";

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const purchasedMults = multipliers.filter(m => m.purchased).length;

  return (
    <div className="galaxy-bg min-h-screen relative overflow-hidden font-exo">

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {STARS.map(s => (
          <div key={s.id} className="star" style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.size}px`, height: `${s.size}px`,
            "--duration": `${s.duration}s`, "--delay": `${s.delay}s`,
          } as React.CSSProperties} />
        ))}
      </div>

      {/* Achievement toast */}
      {newAchievement && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
          <div className="glass-card glow-border-gold rounded-2xl px-6 py-3 flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <div className="font-orbitron text-xs neon-gold">ДОСТИЖЕНИЕ!</div>
              <div className="text-white font-semibold text-sm">{newAchievement}</div>
            </div>
          </div>
        </div>
      )}

      {/* Score particles */}
      {particles.map(p => (
        <div key={p.id} className="score-particle neon-cyan" style={{
          left: p.x, top: p.y, fontSize: "18px",
        }}>+{p.value}</div>
      ))}

      {/* Header */}
      <header className="relative z-10 px-4 pt-4 pb-2">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-orbitron font-black text-xl neon-cyan tracking-widest">CASH</h1>
            <p className="font-orbitron text-xs text-white/40 tracking-[0.3em]">CLICKER</p>
          </div>
          <div className="glass-card glow-border-cyan rounded-xl px-4 py-2 text-right">
            <div className="font-orbitron font-bold text-2xl neon-gold">{fmt(score)}</div>
            <div className="text-white/50 text-xs">очков</div>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="relative z-10 px-4 mt-2">
        <div className="max-w-md mx-auto glass-card rounded-2xl p-1 flex gap-1">
          {([
            { id: "clicker", label: "Кликер", icon: "Zap" },
            { id: "achievements", label: "Достижения", icon: "Trophy" },
            { id: "profile", label: "Профиль", icon: "User" },
            { id: "settings", label: "Настройки", icon: "Settings" },
          ] as { id: Tab; label: string; icon: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all duration-200 text-xs font-semibold ${
                tab === t.id
                  ? "bg-cyan-500/20 text-cyan-400 shadow-lg"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <Icon name={t.icon} size={16} />
              <span className="hidden sm:block">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 px-4 pb-8 mt-4">
        <div className="max-w-md mx-auto">

          {/* ── CLICKER TAB ─── */}
          {tab === "clicker" && (
            <div className="animate-fade-in-up">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Кликов", val: fmt(clicks), icon: "MousePointerClick" },
                  { label: "За клик", val: `+${fmt(clickPower)}`, icon: "Zap" },
                  { label: "Всего", val: fmt(totalScore), icon: "TrendingUp" },
                ].map(s => (
                  <div key={s.label} className="glass-card glow-border-cyan rounded-xl p-3 text-center">
                    <Icon name={s.icon} size={14} className="mx-auto mb-1 text-cyan-400" />
                    <div className="font-orbitron font-bold text-sm text-white">{s.val}</div>
                    <div className="text-white/40 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Big coin button */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-spin-slow" style={{ margin: "-20px" }} />
                  <button
                    className={`click-btn relative w-44 h-44 rounded-full flex items-center justify-center ${isClicking ? "animate-coin-click" : "animate-pulse-glow"}`}
                    style={{
                      background: "radial-gradient(circle at 35% 35%, #ffd700, #f59e0b, #d97706, #92400e)",
                      boxShadow: "0 0 40px rgba(251,191,36,0.4), 0 0 80px rgba(251,191,36,0.15), inset 0 4px 8px rgba(255,255,255,0.3)",
                    }}
                    onMouseDown={handleClick}
                    onTouchStart={handleClick}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-5xl select-none">🪙</span>
                      <span className="font-orbitron font-black text-amber-900 text-xs mt-1 tracking-wider">TAP!</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Multipliers */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="Rocket" size={16} className="text-cyan-400" />
                  <h2 className="font-orbitron text-sm text-white/70 tracking-wider">УЛУЧШЕНИЯ</h2>
                </div>
                <div className="space-y-2">
                  {multipliers.map(m => {
                    const cost = m.cost * (m.level + 1);
                    const canBuy = score >= cost && m.level < m.maxLevel;
                    const maxed = m.level >= m.maxLevel;
                    return (
                      <button
                        key={m.id}
                        onClick={() => buyMultiplier(m.id)}
                        disabled={!canBuy && !maxed}
                        className={`multiplier-card w-full rounded-xl p-3 flex items-center gap-3 text-left ${m.purchased ? "purchased" : ""} ${maxed ? "opacity-60" : ""}`}
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm">{m.name}</div>
                          <div className="text-white/40 text-xs">{m.desc}</div>
                          {m.level > 0 && (
                            <div className="flex gap-1 mt-1">
                              {Array.from({ length: m.maxLevel }).map((_, i) => (
                                <div key={i} className={`h-1 flex-1 rounded-full ${i < m.level ? "bg-cyan-400" : "bg-white/10"}`} />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          {maxed ? (
                            <span className="text-green-400 text-xs font-orbitron">МАКС</span>
                          ) : (
                            <>
                              <div className={`font-orbitron font-bold text-sm ${canBuy ? "neon-gold" : "text-white/30"}`}>{fmt(cost)}</div>
                              <div className="text-white/30 text-xs">очков</div>
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── ACHIEVEMENTS TAB ─── */}
          {tab === "achievements" && (
            <div className="animate-fade-in-up">
              <div className="glass-card glow-border-purple rounded-2xl p-4 mb-4 flex items-center gap-4">
                <span className="text-4xl">🏆</span>
                <div>
                  <div className="font-orbitron font-bold text-white">{unlockedCount} / {achievements.length}</div>
                  <div className="text-white/50 text-sm">достижений открыто</div>
                  <div className="mt-2 bg-white/10 rounded-full h-2 w-48 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-700"
                      style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {achievements.map(a => (
                  <div
                    key={a.id}
                    className={`achievement-card rounded-xl p-4 flex items-center gap-4 border ${
                      a.unlocked ? "achievement-card unlocked border-yellow-500/30" : "achievement-card locked border-white/10"
                    }`}
                  >
                    <span className="text-3xl">{a.emoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{a.name}</div>
                      <div className="text-white/40 text-xs">{a.desc}</div>
                    </div>
                    {a.unlocked
                      ? <Icon name="CheckCircle" size={20} className="text-yellow-400 shrink-0" />
                      : <Icon name="Lock" size={18} className="text-white/20 shrink-0" />
                    }
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PROFILE TAB ─── */}
          {tab === "profile" && (
            <div className="animate-fade-in-up space-y-4">
              <div className="glass-card glow-border-cyan rounded-2xl p-6 flex flex-col items-center gap-3">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-5xl animate-float"
                  style={{
                    background: "radial-gradient(circle, rgba(0,212,255,0.2), rgba(168,85,247,0.2))",
                    border: "2px solid rgba(0,212,255,0.4)",
                    boxShadow: "0 0 30px rgba(0,212,255,0.2)",
                  }}
                >
                  {rankEmoji}
                </div>

                {editingName ? (
                  <div className="flex gap-2">
                    <input
                      className="bg-white/10 border border-cyan-500/40 rounded-lg px-3 py-1 text-white text-center font-semibold text-sm outline-none focus:border-cyan-400"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      maxLength={20}
                      autoFocus
                    />
                    <button
                      className="bg-cyan-500/20 border border-cyan-500/40 rounded-lg px-3 py-1 text-cyan-400 text-sm"
                      onClick={() => { setUsername(nameInput); setEditingName(false); }}
                    >✓</button>
                  </div>
                ) : (
                  <button
                    className="flex items-center gap-2 group"
                    onClick={() => { setNameInput(username); setEditingName(true); }}
                  >
                    <span className="font-orbitron font-bold text-xl text-white">{username}</span>
                    <Icon name="Pencil" size={14} className="text-white/30 group-hover:text-cyan-400 transition-colors" />
                  </button>
                )}
                <span className="font-orbitron text-xs neon-purple tracking-wider">{rank}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Кликов", val: fmt(clicks), emoji: "👆", color: "neon-cyan" },
                  { label: "Всего очков", val: fmt(totalScore), emoji: "💰", color: "neon-gold" },
                  { label: "За клик", val: `×${fmt(clickPower)}`, emoji: "⚡", color: "neon-purple" },
                  { label: "Улучшений", val: `${purchasedMults}/${multipliers.length}`, emoji: "🔧", color: "neon-gold" },
                ].map(s => (
                  <div key={s.label} className="glass-card glow-border-cyan rounded-xl p-4">
                    <span className="text-2xl">{s.emoji}</span>
                    <div className={`font-orbitron font-bold text-xl mt-1 ${s.color}`}>{s.val}</div>
                    <div className="text-white/40 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="glass-card glow-border-gold rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🏆</span>
                  <span className="font-orbitron text-sm text-white/70">Достижения</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {achievements.filter(a => a.unlocked).map(a => (
                    <span key={a.id} className="text-2xl" title={a.name}>{a.emoji}</span>
                  ))}
                  {unlockedCount === 0 && <span className="text-white/30 text-sm">Пока нет...</span>}
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ─── */}
          {tab === "settings" && (
            <div className="animate-fade-in-up space-y-3">
              <div className="glass-card glow-border-cyan rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5">
                  <div className="font-orbitron text-xs text-white/40 tracking-wider">ИГРА</div>
                </div>
                {[
                  { label: "Звук", icon: "Volume2", val: soundOn, set: setSoundOn },
                  { label: "Вибрация", icon: "Smartphone", val: vibrationOn, set: setVibrationOn },
                  { label: "Авто-клик (1/сек)", icon: "Zap", val: autoClickOn, set: setAutoClickOn },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between px-4 py-4 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <Icon name={s.icon} size={18} className="text-cyan-400" />
                      <span className="text-white font-medium">{s.label}</span>
                    </div>
                    <button
                      onClick={() => s.set(!s.val)}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${s.val ? "bg-cyan-500" : "bg-white/10"}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${s.val ? "right-1" : "left-1"}`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="glass-card glow-border-purple rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5">
                  <div className="font-orbitron text-xs text-white/40 tracking-wider">ПРОГРЕСС</div>
                </div>
                <button
                  className="w-full px-4 py-4 text-left flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors"
                  onClick={() => {
                    if (confirm("Сбросить весь прогресс?")) {
                      setScore(0); setTotalScore(0); setClicks(0);
                      setMultipliers(INITIAL_MULTIPLIERS);
                      setAchievements(INITIAL_ACHIEVEMENTS);
                    }
                  }}
                >
                  <Icon name="RotateCcw" size={18} />
                  <span className="font-medium">Сбросить прогресс</span>
                </button>
              </div>

              <div className="glass-card rounded-2xl p-4 text-center">
                <div className="font-orbitron text-xs text-white/20 tracking-wider">CASH CLICKER v1.0</div>
                <div className="text-white/20 text-xs mt-1">Покори галактику!</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}