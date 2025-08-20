import axios from "axios";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// API Types
export interface LoginRequest {
  email: string;
  password: string;
  role: "admin" | "citizen";
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: "admin" | "citizen";
    name: string;
  };
}

export interface Report {
  id: string;
  citizenName: string;
  citizenEmail: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description: string;
  status: "pending" | "approved" | "rejected";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  attachments?: string[];
}

export interface CreateReportRequest {
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description: string;
  priority: "low" | "medium" | "high";
  images?: File[];
}

export interface Encroachment {
  id: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  detectedAt: string;
  confidence: number;
  status: "new" | "verified" | "resolved" | "false_positive";
  area: number; // in square meters
  satelliteImageUrl?: string;
  comparisonImageUrl?: string;
}

export interface Alert {
  id: string;
  type: "encroachment_match" | "high_priority_report" | "system_alert";
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
  isRead: boolean;
  reportId?: string;
  encroachmentId?: string;
  location?: string;
}

// Authentication API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
  },

  verifyToken: async (): Promise<boolean> => {
    try {
      await apiClient.get("/auth/verify");
      return true;
    } catch (error) {
      return false;
    }
  },
};

// Reports API
export const reportsAPI = {
  getReports: async (): Promise<Report[]> => {
    const response = await apiClient.get("/reports");
    return response.data;
  },

  getReport: async (id: string): Promise<Report> => {
    const response = await apiClient.get(`/reports/${id}`);
    return response.data;
  },

  createReport: async (report: CreateReportRequest): Promise<Report> => {
    const formData = new FormData();

    // Add text fields
    formData.append("location", report.location);
    formData.append("description", report.description);
    formData.append("priority", report.priority);

    if (report.coordinates) {
      formData.append("coordinates", JSON.stringify(report.coordinates));
    }

    // Add image files
    if (report.images) {
      report.images.forEach((image, index) => {
        formData.append(`images`, image);
      });
    }

    const response = await apiClient.post("/reports", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateReportStatus: async (
    id: string,
    status: "approved" | "rejected",
  ): Promise<Report> => {
    const response = await apiClient.patch(`/reports/${id}/status`, { status });
    return response.data;
  },

  deleteReport: async (id: string): Promise<void> => {
    await apiClient.delete(`/reports/${id}`);
  },
};

// Encroachments API
export const encroachmentAPI = {
  getEncroachments: async (): Promise<Encroachment[]> => {
    const response = await apiClient.get("/encroachments");
    return response.data;
  },

  getEncroachment: async (id: string): Promise<Encroachment> => {
    const response = await apiClient.get(`/encroachments/${id}`);
    return response.data;
  },

  updateEncroachmentStatus: async (
    id: string,
    status: Encroachment["status"],
  ): Promise<Encroachment> => {
    const response = await apiClient.patch(`/encroachments/${id}/status`, {
      status,
    });
    return response.data;
  },

  getEncroachmentsByArea: async (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<Encroachment[]> => {
    const response = await apiClient.get("/encroachments/area", {
      params: bounds,
    });
    return response.data;
  },
};

// Alerts API
export const alertsAPI = {
  getAlerts: async (): Promise<Alert[]> => {
    const response = await apiClient.get("/alerts");
    return response.data;
  },

  markAlertRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/alerts/${id}/read`);
  },

  markAllAlertsRead: async (): Promise<void> => {
    await apiClient.patch("/alerts/read-all");
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get("/alerts/unread-count");
    return response.data.count;
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: async (): Promise<{
    totalReports: number;
    pendingReports: number;
    approvedReports: number;
    rejectedReports: number;
    totalEncroachments: number;
    newEncroachments: number;
    resolvedEncroachments: number;
    alertsCount: number;
  }> => {
    const response = await apiClient.get("/analytics/dashboard");
    return response.data;
  },

  getReportsOverTime: async (
    period: "7d" | "30d" | "90d" | "1y",
  ): Promise<
    {
      date: string;
      count: number;
    }[]
  > => {
    const response = await apiClient.get(
      `/analytics/reports/timeline?period=${period}`,
    );
    return response.data;
  },

  getEncroachmentsByRegion: async (): Promise<
    {
      region: string;
      count: number;
      coordinates: { lat: number; lng: number };
    }[]
  > => {
    const response = await apiClient.get("/analytics/encroachments/regions");
    return response.data;
  },
};

// Export the configured axios instance for custom requests
export { apiClient };

// Export default instance
export default apiClient;
