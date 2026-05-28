/**
 * Frontend API Client
 * Wraps native fetch to interact with the Express Backend
 */

export const API_BASE_URL =
  import.meta.env?.VITE_API_URL ??
  process.env?.VITE_API_URL ??
  "http://localhost:5000/api/v1";

interface RequestOptions extends RequestInit {
  data?: any;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { data, headers: customHeaders, ...customConfig } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    method: "GET",
    credentials: "include", // Important for sending/receiving secure cookies
    ...customConfig,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      ...customHeaders,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  // Note: Since cookies are HttpOnly, we don't manually attach Bearer tokens.
  // The browser attaches them automatically via `credentials: "include"`.

  let responseData;
  try {
    responseData = await response.json();
  } catch {
    responseData = null;
  }

  if (response.ok) {
    const data = responseData?.data !== undefined ? responseData.data : responseData;
    if (data && typeof data === "object") {
      if (!("data" in data)) {
        Object.defineProperty(data, "data", {
          value: data,
          writable: true,
          configurable: true,
          enumerable: false,
        });
      }
    }
    return data;
  }

  if (response.status === 401) {
    // Optionally trigger a global event here if not handled by interceptors
    // e.g., window.dispatchEvent(new Event('unauthorized'));
  }

  throw new ApiError(
    responseData?.message || `API Error: ${response.statusText}`,
    response.status,
    responseData
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Types (Previously in supabaseClient.ts)
// ─────────────────────────────────────────────────────────────────────────────

export type AppRole = "admin" | "teacher" | "student" | "parent" | "super_admin";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  avatar_url?: string | null;
  subtitle?: string | null;
  created_at: string;
}

export const APP_ROLES: AppRole[] = ["super_admin", "admin", "teacher", "parent", "student"];

export function isAppRole(value: string): value is AppRole {
  return (APP_ROLES as string[]).includes(value);
}
