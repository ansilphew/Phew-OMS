const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

let cachedUserPromise = null;

export function clearUserCache() {
  cachedUserPromise = null;
}

export async function registerUser(payload) {
  clearUserCache();
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  clearUserCache();
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser() {
  if (!cachedUserPromise) {
    cachedUserPromise = apiRequest("/auth/me", {
      method: "GET",
    }).catch((err) => {
      cachedUserPromise = null;
      throw err;
    });
  }
  return cachedUserPromise;
}

export async function logoutUser() {
  clearUserCache();
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}

export async function updateUserProfile(payload) {
  clearUserCache();
  return apiRequest("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export async function getLeads(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/leads${query ? `?${query}` : ""}`, { method: "GET" });
}

export async function createLead(payload) {
  return apiRequest("/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getLead(id) {
  return apiRequest(`/leads/${id}`, { method: "GET" });
}

export async function updateLead(id, payload) {
  return apiRequest(`/leads/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteLead(id) {
  return apiRequest(`/leads/${id}`, { method: "DELETE" });
}

