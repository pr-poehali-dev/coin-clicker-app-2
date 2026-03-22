import Icon from "@/components/ui/icon";
import { type Achievement } from "./types";

interface TabAchievementsProps {
  achievements: Achievement[];
}

export default function TabAchievements({ achievements }: TabAchievementsProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
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
  );
}
