import Icon from "@/components/ui/icon";
import { fmt, type Multiplier, type Particle } from "./types";

interface TabClickerProps {
  score: number;
  clicks: number;
  totalScore: number;
  clickPower: number;
  isClicking: boolean;
  multipliers: Multiplier[];
  particles: Particle[];
  onCoinClick: (e: React.MouseEvent | React.TouchEvent) => void;
  onBuyMultiplier: (id: string) => void;
}

export default function TabClicker({
  score, clicks, totalScore, clickPower,
  isClicking, multipliers, particles,
  onCoinClick, onBuyMultiplier,
}: TabClickerProps) {
  return (
    <div className="animate-fade-in-up">
      {/* Score particles */}
      {particles.map(p => (
        <div key={p.id} className="score-particle neon-cyan" style={{ left: p.x, top: p.y, fontSize: "18px" }}>
          +{p.value}
        </div>
      ))}

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
            onMouseDown={onCoinClick}
            onTouchStart={onCoinClick}
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
                onClick={() => onBuyMultiplier(m.id)}
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
  );
}
