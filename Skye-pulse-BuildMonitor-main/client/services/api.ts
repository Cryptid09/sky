import API_CONFIG from "../config/api";

export type LoginRequest = {
  email: string;
  password: string;
  role?: "admin" | "citizen";
};

export type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: any,
  opts?: { withCredentials?: boolean; headers?: Record<string, string> }
): Promise<T> {
  const base = API_CONFIG.BASE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${p}`;

  const headers: Record<string, string> = {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...(opts?.headers || {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: opts?.withCredentials ? "include" : "omit",
  });

  // read raw text first
  const text = await res.text();
  const contentType = res.headers.get("content-type") || "";

  // attempt JSON parse only when response is JSON, otherwise keep text
  let data: any = null;
  if (text) {
    if (contentType.includes("application/json")) {
      try {
        data = JSON.parse(text);
      } catch (err) {
        // malformed JSON — fallback to raw text
        data = text;
      }
    } else {
      data = text;
    }
  }

  if (!res.ok) {
    // prefer structured message fields, otherwise use raw text or statusText
    const msg =
      (data && (data.message || data.error)) || (typeof data === "string" ? data : null) || res.statusText;
    throw new Error(msg?.toString() || `Request failed: ${res.status}`);
  }

  return data as T;
}

// Authentication API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return request<LoginResponse>(
      "POST",
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials,
      { withCredentials: false }
    );
  },

  logout: async (): Promise<void> => {
    await request<void>("POST", API_CONFIG.ENDPOINTS.AUTH.LOGOUT, undefined, {
      withCredentials: true,
    });
  },

  verifyToken: async (): Promise<boolean> => {
    try {
      await request<any>("GET", API_CONFIG.ENDPOINTS.AUTH.VERIFY, undefined, {
        withCredentials: true,
      });
      return true;
    } catch {
      return false;
    }
  },
};

// Reports API
export const reportsAPI = {
  getReports: async (): Promise<any[]> => {
    return request<any[]>("GET", API_CONFIG.ENDPOINTS.REPORTS.LIST);
  },

  getReport: async (id: string): Promise<any> => {
    return request<any>("GET", API_CONFIG.ENDPOINTS.REPORTS.GET(id));
  },

  createReport: async (report: any): Promise<any> => {
    return request<any>("POST", API_CONFIG.ENDPOINTS.REPORTS.CREATE, report);
  },

  updateReportStatus: async (
    id: string,
    status: "approved" | "rejected"
  ): Promise<any> => {
    return request<any>("PATCH", API_CONFIG.ENDPOINTS.REPORTS.UPDATE_STATUS(id), {
      status,
    });
  },

  deleteReport: async (id: string): Promise<void> => {
    await request<void>("DELETE", API_CONFIG.ENDPOINTS.REPORTS.DELETE(id));
  },
};

// Encroachments API
export const encroachmentAPI = {
  getEncroachments: async (): Promise<any[]> => {
    return request<any[]>("GET", API_CONFIG.ENDPOINTS.ENCROACHMENTS.LIST);
  },

  getEncroachment: async (id: string): Promise<any> => {
    return request<any>("GET", API_CONFIG.ENDPOINTS.ENCROACHMENTS.GET(id));
  },

  updateEncroachmentStatus: async (
    id: string,
    status: string
  ): Promise<any> => {
    return request<any>("PATCH", API_CONFIG.ENDPOINTS.ENCROACHMENTS.UPDATE_STATUS(id), {
      status,
    });
  },

  getEncroachmentsByArea: async (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<any[]> => {
    const query = new URLSearchParams({
      north: String(bounds.north),
      south: String(bounds.south),
      east: String(bounds.east),
      west: String(bounds.west),
    }).toString();
    return request<any[]>("GET", `${API_CONFIG.ENDPOINTS.ENCROACHMENTS.BY_AREA}?${query}`);
  },
};

// Alerts API (added)
export const alertsAPI = {
  getAlerts: async (): Promise<any[]> => {
    return request<any[]>("GET", API_CONFIG.ENDPOINTS.ALERTS.LIST);
  },

  markAlertRead: async (id: string): Promise<any> => {
    return request<any>("PATCH", API_CONFIG.ENDPOINTS.ALERTS.MARK_READ(id));
  },

  markAllRead: async (): Promise<void> => {
    await request<void>("PATCH", API_CONFIG.ENDPOINTS.ALERTS.MARK_ALL_READ);
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await request<{ count: number }>("GET", API_CONFIG.ENDPOINTS.ALERTS.UNREAD_COUNT);
    return res?.count ?? 0;
  },
};

// Analytics API (added)
export const analyticsAPI = {
  getDashboardStats: async (): Promise<any> => {
    return request<any>("GET", API_CONFIG.ENDPOINTS.ANALYTICS.DASHBOARD);
  },

  getReportsOverTime: async (): Promise<any> => {
    return request<any>("GET", API_CONFIG.ENDPOINTS.ANALYTICS.REPORTS_TIMELINE);
  },

  getEncroachmentsByRegion: async (): Promise<any> => {
    return request<any>("GET", API_CONFIG.ENDPOINTS.ANALYTICS.ENCROACHMENTS_REGIONS);
  },
};
