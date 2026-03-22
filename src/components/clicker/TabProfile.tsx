import Icon from "@/components/ui/icon";
import { fmt, type Achievement, type Multiplier } from "./types";

interface TabProfileProps {
  username: string;
  editingName: boolean;
  nameInput: string;
  clicks: number;
  totalScore: number;
  clickPower: number;
  multipliers: Multiplier[];
  achievements: Achievement[];
  onEditStart: () => void;
  onNameChange: (val: string) => void;
  onNameSave: () => void;
}

export default function TabProfile({
  username, editingName, nameInput,
  clicks, totalScore, clickPower,
  multipliers, achievements,
  onEditStart, onNameChange, onNameSave,
}: TabProfileProps) {
  const rank = totalScore >= 100000 ? "Повелитель Галактики" :
    totalScore >= 10000 ? "Звёздный Капитан" :
    totalScore >= 1000 ? "Пилот" :
    totalScore >= 100 ? "Стажёр" : "Новобранец";
  const rankEmoji = totalScore >= 100000 ? "👑" : totalScore >= 10000 ? "🌟" : totalScore >= 1000 ? "🚀" : totalScore >= 100 ? "🛸" : "🪐";
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const purchasedMults = multipliers.filter(m => m.purchased).length;

  return (
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
              onChange={e => onNameChange(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <button
              className="bg-cyan-500/20 border border-cyan-500/40 rounded-lg px-3 py-1 text-cyan-400 text-sm"
              onClick={onNameSave}
            >✓</button>
          </div>
        ) : (
          <button className="flex items-center gap-2 group" onClick={onEditStart}>
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
  );
}
