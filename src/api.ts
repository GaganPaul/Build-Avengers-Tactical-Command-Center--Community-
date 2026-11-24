export type ApiHealth = {
  status: string;
  supabase_configured: boolean;
  gemini_configured: boolean;
  model: string;
};

export type ApiHero = {
  id: string;
  name: string;
  real_name: string;
  powers: string[];
  strength: number;
  intelligence: number;
  combat: number;
  status: "Available" | "Assigned";
};

export type ApiMission = {
  id: string;
  name: string;
  villain: string;
  location: string;
  threat_level: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed";
  teams: {
    id: string;
    team_name: string;
    heroes: { id: string; name: string }[];
  }[];
};

export type JarvisContext = {
  heroes: { name: string; real_name: string; status: "Available" | "Assigned" }[];
  missions: {
    name: string;
    villain: string;
    location: string;
    threat_level: string;
    status: "Pending" | "In Progress" | "Completed";
  }[];
  selected_mission: string | null;
  selected_adversary: string | null;
  battle_summary: string | null;
};

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new Error("Cannot reach the Avengers backend. Check that the API service is running.");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const detail =
      typeof body === "object" &&
      body !== null &&
      "detail" in body &&
      typeof body.detail === "string"
        ? body.detail
        : `The request failed (${response.status}).`;
    throw new Error(detail);
  }

  if (body === null) {
    throw new Error("The Avengers backend returned an empty response.");
  }
  return body as T;
}
