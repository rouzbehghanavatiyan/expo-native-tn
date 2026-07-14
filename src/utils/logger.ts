type LogLevel = "debug" | "info" | "warn" | "error";

const isDev = __DEV__;

const getTime = () => {
  return new Date().toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatTitle = (level: LogLevel, message: string) => {
  const icons: Record<LogLevel, string> = {
    debug: "🐛",
    info: "ℹ️",
    warn: "⚠️",
    error: "❌",
  };

  return `${icons[level]} [${level.toUpperCase()}] [${getTime()}] ${message}`;
};

export const logger = {
  debug: (message: string, data?: unknown) => {
    if (!isDev) return;

    console.log(formatTitle("debug", message));

    if (data !== undefined) {
      console.log(JSON.stringify(data, null, 2));
    }
  },

  info: (message: string, data?: unknown) => {
    if (!isDev) return;

    console.info(formatTitle("info", message));

    if (data !== undefined) {
      console.log(JSON.stringify(data, null, 2));
    }
  },

  warn: (message: string, data?: unknown) => {
    if (!isDev) return;

    console.warn(formatTitle("warn", message));

    if (data !== undefined) {
      console.log(JSON.stringify(data, null, 2));
    }
  },

  error: (message: string, error?: unknown) => {
    if (!isDev) return;

    console.error(formatTitle("error", message));

    if (error instanceof Error) {
      console.error({
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    } else if (error !== undefined) {
      console.error(JSON.stringify(error, null, 2));
    }
  },
};
