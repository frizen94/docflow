import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  insertUserSchema, 
  insertAreaSchema, 
  insertDocumentTypeSchema, 
  insertEmployeeSchema, 
  insertDocumentSchema, 
  insertDocumentTrackingSchema 
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { hashPassword, verifyPassword, isAdmin, isAuthenticated, hasAdminUser, createAdminUser } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize session
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      secret: "docflow-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // Prune expired entries every 24h
      }),
    })
  );

  // Initialize passport for authentication
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport to use local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Nome de usuário incorreto" });
        }
        
        // Verifica se a senha corresponde usando bcrypt
        const isPasswordValid = await verifyPassword(user.password, password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Senha incorreta" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Helper function to handle validation errors
  function handleValidationError(error: unknown, res: Response) {
    if (error instanceof z.ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Check authentication middleware
  function isAuthenticated(req: Request, res: Response, next: Function) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: "Not authenticated" });
  }

  // Check if user is admin middleware
  function isAdmin(req: Request, res: Response, next: Function) {
    if (req.isAuthenticated() && (req.user as any).role === "Administrator") {
      return next();
    }
    res.status(403).json({ error: "Not authorized" });
  }

  // Authentication Routes
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/session", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // User Routes
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve users" });
    }
  });

  app.get("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve user" });
    }
  });

  app.post("/api/users", isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ error: "Nome de usuário já existe" });
      }
      
      // Cria hash da senha
      const hashedPassword = await hashPassword(userData.password);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      res.status(201).json(user);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.put("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      
      // Se a senha estiver sendo atualizada, gere o hash dela
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      res.json(updatedUser);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Area Routes
  app.get("/api/areas", isAuthenticated, async (req, res) => {
    try {
      const areas = await storage.listAreas();
      res.json(areas);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve areas" });
    }
  });

  app.get("/api/areas/:id", isAuthenticated, async (req, res) => {
    try {
      const area = await storage.getArea(Number(req.params.id));
      if (!area) {
        return res.status(404).json({ error: "Area not found" });
      }
      res.json(area);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve area" });
    }
  });

  app.post("/api/areas", isAdmin, async (req, res) => {
    try {
      const areaData = insertAreaSchema.parse(req.body);
      const area = await storage.createArea(areaData);
      res.status(201).json(area);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.put("/api/areas/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const areaData = insertAreaSchema.partial().parse(req.body);
      const updatedArea = await storage.updateArea(id, areaData);
      if (!updatedArea) {
        return res.status(404).json({ error: "Area not found" });
      }
      res.json(updatedArea);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/areas/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await storage.deleteArea(id);
      if (!deleted) {
        return res.status(404).json({ error: "Area not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete area" });
    }
  });

  // Document Type Routes
  app.get("/api/document-types", isAuthenticated, async (req, res) => {
    try {
      const documentTypes = await storage.listDocumentTypes();
      res.json(documentTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve document types" });
    }
  });

  app.get("/api/document-types/:id", isAuthenticated, async (req, res) => {
    try {
      const documentType = await storage.getDocumentType(Number(req.params.id));
      if (!documentType) {
        return res.status(404).json({ error: "Document type not found" });
      }
      res.json(documentType);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve document type" });
    }
  });

  app.post("/api/document-types", isAdmin, async (req, res) => {
    try {
      const documentTypeData = insertDocumentTypeSchema.parse(req.body);
      const documentType = await storage.createDocumentType(documentTypeData);
      res.status(201).json(documentType);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.put("/api/document-types/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const documentTypeData = insertDocumentTypeSchema.partial().parse(req.body);
      const updatedDocumentType = await storage.updateDocumentType(id, documentTypeData);
      if (!updatedDocumentType) {
        return res.status(404).json({ error: "Document type not found" });
      }
      res.json(updatedDocumentType);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/document-types/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await storage.deleteDocumentType(id);
      if (!deleted) {
        return res.status(404).json({ error: "Document type not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document type" });
    }
  });

  // Employee Routes
  app.get("/api/employees", isAuthenticated, async (req, res) => {
    try {
      const employees = await storage.listEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve employees" });
    }
  });

  app.get("/api/employees/:id", isAuthenticated, async (req, res) => {
    try {
      const employee = await storage.getEmployee(Number(req.params.id));
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve employee" });
    }
  });

  app.get("/api/employees/dni/:dni", isAuthenticated, async (req, res) => {
    try {
      const employee = await storage.getEmployeeByDni(req.params.dni);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve employee" });
    }
  });

  app.post("/api/employees", isAdmin, async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const existingEmployee = await storage.getEmployeeByDni(employeeData.dni);
      if (existingEmployee) {
        return res.status(409).json({ error: "Employee with this DNI already exists" });
      }
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.put("/api/employees/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const employeeData = insertEmployeeSchema.partial().parse(req.body);
      const updatedEmployee = await storage.updateEmployee(id, employeeData);
      if (!updatedEmployee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(updatedEmployee);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/employees/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await storage.deleteEmployee(id);
      if (!deleted) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  // Document Routes
  app.get("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.listDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve documents" });
    }
  });

  app.get("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const document = await storage.getDocument(Number(req.params.id));
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve document" });
    }
  });

  app.get("/api/documents/tracking/:trackingNumber", isAuthenticated, async (req, res) => {
    try {
      const document = await storage.getDocumentByTrackingNumber(req.params.trackingNumber);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve document" });
    }
  });

  app.get("/api/documents/area/:areaId", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getDocumentsByAreaId(Number(req.params.areaId));
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve documents" });
    }
  });

  app.get("/api/documents/status/:status", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getDocumentsByStatus(req.params.status);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve documents" });
    }
  });

  app.get("/api/documents/deadline/:days", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getDocumentsWithDeadline(Number(req.params.days));
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve documents" });
    }
  });
  
  app.get("/api/documents/employee/:employeeId", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getDocumentsByEmployeeId(Number(req.params.employeeId));
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Falha ao recuperar documentos por funcionário" });
    }
  });

  app.post("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.put("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const documentData = insertDocumentSchema.partial().parse(req.body);
      const updatedDocument = await storage.updateDocument(id, documentData);
      if (!updatedDocument) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(updatedDocument);
    } catch (error) {
      handleValidationError(error, res);
    }
  });

  app.delete("/api/documents/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const deleted = await storage.deleteDocument(id);
      if (!deleted) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // Document Tracking Routes
  app.get("/api/document-tracking/:id", isAuthenticated, async (req, res) => {
    try {
      const tracking = await storage.getDocumentTracking(Number(req.params.id));
      if (!tracking) {
        return res.status(404).json({ error: "Document tracking entry not found" });
      }
      res.json(tracking);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve tracking entry" });
    }
  });

  app.get("/api/document-tracking/document/:documentId", isAuthenticated, async (req, res) => {
    try {
      const trackingEntries = await storage.listDocumentTrackingByDocumentId(Number(req.params.documentId));
      res.json(trackingEntries);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve tracking entries" });
    }
  });

  app.get("/api/recent-activities/:limit", isAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getRecentActivities(Number(req.params.limit));
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve recent activities" });
    }
  });

  app.post("/api/document-tracking", isAuthenticated, async (req, res) => {
    try {
      const trackingData = insertDocumentTrackingSchema.parse(req.body);
      const tracking = await storage.createDocumentTracking(trackingData);
      
      // Update the current area of the document
      const document = await storage.getDocument(tracking.documentId);
      if (document) {
        await storage.updateDocument(tracking.documentId, { 
          currentAreaId: tracking.toAreaId 
        });
      }
      
      res.status(201).json(tracking);
    } catch (error) {
      handleValidationError(error, res);
    }
  });
  
  // Rotas de encaminhamento de documentos
  app.post("/api/documents/:id/forward-to-area", isAuthenticated, async (req, res) => {
    try {
      const documentId = Number(req.params.id);
      const { toAreaId, description, deadlineDays } = req.body;
      
      if (!toAreaId) {
        return res.status(400).json({ error: "Área de destino é obrigatória" });
      }
      
      const tracking = await storage.forwardDocumentToArea(
        documentId,
        Number(toAreaId),
        description || "",
        deadlineDays ? Number(deadlineDays) : undefined
      );
      
      res.status(201).json(tracking);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Erro ao encaminhar documento para área" });
      }
    }
  });
  
  app.post("/api/documents/:id/forward-to-employee", isAuthenticated, async (req, res) => {
    try {
      const documentId = Number(req.params.id);
      const { toAreaId, toEmployeeId, description, deadlineDays } = req.body;
      
      if (!toAreaId) {
        return res.status(400).json({ error: "Área de destino é obrigatória" });
      }
      
      if (!toEmployeeId) {
        return res.status(400).json({ error: "Funcionário de destino é obrigatório" });
      }
      
      const tracking = await storage.forwardDocumentToEmployee(
        documentId,
        Number(toAreaId),
        Number(toEmployeeId),
        description || "",
        deadlineDays ? Number(deadlineDays) : undefined
      );
      
      res.status(201).json(tracking);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Erro ao encaminhar documento para funcionário" });
      }
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.listDocuments();
      const completedDocuments = await storage.getDocumentsByStatus("Completed");
      const approachingDeadline = await storage.getDocumentsWithDeadline(3);
      const users = await storage.listUsers();
      
      res.json({
        totalDocuments: documents.length,
        completedDocuments: completedDocuments.length,
        approachingDeadline: approachingDeadline.length,
        totalUsers: users.length
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve dashboard stats" });
    }
  });

  // Set up file uploads
  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Configure multer for file storage
  const fileStorage = multer.diskStorage({
    destination: function(_req, _file, cb) {
      cb(null, uploadDir);
    },
    filename: function(_req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: fileStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB file size limit
    },
    fileFilter: (_req, file, cb) => {
      // Accept only specific file types
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        // @ts-ignore - Multer types don't match correct callback signature
        cb(new Error('Tipo de arquivo inválido. Apenas arquivos PDF, DOC, DOCX, JPG e PNG são permitidos.'), false);
      }
    }
  });

  // File upload endpoint
  app.post('/api/upload', isAuthenticated, (req, res) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ 
          error: err.message || 'Erro ao fazer upload do arquivo' 
        });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      // Return file path for storage in the document record
      res.json({ 
        success: true, 
        filePath: req.file.path,
        fileName: req.file.originalname
      });
    });
  });

  // Endpoint to serve uploaded files
  app.get('/api/files/:filename', isAuthenticated, (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    // Send the file
    res.sendFile(filePath);
  });

  // Rota para verificar se o sistema tem um administrador
  app.get('/api/system/check', async (req, res) => {
    try {
      const hasAdmin = await hasAdminUser();
      res.json({ hasAdmin });
    } catch (error) {
      console.error('Erro ao verificar administrador:', error);
      res.status(500).json({ error: 'Erro ao verificar configuração do sistema' });
    }
  });

  // Rota para registrar o primeiro administrador (só funciona se não houver administradores existentes)
  app.post('/api/register/admin', async (req, res) => {
    try {
      // Verifica se já existe um administrador
      const hasAdmin = await hasAdminUser();
      if (hasAdmin) {
        return res.status(403).json({ error: 'Um administrador já existe no sistema' });
      }

      const adminData = insertUserSchema.parse(req.body);
      
      // Garante que o usuário será um administrador
      await createAdminUser(adminData);
      
      res.status(201).json({ success: true, message: 'Administrador criado com sucesso' });
    } catch (error) {
      console.error('Erro ao criar administrador:', error);
      handleValidationError(error, res);
    }
  });

  // Rota para registrar um novo usuário (requer autenticação de administrador)
  app.post('/api/register/user', isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Verifica se o nome de usuário já existe
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ error: 'Nome de usuário já existe' });
      }
      
      // Cria a senha com hash
      const hashedPassword = await hashPassword(userData.password);
      
      // Cria o usuário
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      res.status(201).json({ success: true, userId: user.id });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      handleValidationError(error, res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
