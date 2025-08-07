import { 
  User, InsertUser, users,
  Area, InsertArea, areas,
  DocumentType, InsertDocumentType, documentTypes,
  Employee, InsertEmployee, employees,
  Document, InsertDocument, documents,
  DocumentTracking, InsertDocumentTracking, documentTracking
} from "@shared/schema";
import { db } from "./db";
import { eq, and, isNotNull, lt, gt, ne, desc } from "drizzle-orm";

// Interface defining all the storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Area operations
  getArea(id: number): Promise<Area | undefined>;
  createArea(area: InsertArea): Promise<Area>;
  listAreas(): Promise<Area[]>;
  updateArea(id: number, area: Partial<InsertArea>): Promise<Area | undefined>;
  deleteArea(id: number): Promise<boolean>;

  // Document Type operations
  getDocumentType(id: number): Promise<DocumentType | undefined>;
  createDocumentType(docType: InsertDocumentType): Promise<DocumentType>;
  listDocumentTypes(): Promise<DocumentType[]>;
  updateDocumentType(id: number, docType: Partial<InsertDocumentType>): Promise<DocumentType | undefined>;
  deleteDocumentType(id: number): Promise<boolean>;

  // Employee operations
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeeByDni(dni: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  listEmployees(): Promise<Employee[]>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentByTrackingNumber(trackingNumber: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  listDocuments(): Promise<Document[]>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  getDocumentsByAreaId(areaId: number): Promise<Document[]>;
  getDocumentsByEmployeeId(employeeId: number): Promise<Document[]>;
  getDocumentsByStatus(status: string): Promise<Document[]>;
  getDocumentsWithDeadline(days: number): Promise<Document[]>;
  calculateDeadlineDate(startDate: Date, deadlineDays: number): Date;
  
  // Document Tracking operations
  getDocumentTracking(id: number): Promise<DocumentTracking | undefined>;
  createDocumentTracking(tracking: InsertDocumentTracking): Promise<DocumentTracking>;
  listDocumentTrackingByDocumentId(documentId: number): Promise<DocumentTracking[]>;
  getRecentActivities(limit: number): Promise<DocumentTracking[]>;
  forwardDocumentToArea(documentId: number, toAreaId: number, description: string, deadlineDays?: number): Promise<DocumentTracking>;
  forwardDocumentToEmployee(documentId: number, toAreaId: number, toEmployeeId: number, description: string, deadlineDays?: number): Promise<DocumentTracking>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private areas: Map<number, Area>;
  private documentTypes: Map<number, DocumentType>;
  private employees: Map<number, Employee>;
  private documents: Map<number, Document>;
  private documentTrackings: Map<number, DocumentTracking>;
  
  private userIdCounter: number;
  private areaIdCounter: number;
  private documentTypeIdCounter: number;
  private employeeIdCounter: number;
  private documentIdCounter: number;
  private documentTrackingIdCounter: number;

  constructor() {
    this.users = new Map();
    this.areas = new Map();
    this.documentTypes = new Map();
    this.employees = new Map();
    this.documents = new Map();
    this.documentTrackings = new Map();
    
    this.userIdCounter = 1;
    this.areaIdCounter = 1;
    this.documentTypeIdCounter = 1;
    this.employeeIdCounter = 1;
    this.documentIdCounter = 1;
    this.documentTrackingIdCounter = 1;
    
    // Initialize with default admin user
    this.createUser({ 
      username: "admin", 
      password: "admin123", 
      name: "Admin User", 
      role: "Administrator", 
      status: true 
    });
    
    // Initialize with some default areas
    this.createArea({ name: "Finance", status: true });
    this.createArea({ name: "Human Resources", status: true });
    this.createArea({ name: "Legal", status: true });
    
    // Initialize with some default document types
    this.createDocumentType({ name: "Invoice", status: true });
    this.createDocumentType({ name: "Contract", status: true });
    this.createDocumentType({ name: "Report", status: true });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { 
      ...user, 
      id, 
      status: user.status !== undefined ? user.status : true, 
      createdAt: new Date() 
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Area operations
  async getArea(id: number): Promise<Area | undefined> {
    return this.areas.get(id);
  }

  async createArea(area: InsertArea): Promise<Area> {
    const id = this.areaIdCounter++;
    const newArea: Area = { 
      ...area, 
      id,
      status: area.status !== undefined ? area.status : true,
      createdAt: new Date() 
    };
    this.areas.set(id, newArea);
    return newArea;
  }

  async listAreas(): Promise<Area[]> {
    return Array.from(this.areas.values());
  }

  async updateArea(id: number, area: Partial<InsertArea>): Promise<Area | undefined> {
    const existingArea = this.areas.get(id);
    if (!existingArea) return undefined;
    
    const updatedArea = { ...existingArea, ...area };
    this.areas.set(id, updatedArea);
    return updatedArea;
  }

  async deleteArea(id: number): Promise<boolean> {
    return this.areas.delete(id);
  }

  // Document Type operations
  async getDocumentType(id: number): Promise<DocumentType | undefined> {
    return this.documentTypes.get(id);
  }

  async createDocumentType(docType: InsertDocumentType): Promise<DocumentType> {
    const id = this.documentTypeIdCounter++;
    const newDocType: DocumentType = { 
      ...docType, 
      id, 
      status: docType.status !== undefined ? docType.status : true,
      createdAt: new Date() 
    };
    this.documentTypes.set(id, newDocType);
    return newDocType;
  }

  async listDocumentTypes(): Promise<DocumentType[]> {
    return Array.from(this.documentTypes.values());
  }

  async updateDocumentType(id: number, docType: Partial<InsertDocumentType>): Promise<DocumentType | undefined> {
    const existingDocType = this.documentTypes.get(id);
    if (!existingDocType) return undefined;
    
    const updatedDocType = { ...existingDocType, ...docType };
    this.documentTypes.set(id, updatedDocType);
    return updatedDocType;
  }

  async deleteDocumentType(id: number): Promise<boolean> {
    return this.documentTypes.delete(id);
  }

  // Employee operations
  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployeeByDni(dni: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(emp => emp.dni === dni);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.employeeIdCounter++;
    const newEmployee: Employee = { 
      ...employee, 
      id, 
      status: employee.status !== undefined ? employee.status : true,
      email: employee.email || null,
      phone: employee.phone || null,
      createdAt: new Date() 
    };
    this.employees.set(id, newEmployee);
    return newEmployee;
  }

  async listEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const existingEmployee = this.employees.get(id);
    if (!existingEmployee) return undefined;
    
    const updatedEmployee = { ...existingEmployee, ...employee };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employees.delete(id);
  }

  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentByTrackingNumber(trackingNumber: string): Promise<Document | undefined> {
    return Array.from(this.documents.values()).find(doc => doc.trackingNumber === trackingNumber);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const newDocument: Document = { 
      ...document, 
      id,
      filePath: document.filePath || null,
      deadline: document.deadline || null,
      deadlineDays: document.deadlineDays || null,
      currentEmployeeId: document.currentEmployeeId || null,
      createdAt: new Date() 
    };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async listDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined> {
    const existingDocument = this.documents.get(id);
    if (!existingDocument) return undefined;
    
    const updatedDocument = { ...existingDocument, ...document };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  async getDocumentsByAreaId(areaId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.currentAreaId === areaId);
  }
  
  async getDocumentsByEmployeeId(employeeId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.currentEmployeeId === employeeId);
  }

  async getDocumentsByStatus(status: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.status === status);
  }
  
  calculateDeadlineDate(startDate: Date, deadlineDays: number): Date {
    const deadline = new Date(startDate);
    deadline.setDate(deadline.getDate() + deadlineDays);
    return deadline;
  }

  async getDocumentsWithDeadline(days: number): Promise<Document[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return Array.from(this.documents.values()).filter(doc => {
      if (!doc.deadline) return false;
      const deadlineDate = new Date(doc.deadline);
      return deadlineDate >= now && deadlineDate <= futureDate;
    });
  }

  // Document Tracking operations
  async getDocumentTracking(id: number): Promise<DocumentTracking | undefined> {
    return this.documentTrackings.get(id);
  }

  async createDocumentTracking(tracking: InsertDocumentTracking): Promise<DocumentTracking> {
    const id = this.documentTrackingIdCounter++;
    const newTracking: DocumentTracking = { 
      ...tracking, 
      id, 
      description: tracking.description || null,
      attachmentPath: tracking.attachmentPath || null,
      fromEmployeeId: tracking.fromEmployeeId || null,
      toEmployeeId: tracking.toEmployeeId || null,
      deadlineDays: tracking.deadlineDays || null,
      createdAt: new Date() 
    };
    this.documentTrackings.set(id, newTracking);
    return newTracking;
  }

  async listDocumentTrackingByDocumentId(documentId: number): Promise<DocumentTracking[]> {
    return Array.from(this.documentTrackings.values())
      .filter(tracking => tracking.documentId === documentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRecentActivities(limit: number): Promise<DocumentTracking[]> {
    return Array.from(this.documentTrackings.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  async forwardDocumentToArea(documentId: number, toAreaId: number, description: string, deadlineDays?: number): Promise<DocumentTracking> {
    // Buscar o documento atual
    const document = await this.getDocument(documentId);
    if (!document) {
      throw new Error(`Documento com ID ${documentId} não encontrado`);
    }
    
    const fromAreaId = document.currentAreaId;
    
    // Criar o registro de tracking
    const tracking: InsertDocumentTracking = {
      documentId,
      fromAreaId,
      toAreaId,
      description: description || null,
      attachmentPath: null,
      fromEmployeeId: null,
      toEmployeeId: null,
      deadlineDays: deadlineDays || null,
      createdBy: document.createdBy
    };
    
    const newTracking = await this.createDocumentTracking(tracking);
    
    // Atualizar o documento com a nova área atual
    const updateData: Partial<InsertDocument> = {
      currentAreaId: toAreaId,
      currentEmployeeId: null // Limpar o funcionário designado ao mudar de área
    };
    
    // Se houver prazo em dias, calcular e atualizar a data de prazo
    if (deadlineDays) {
      updateData.deadlineDays = deadlineDays;
      updateData.deadline = this.calculateDeadlineDate(new Date(), deadlineDays);
    }
    
    await this.updateDocument(documentId, updateData);
    
    return newTracking;
  }
  
  async forwardDocumentToEmployee(documentId: number, toAreaId: number, toEmployeeId: number, description: string, deadlineDays?: number): Promise<DocumentTracking> {
    // Buscar o documento atual
    const document = await this.getDocument(documentId);
    if (!document) {
      throw new Error(`Documento com ID ${documentId} não encontrado`);
    }
    
    // Verificar se o funcionário pertence à área destino
    const employee = await this.getEmployee(toEmployeeId);
    if (!employee) {
      throw new Error(`Funcionário com ID ${toEmployeeId} não encontrado`);
    }
    
    if (employee.areaId !== toAreaId) {
      throw new Error(`Funcionário com ID ${toEmployeeId} não pertence à área com ID ${toAreaId}`);
    }
    
    const fromAreaId = document.currentAreaId;
    const fromEmployeeId = document.currentEmployeeId || null;
    
    // Criar o registro de tracking
    const tracking: InsertDocumentTracking = {
      documentId,
      fromAreaId,
      toAreaId,
      fromEmployeeId,
      toEmployeeId,
      description: description || null,
      attachmentPath: null,
      deadlineDays: deadlineDays || null,
      createdBy: document.createdBy
    };
    
    const newTracking = await this.createDocumentTracking(tracking);
    
    // Atualizar o documento com a nova área e funcionário atual
    const updateData: Partial<InsertDocument> = {
      currentAreaId: toAreaId,
      currentEmployeeId: toEmployeeId
    };
    
    // Se houver prazo em dias, calcular e atualizar a data de prazo
    if (deadlineDays) {
      updateData.deadlineDays = deadlineDays;
      updateData.deadline = this.calculateDeadlineDate(new Date(), deadlineDays);
    }
    
    await this.updateDocument(documentId, updateData);
    
    return newTracking;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Area operations
  async getArea(id: number): Promise<Area | undefined> {
    const [area] = await db.select().from(areas).where(eq(areas.id, id));
    return area || undefined;
  }

  async createArea(area: InsertArea): Promise<Area> {
    const [newArea] = await db.insert(areas).values(area).returning();
    return newArea;
  }

  async listAreas(): Promise<Area[]> {
    return await db.select().from(areas);
  }

  async updateArea(id: number, area: Partial<InsertArea>): Promise<Area | undefined> {
    const [updatedArea] = await db
      .update(areas)
      .set(area)
      .where(eq(areas.id, id))
      .returning();
    return updatedArea || undefined;
  }

  async deleteArea(id: number): Promise<boolean> {
    const result = await db.delete(areas).where(eq(areas.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Document Type operations
  async getDocumentType(id: number): Promise<DocumentType | undefined> {
    const [docType] = await db.select().from(documentTypes).where(eq(documentTypes.id, id));
    return docType || undefined;
  }

  async createDocumentType(docType: InsertDocumentType): Promise<DocumentType> {
    const [newDocType] = await db.insert(documentTypes).values(docType).returning();
    return newDocType;
  }

  async listDocumentTypes(): Promise<DocumentType[]> {
    return await db.select().from(documentTypes);
  }

  async updateDocumentType(id: number, docType: Partial<InsertDocumentType>): Promise<DocumentType | undefined> {
    const [updatedDocType] = await db
      .update(documentTypes)
      .set(docType)
      .where(eq(documentTypes.id, id))
      .returning();
    return updatedDocType || undefined;
  }

  async deleteDocumentType(id: number): Promise<boolean> {
    const result = await db.delete(documentTypes).where(eq(documentTypes.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Employee operations
  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async getEmployeeByDni(dni: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.dni, dni));
    return employee || undefined;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }

  async listEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updatedEmployee] = await db
      .update(employees)
      .set(employee)
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee || undefined;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const result = await db.delete(employees).where(eq(employees.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getDocumentByTrackingNumber(trackingNumber: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.trackingNumber, trackingNumber));
    return document || undefined;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async listDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set(document)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getDocumentsByAreaId(areaId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.currentAreaId, areaId));
  }

  async getDocumentsByEmployeeId(employeeId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.currentEmployeeId, employeeId));
  }

  async getDocumentsByStatus(status: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.status, status));
  }

  calculateDeadlineDate(startDate: Date, deadlineDays: number): Date {
    // Simple deadline calculation - add the number of days to the start date
    const deadlineDate = new Date(startDate);
    deadlineDate.setDate(deadlineDate.getDate() + deadlineDays);
    return deadlineDate;
  }

  async getDocumentsWithDeadline(days: number): Promise<Document[]> {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    return await db.select().from(documents)
      .where(
        and(
          isNotNull(documents.deadline),
          lt(documents.deadline, futureDate),
          gt(documents.deadline, today),
          ne(documents.status, 'Completed')
        )
      );
  }

  // Document Tracking operations
  async getDocumentTracking(id: number): Promise<DocumentTracking | undefined> {
    const [tracking] = await db.select().from(documentTracking).where(eq(documentTracking.id, id));
    return tracking || undefined;
  }

  async createDocumentTracking(tracking: InsertDocumentTracking): Promise<DocumentTracking> {
    const [newTracking] = await db.insert(documentTracking).values(tracking).returning();
    return newTracking;
  }

  async listDocumentTrackingByDocumentId(documentId: number): Promise<DocumentTracking[]> {
    return await db.select()
      .from(documentTracking)
      .where(eq(documentTracking.documentId, documentId))
      .orderBy(desc(documentTracking.createdAt));
  }

  async getRecentActivities(limit: number): Promise<DocumentTracking[]> {
    return await db.select()
      .from(documentTracking)
      .orderBy(desc(documentTracking.createdAt))
      .limit(limit);
  }

  async forwardDocumentToArea(documentId: number, toAreaId: number, description: string, deadlineDays?: number): Promise<DocumentTracking> {
    // Buscar o documento atual
    const document = await this.getDocument(documentId);
    if (!document) {
      throw new Error(`Documento com ID ${documentId} não encontrado`);
    }
    
    const fromAreaId = document.currentAreaId;
    
    // Calcular prazo se fornecido
    let deadline = undefined;
    if (deadlineDays) {
      deadline = this.calculateDeadlineDate(new Date(), deadlineDays);
    }
    
    // Atualizar o documento com a nova área atual
    await this.updateDocument(documentId, {
      currentAreaId: toAreaId,
      currentEmployeeId: null, // Limpar o funcionário designado ao mudar de área
      deadline: deadline || null,
      deadlineDays: deadlineDays || null
    });
    
    // Criar o registro de tracking
    const tracking: InsertDocumentTracking = {
      documentId,
      fromAreaId,
      toAreaId,
      description: description || null,
      attachmentPath: null,
      fromEmployeeId: null,
      toEmployeeId: null,
      deadlineDays: deadlineDays || null,
      createdBy: document.createdBy
    };
    
    return await this.createDocumentTracking(tracking);
  }

  async forwardDocumentToEmployee(documentId: number, toAreaId: number, toEmployeeId: number, description: string, deadlineDays?: number): Promise<DocumentTracking> {
    // Buscar o documento atual
    const document = await this.getDocument(documentId);
    if (!document) {
      throw new Error(`Documento com ID ${documentId} não encontrado`);
    }
    
    // Verificar se o funcionário pertence à área destino
    const employee = await this.getEmployee(toEmployeeId);
    if (!employee) {
      throw new Error(`Funcionário com ID ${toEmployeeId} não encontrado`);
    }
    
    if (employee.areaId !== toAreaId) {
      throw new Error(`Funcionário com ID ${toEmployeeId} não pertence à área com ID ${toAreaId}`);
    }
    
    const fromAreaId = document.currentAreaId;
    const fromEmployeeId = document.currentEmployeeId || null;
    
    // Calcular prazo se fornecido
    let deadline = undefined;
    if (deadlineDays) {
      deadline = this.calculateDeadlineDate(new Date(), deadlineDays);
    }
    
    // Atualizar o documento com a nova área e funcionário atual
    await this.updateDocument(documentId, {
      currentAreaId: toAreaId,
      currentEmployeeId: toEmployeeId,
      deadline: deadline || null,
      deadlineDays: deadlineDays || null
    });
    
    // Criar o registro de tracking
    const tracking: InsertDocumentTracking = {
      documentId,
      fromAreaId,
      toAreaId,
      fromEmployeeId,
      toEmployeeId,
      description: description || null,
      attachmentPath: null,
      deadlineDays: deadlineDays || null,
      createdBy: document.createdBy
    };
    
    return await this.createDocumentTracking(tracking);
  }
}

// Use memory storage temporarily due to database connection issues
export const storage = new MemStorage();
