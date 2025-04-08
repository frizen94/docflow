import { 
  User, InsertUser, users,
  Area, InsertArea, areas,
  DocumentType, InsertDocumentType, documentTypes,
  Employee, InsertEmployee, employees,
  Document, InsertDocument, documents,
  DocumentTracking, InsertDocumentTracking, documentTracking
} from "@shared/schema";

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
  getDocumentsByStatus(status: string): Promise<Document[]>;
  getDocumentsWithDeadline(days: number): Promise<Document[]>;
  
  // Document Tracking operations
  getDocumentTracking(id: number): Promise<DocumentTracking | undefined>;
  createDocumentTracking(tracking: InsertDocumentTracking): Promise<DocumentTracking>;
  listDocumentTrackingByDocumentId(documentId: number): Promise<DocumentTracking[]>;
  getRecentActivities(limit: number): Promise<DocumentTracking[]>;
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
    const newUser: User = { ...user, id, createdAt: new Date() };
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
    const newArea: Area = { ...area, id, createdAt: new Date() };
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
    const newDocType: DocumentType = { ...docType, id, createdAt: new Date() };
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
    const newEmployee: Employee = { ...employee, id, createdAt: new Date() };
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
    const newDocument: Document = { ...document, id, createdAt: new Date() };
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

  async getDocumentsByStatus(status: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.status === status);
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
    const newTracking: DocumentTracking = { ...tracking, id, createdAt: new Date() };
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
}

export const storage = new MemStorage();
