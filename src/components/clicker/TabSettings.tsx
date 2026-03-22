import Icon from "@/components/ui/icon";
import { SAVE_KEY, INITIAL_MULTIPLIERS, INITIAL_ACHIEVEMENTS, type Multiplier, type Achievement } from "./types";

interface TabSettingsProps {
  soundOn: boolean;
  vibrationOn: boolean;
  autoClickOn: boolean;
  setSoundOn: (v: boolean) => void;
  setVibrationOn: (v: boolean) => void;
  setAutoClickOn: (v: boolean) => void;
  onReset: () => void;
}

export default function TabSettings({
  soundOn, vibrationOn, autoClickOn,
  setSoundOn, setVibrationOn, setAutoClickOn,
  onReset,
}: TabSettingsProps) {
  return (
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
          onClick={onReset}
        >
          <Icon name="RotateCcw" size={18} />
          <span className="font-medium">Сбросить прогресс</span>
        </button>
      </div>

      <div className="glass-card rounded-2xl p-4 text-center">
        <div className="font-orbitron text-xs text-white/20 tracking-wider">CASH CLICKER v1.0</div>
        <div className="text-green-400/60 text-xs mt-1 flex items-center justify-center gap-1">
          <Icon name="CloudCheck" size={12} />
          Прогресс сохраняется автоматически
        </div>
      </div>
    </div>
  );
}
