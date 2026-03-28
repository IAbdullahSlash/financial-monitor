const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  headers?: Record<string, string>;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let detail = "Request failed";
    try {
      const payload = await response.json();
      detail = payload?.detail || payload?.message || detail;
    } catch {
      detail = await response.text();
    }
    throw new Error(detail || "Request failed");
  }

  return response.json() as Promise<T>;
}

export const financeApi = {
  firePlan: <T>(payload: unknown) => request<T>("/api/v1/fire/plan", { method: "POST", body: payload }),
  healthScore: <T>(payload: unknown) => request<T>("/api/v1/health-score/score", { method: "POST", body: payload }),
  lifeAdvice: <T>(payload: unknown) => request<T>("/api/v1/life-events/advise", { method: "POST", body: payload }),
  taxOptimize: <T>(payload: unknown) => request<T>("/api/v1/tax/optimize", { method: "POST", body: payload }),
  couplesPlan: <T>(payload: unknown) => request<T>("/api/v1/couples/plan", { method: "POST", body: payload }),
  portfolioXRay: <T>(payload: unknown) => request<T>("/api/v1/portfolio/xray", { method: "POST", body: payload }),
  portfolioNav: <T>(schemeCode: number) => request<T>(`/api/v1/portfolio/nav/${schemeCode}`),
  marketQuote: <T>(symbol: string) => request<T>(`/api/v1/portfolio/market/quote/${encodeURIComponent(symbol)}`),
  marketDaily: <T>(symbol: string, compact = true) =>
    request<T>(`/api/v1/portfolio/market/daily/${encodeURIComponent(symbol)}?compact=${compact}`),
};

export async function uploadPortfolioStatement(file: File) {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/v1/portfolio/upload-statement`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    let detail = "Upload failed";
    try {
      const payload = await response.json();
      detail = payload?.detail || payload?.message || detail;
    } catch {
      detail = await response.text();
    }
    throw new Error(detail || "Upload failed");
  }

  return response.json();
}
