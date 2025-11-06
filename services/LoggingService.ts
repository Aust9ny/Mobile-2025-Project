// In a real app, this would send logs to a server (e.g., via fetch)

interface LogData {
  userId?: string;
  email?: string;
  name?: string;
  token?: string;
  error?: any;
  [key: string]: any;
}

const logToServer = (
  level: "info" | "error",
  message: string,
  data: LogData = {}
) => {
  // In a real implementation, you would use fetch or another HTTP client
  // to send this data to your backend logging endpoint.
  console.log(`[BACKEND LOG - ${level.toUpperCase()}] ${message}`, data);
  /*
  fetch('https://your-backend.com/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      level,
      message,
      timestamp: new Date().toISOString(),
      ...data,
    }),
  });
  */
};

export const logAuthEvent = (
  level: "info" | "error",
  message: string,
  data: LogData
) => {
  logToServer(level, message, data);
};
