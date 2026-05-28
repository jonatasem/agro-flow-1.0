import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl border border-agro-border/50 bg-[#181b26] dark:bg-[#181b26] light:bg-emerald-50 text-slate-300 dark:text-slate-300 light:text-emerald-700 hover:scale-105 transition cursor-pointer flex items-center gap-2"
      title={theme === 'dark' ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {theme === 'dark' ? (
        <>
          <Sun size={16} className="text-amber-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Modo Claro</span>
        </>
      ) : (
        <>
          <Moon size={16} className="text-emerald-600" />
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Modo Escuro</span>
        </>
      )}
    </button>
  );
}