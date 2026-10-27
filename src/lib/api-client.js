/**
 * Thin fetch wrapper used by every client feature.
 * Normalises errors into `ApiError` so UI code can show a single, friendly message.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, code = "unknown" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function request(path, { method = "GET", body, signal } = {}) {
  let response;
  try {
    response = await fetch(path, {
      method,
      signal,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError("You appear to be offline. Check your connection and try again.", {
      code: "network",
    });
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(data?.error?.message ?? "Something went wrong. Please try again.", {
      status: response.status,
      code: data?.error?.code ?? "server",
    });
  }
  return data;
}

export const api = {
  listGenerations: ({ cursor, limit, type } = {}, options) => {
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (limit) params.set("limit", String(limit));
    if (type && type !== "all") params.set("type", type);
    const query = params.toString();
    return request(`/api/generations${query ? `?${query}` : ""}`, options);
  },
  createGeneration: (payload, options) =>
    request("/api/generations", { method: "POST", body: payload, ...options }),
  getGallery: (options) => request("/api/gallery", options),
  getProject: (projectId, options) => request(`/api/studio/projects/${projectId}`, options),
  createTakes: (projectId, payload, options) =>
    request(`/api/studio/projects/${projectId}/takes`, { method: "POST", body: payload, ...options }),
};
