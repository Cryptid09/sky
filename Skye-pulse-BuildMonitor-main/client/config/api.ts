// API Configuration
export const API_CONFIG = {
  // Backend API URL - change this to match your backend
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
      VERIFY: "/auth/verify",
    },
    REPORTS: {
      LIST: "/reports",
      CREATE: "/reports",
      GET: (id: string) => `/reports/${id}`,
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
  },
  
  // Request timeout (in milliseconds)
  TIMEOUT: 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
};

// Export for use in other files
export default API_CONFIG; 