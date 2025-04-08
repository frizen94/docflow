import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { InsertUser } from "@shared/schema";

// Função para gerar um hash seguro da senha
const scryptAsync = promisify(crypto.scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function verifyPassword(storedPassword: string, suppliedPassword: string): Promise<boolean> {
  const [hashedPassword, salt] = storedPassword.split(".");
  const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
  const suppliedHashedPassword = buf.toString("hex");
  return hashedPassword === suppliedHashedPassword;
}

// Middleware para verificar se o usuário é administrador
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && (req.user as any).role === "Administrator") {
    return next();
  }
  res.status(403).json({ error: "Acesso não autorizado" });
}

// Middleware para verificar se o usuário está autenticado
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Não autenticado" });
}

// Função para verificar se existem usuários administradores
export async function hasAdminUser(): Promise<boolean> {
  const users = await storage.listUsers();
  return users.some(user => user.role === "Administrator");
}

// Função para criar um usuário administrador
export async function createAdminUser(adminData: InsertUser): Promise<void> {
  const hashedPassword = await hashPassword(adminData.password);
  
  await storage.createUser({
    ...adminData,
    password: hashedPassword,
    role: "Administrator",
    status: true
  });
}

// Função para criar um usuário padrão
export async function createUser(userData: InsertUser): Promise<void> {
  const hashedPassword = await hashPassword(userData.password);
  
  await storage.createUser({
    ...userData,
    password: hashedPassword,
    status: true
  });
}