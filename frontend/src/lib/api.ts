const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

type RequestOptions = {
  method?: string;
  body?: unknown;
};

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // JWT support (nếu có)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = "Request failed";
    try {
      const error = await res.json();
      message = error.message ?? message;
    } catch {}
    throw new Error(message);
  }

  if (res.status === 204) return null as T;

  return res.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "POST", body }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PUT", body }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
