// API Configuration
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    VERIFY: "/auth/verify",
  },
  REPORTS: {
    LIST: "/reports",
    GET: (id: string) => `/reports/${id}`,
    CREATE: "/reports",
    UPDATE_STATUS: (id: string) => `/reports/${id}/status`,
    DELETE: (id: string) => `/reports/${id}`,
  },
  ENCROACHMENTS: {
    LIST: "/encroachments",
    GET: (id: string) => `/encroachments/${id}`,
    UPDATE_STATUS: (id: string) => `/encroachments/${id}/status`,
    BY_AREA: "/encroachments/area",
  },
  ALERTS: {
    LIST: "/alerts",
    MARK_READ: (id: string) => `/alerts/${id}/read`,
    MARK_ALL_READ: "/alerts/read-all",
    UNREAD_COUNT: "/alerts/unread-count",
  },
  ANALYTICS: {
    DASHBOARD: "/analytics/dashboard",
    REPORTS_TIMELINE: "/analytics/reports/timeline",
    ENCROACHMENTS_REGIONS: "/analytics/encroachments/regions",
  },
};

// Export for use in other files
export default {
  BASE_URL,
  DEFAULT_HEADERS,
  ENDPOINTS,
};