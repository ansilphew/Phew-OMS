import axios from "axios";

// Intercept console.error in development to avoid showing the red error overlay for expected 401 Unauthorized / session check responses.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args) => {
    const msg = args.map((arg) => (arg && arg.message) || String(arg)).join(" ");
    if (
      msg.includes("401") ||
      msg.includes("Unauthorized") ||
      msg.includes("login") ||
      msg.includes("token") ||
      msg.includes("session") ||
      msg.includes("log in")
    ) {
      console.warn("[Session Handled]", ...args);
      return;
    }
    originalError(...args);
  };
}

const axiosInstance = axios.create({
  baseURL: "https://phew-oms-backend.onrender.com/api",  
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
 