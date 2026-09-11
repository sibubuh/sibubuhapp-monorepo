import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="relative flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card text-foreground transition-colors hover:border-foreground/20 hover:bg-accent"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        key={isDark ? "moon" : "sun"}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {isDark ? <Moon size={16} /> : <Sun size={16} />}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
