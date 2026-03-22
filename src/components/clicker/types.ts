export type Tab = "clicker" | "achievements" | "profile" | "settings";

export interface Multiplier {
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

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  target: number;
  unlocked: boolean;
  type: "clicks" | "score" | "multiplier";
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  value: number;
}

export const SAVE_KEY = "cash_clicker_save";

export const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  duration: Math.random() * 4 + 2,
  delay: Math.random() * 5,
}));

export const INITIAL_MULTIPLIERS: Multiplier[] = [
  { id: "m1", name: "Ракетный двигатель", desc: "+2 за клик", emoji: "🚀", cost: 50, multiplier: 2, purchased: false, level: 0, maxLevel: 5 },
  { id: "m2", name: "Квантовый реактор", desc: "+5 за клик", emoji: "⚛️", cost: 200, multiplier: 5, purchased: false, level: 0, maxLevel: 5 },
  { id: "m3", name: "Звёздный коллайдер", desc: "+15 за клик", emoji: "💫", cost: 700, multiplier: 15, purchased: false, level: 0, maxLevel: 3 },
  { id: "m4", name: "Тёмная материя", desc: "+50 за клик", emoji: "🌑", cost: 2500, multiplier: 50, purchased: false, level: 0, maxLevel: 3 },
  { id: "m5", name: "Сингулярность", desc: "+200 за клик", emoji: "🌌", cost: 10000, multiplier: 200, purchased: false, level: 0, maxLevel: 2 },
  { id: "m6", name: "Большой Взрыв", desc: "+1000 за клик", emoji: "💥", cost: 50000, multiplier: 1000, purchased: false, level: 0, maxLevel: 1 },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: "a1", name: "Первый контакт", desc: "Сделай 10 кликов", emoji: "👆", target: 10, unlocked: false, type: "clicks" },
  { id: "a2", name: "Звёздный путь", desc: "Сделай 100 кликов", emoji: "⭐", target: 100, unlocked: false, type: "clicks" },
  { id: "a3", name: "Космонавт", desc: "Сделай 500 кликов", emoji: "👨‍🚀", target: 500, unlocked: false, type: "clicks" },
  { id: "a4", name: "Астронавт", desc: "Сделай 2000 кликов", emoji: "🧑‍🚀", target: 2000, unlocked: false, type: "clicks" },
  { id: "a5", name: "Первые монеты", desc: "Набери 100 очков", emoji: "💰", target: 100, unlocked: false, type: "score" },
  { id: "a6", name: "Тысячник", desc: "Набери 1 000 очков", emoji: "💎", target: 1000, unlocked: false, type: "score" },
  { id: "a7", name: "Миллионер", desc: "Набери 100 000 очков", emoji: "🏆", target: 100000, unlocked: false, type: "score" },
  { id: "a8", name: "Первое улучшение", desc: "Купи множитель", emoji: "🔧", target: 1, unlocked: false, type: "multiplier" },
];

export function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return Math.floor(n).toString();
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function mergeSavedMultipliers(saved: Multiplier[]): Multiplier[] {
  return INITIAL_MULTIPLIERS.map(init => {
    const s = saved.find(m => m.id === init.id);
    return s ? { ...init, purchased: s.purchased, level: s.level } : init;
  });
}

export function mergeSavedAchievements(saved: Achievement[]): Achievement[] {
  return INITIAL_ACHIEVEMENTS.map(init => {
    const s = saved.find(a => a.id === init.id);
    return s ? { ...init, unlocked: s.unlocked } : init;
  });
}
