import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/ui/icon";
import {
  type Tab, type Multiplier, type Achievement, type Particle,
  SAVE_KEY, STARS, INITIAL_MULTIPLIERS, INITIAL_ACHIEVEMENTS,
  loadSave, mergeSavedMultipliers, mergeSavedAchievements,
} from "@/components/clicker/types";
import TabClicker from "@/components/clicker/TabClicker";
import TabAchievements from "@/components/clicker/TabAchievements";
import TabProfile from "@/components/clicker/TabProfile";
import TabSettings from "@/components/clicker/TabSettings";
import { fmt } from "@/components/clicker/types";

export default function Index() {
  const saved = loadSave();

  const [tab, setTab] = useState<Tab>("clicker");
  const [score, setScore] = useState<number>(saved?.score ?? 0);
  const [totalScore, setTotalScore] = useState<number>(saved?.totalScore ?? 0);
  const [clicks, setClicks] = useState<number>(saved?.clicks ?? 0);
  const [multipliers, setMultipliers] = useState<Multiplier[]>(
    saved?.multipliers ? mergeSavedMultipliers(saved.multipliers) : INITIAL_MULTIPLIERS
  );
  const [achievements, setAchievements] = useState<Achievement[]>(
    saved?.achievements ? mergeSavedAchievements(saved.achievements) : INITIAL_ACHIEVEMENTS
  );
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isClicking, setIsClicking] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  const [username, setUsername] = useState<string>(saved?.username ?? "Космонавт");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState<string>(saved?.username ?? "Космонавт");
  const [soundOn, setSoundOn] = useState<boolean>(saved?.soundOn ?? true);
  const [vibrationOn, setVibrationOn] = useState<boolean>(saved?.vibrationOn ?? true);
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

  // ── Autosave ──────────────────────────────────────────────
  useEffect(() => {
    const data = {
      score, totalScore, clicks, username, soundOn, vibrationOn,
      multipliers: multipliers.map(m => ({ id: m.id, purchased: m.purchased, level: m.level })),
      achievements: achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }, [score, totalScore, clicks, multipliers, achievements, username, soundOn, vibrationOn]);

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

  // ── Reset ─────────────────────────────────────────────────
  const handleReset = () => {
    if (confirm("Сбросить весь прогресс?")) {
      localStorage.removeItem(SAVE_KEY);
      setScore(0); setTotalScore(0); setClicks(0);
      setMultipliers(INITIAL_MULTIPLIERS);
      setAchievements(INITIAL_ACHIEVEMENTS);
      setUsername("Космонавт"); setNameInput("Космонавт");
    }
  };

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

          {tab === "clicker" && (
            <TabClicker
              score={score}
              clicks={clicks}
              totalScore={totalScore}
              clickPower={clickPower}
              isClicking={isClicking}
              multipliers={multipliers}
              particles={particles}
              onCoinClick={handleClick}
              onBuyMultiplier={buyMultiplier}
            />
          )}

          {tab === "achievements" && (
            <TabAchievements achievements={achievements} />
          )}

          {tab === "profile" && (
            <TabProfile
              username={username}
              editingName={editingName}
              nameInput={nameInput}
              clicks={clicks}
              totalScore={totalScore}
              clickPower={clickPower}
              multipliers={multipliers}
              achievements={achievements}
              onEditStart={() => { setNameInput(username); setEditingName(true); }}
              onNameChange={setNameInput}
              onNameSave={() => { setUsername(nameInput); setEditingName(false); }}
            />
          )}

          {tab === "settings" && (
            <TabSettings
              soundOn={soundOn}
              vibrationOn={vibrationOn}
              autoClickOn={autoClickOn}
              setSoundOn={setSoundOn}
              setVibrationOn={setVibrationOn}
              setAutoClickOn={setAutoClickOn}
              onReset={handleReset}
            />
          )}

        </div>
      </main>
    </div>
  );
}
