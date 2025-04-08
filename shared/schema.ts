import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'Administrator' or 'Secretary'
  status: boolean("status").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Areas table
export const areas = pgTable("areas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  status: boolean("status").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAreaSchema = createInsertSchema(areas).omit({ id: true, createdAt: true });
export type InsertArea = z.infer<typeof insertAreaSchema>;
export type Area = typeof areas.$inferSelect;

// Document Types table
export const documentTypes = pgTable("document_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  status: boolean("status").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDocumentTypeSchema = createInsertSchema(documentTypes).omit({ id: true, createdAt: true });
export type InsertDocumentType = z.infer<typeof insertDocumentTypeSchema>;
export type DocumentType = typeof documentTypes.$inferSelect;

// Employees table
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  dni: text("dni").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  areaId: integer("area_id").notNull(),
  status: boolean("status").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true });
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  trackingNumber: text("tracking_number").notNull().unique(),
  documentNumber: text("document_number").notNull(),
  documentTypeId: integer("document_type_id").notNull(),
  senderDni: text("sender_dni").notNull(),
  senderName: text("sender_name").notNull(),
  senderLastName: text("sender_last_name").notNull(),
  senderEmail: text("sender_email"),
  senderPhone: text("sender_phone"),
  senderAddress: text("sender_address"),
  representation: text("representation").notNull(),
  companyRuc: text("company_ruc"),
  companyName: text("company_name"),
  originAreaId: integer("origin_area_id").notNull(),
  currentAreaId: integer("current_area_id").notNull(),
  currentEmployeeId: integer("current_employee_id"),  // O funcionário específico responsável pelo documento
  status: text("status").notNull(), // 'Pending', 'In Progress', 'Completed', etc.
  subject: text("subject").notNull(),
  folios: integer("folios").notNull(),
  filePath: text("file_path"),
  deadlineDays: integer("deadline_days"),  // Prazo em dias
  deadline: timestamp("deadline"),         // Data final calculada
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Document Tracking table
export const documentTracking = pgTable("document_tracking", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  fromAreaId: integer("from_area_id").notNull(),
  toAreaId: integer("to_area_id").notNull(),
  fromEmployeeId: integer("from_employee_id"),
  toEmployeeId: integer("to_employee_id"),
  description: text("description"),
  attachmentPath: text("attachment_path"),
  deadlineDays: integer("deadline_days"),  // Prazo em dias definido no encaminhamento
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDocumentTrackingSchema = createInsertSchema(documentTracking).omit({ id: true, createdAt: true });
export type InsertDocumentTracking = z.infer<typeof insertDocumentTrackingSchema>;
export type DocumentTracking = typeof documentTracking.$inferSelect;
