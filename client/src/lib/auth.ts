import { apiRequest } from "./queryClient";
import { User } from "@shared/schema";

export type AuthUser = User | null;

export async function login(username: string, password: string): Promise<User> {
  const response = await apiRequest("POST", "/api/login", { username, password });
  return await response.json();
}

export async function logout(): Promise<void> {
  await apiRequest("GET", "/api/logout");
}

export async function getSession(): Promise<User | null> {
  try {
    const response = await fetch("/api/session", {
      credentials: "include",
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error("Failed to get session");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
}

export function isAdmin(user: User | null): boolean {
  return user?.role === "Administrator";
}

export function isSecretary(user: User | null): boolean {
  return user?.role === "Secretary (a)";
}
