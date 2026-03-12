import { API_BASE_URL } from "@/shared/config/api";
import type { ApiProblemDetails } from "@/shared/types/auth";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type HttpOptions = {
  method?: HttpMethod;
  body?: BodyInit | null;
  headers?: HeadersInit;
  accessToken?: string | null;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  status: number;
  details: ApiProblemDetails | null;

  constructor(message: string, status: number, details: ApiProblemDetails | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function isJsonResponse(contentType: string | null): boolean {
  return contentType?.toLowerCase().includes("application/json") ?? false;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type");

  if (isJsonResponse(contentType)) {
    return response.json();
  }

  const text = await response.text();
  return text || undefined;
}

function getErrorMessage(payload: unknown, fallbackStatus: number): string {
  if (typeof payload === "string" && payload.trim()) {
    if (payload.trim() === "Identity or password is invalid.") {
      return "Identitas atau password tidak valid.";
    }

    if (payload.trim() === "Identity and password are required.") {
      return "Identitas dan password wajib diisi.";
    }

    return payload;
  }

  if (payload && typeof payload === "object") {
    const details = payload as ApiProblemDetails;

    if (typeof details.detail === "string" && details.detail.trim()) {
      if (details.detail === "Identity or password is invalid.") {
        return "Identitas atau password tidak valid.";
      }

      if (details.detail === "Identity and password are required.") {
        return "Identitas dan password wajib diisi.";
      }

      return details.detail;
    }

    if (typeof details.title === "string" && details.title.trim()) {
      return details.title;
    }
  }

  return fallbackStatus >= 500
    ? "Terjadi kesalahan pada server."
    : "Permintaan gagal diproses.";
}

export async function http<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      method: options.method ?? "GET",
      headers,
      body: options.body ?? null,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(
        "Backend tidak dapat dijangkau. Pastikan API berjalan di URL yang benar.",
        0,
        null
      );
    }

    throw error;
  }

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    const details = payload && typeof payload === "object"
      ? (payload as ApiProblemDetails)
      : null;

    throw new ApiError(
      getErrorMessage(payload, response.status),
      response.status,
      details
    );
  }

  return payload as T;
}
