import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

const THEME_STORAGE_KEY = "@app_theme";

export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  themeMode: ThemeMode;
  isDark: boolean;
  isThemeLoading: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const DEFAULT_THEME: ThemeMode = "dark";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(DEFAULT_THEME);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === "light" || saved === "dark") {
          setThemeModeState(saved);
        } else {
          await AsyncStorage.setItem(THEME_STORAGE_KEY, DEFAULT_THEME);
        }
      } catch (e) {
        console.log("Error loading theme:", e);
      } finally {
        setIsThemeLoading(false);
      }
    })();
  }, []);

  const persistTheme = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.log("Error saving theme:", e);
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    persistTheme(mode);
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark: themeMode === "dark",
        isThemeLoading,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useAppTheme باید داخل ThemeProvider استفاده بشه");
  }
  return ctx;
}
