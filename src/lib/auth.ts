import { useEffect, useState } from "react";

export type Role = "cliente" | "auxiliar" | "conductor" | "controlador" | "administrador";

export interface AuthUser {
  name: string;
  email: string;
  role: Role;
}

const KEY = "jaysi_auth";
const REG_KEY = "jaysi_registered";

// Demo accounts — passwords are "demo" for all
export const DEMO_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  "cliente@jaysi.com":      { password: "demo", user: { name: "María López",   email: "cliente@jaysi.com",      role: "cliente" } },
  "auxiliar@jaysi.com":     { password: "demo", user: { name: "Luis Ramírez",  email: "auxiliar@jaysi.com",     role: "auxiliar" } },
  "conductor@jaysi.com":    { password: "demo", user: { name: "Carlos Mendoza",email: "conductor@jaysi.com",    role: "conductor" } },
  "controlador@jaysi.com":  { password: "demo", user: { name: "Ana Torres",    email: "controlador@jaysi.com",  role: "controlador" } },
  "administrador@jaysi.com":{ password: "demo", user: { name: "Pedro Vargas",  email: "administrador@jaysi.com",role: "administrador" } },
};

type Registered = Record<string, { password: string; user: AuthUser }>;

function readRegistered(): Registered {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(REG_KEY);
    return raw ? (JSON.parse(raw) as Registered) : {};
  } catch {
    return {};
  }
}

export function getAccount(email: string): { password: string; user: AuthUser } | undefined {
  const key = email.trim().toLowerCase();
  return DEMO_ACCOUNTS[key] ?? readRegistered()[key];
}

export function registerAccount(input: { name: string; email: string; password: string; role?: Role }):
  | { ok: true; user: AuthUser }
  | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  if (!input.name.trim() || !email || !input.password) return { ok: false, error: "Completa todos los campos." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Correo inválido." };
  if (input.password.length < 4) return { ok: false, error: "La contraseña debe tener al menos 4 caracteres." };
  if (getAccount(email)) return { ok: false, error: "Ya existe una cuenta con ese correo." };
  const user: AuthUser = { name: input.name.trim(), email, role: input.role ?? "cliente" };
  const reg = readRegistered();
  reg[email] = { password: input.password, user };
  localStorage.setItem(REG_KEY, JSON.stringify(reg));
  return { ok: true, user };
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(KEY, JSON.stringify(user));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("jaysi-auth"));
}

export function roleHome(role: Role): string {
  return `/${role}`;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    setUser(getStoredUser());
    const onChange = () => setUser(getStoredUser());
    window.addEventListener("jaysi-auth", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("jaysi-auth", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return {
    user,
    login: (u: AuthUser) => storeUser(u),
    logout: () => storeUser(null),
  };
}