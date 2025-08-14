import { IStorage } from "../storage";
import { Document, InsertDocument, DocumentTracking, InsertDocumentTracking } from "@shared/schema";

export class DocumentService {
  constructor(private storage: IStorage) {}

  /**
   * Regra: Gerar número de processo único
   */
  async generateProcessNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Buscar último número do dia
    const today = `${year}-${month}-${day}`;
    const documents = await this.storage.listDocuments();
    const todayDocs = documents.filter(doc => 
      doc.documentNumber.startsWith(`PROC-${today}`)
    );
    
    const sequence = String(todayDocs.length + 1).padStart(4, '0');
    return `PROC-${today}-${sequence}`;
  }

  /**
   * Regra: Gerar número de rastreamento único
   */
  async generateTrackingNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    
    const documents = await this.storage.listDocuments();
    const yearDocs = documents.filter(doc => 
      doc.trackingNumber.startsWith(`TRK-${year}`)
    );
    
    const sequence = String(yearDocs.length + 1).padStart(3, '0');
    return `TRK-${year}-${sequence}`;
  }

  /**
   * Regra: Calcular prazo baseado na prioridade
   */
  calculateDeadline(priority: string, customDays?: number): { deadlineDays: number | null, deadline: Date | null } {
    let deadlineDays: number | null = null;
    
    console.log("calculateDeadline called with:", { priority, customDays });
    
    // Usar dias customizados se fornecidos
    if (customDays && customDays > 0) {
      deadlineDays = customDays;
      console.log("Using custom days:", deadlineDays);
    } else {
      // Regras padrão por prioridade
      switch (priority) {
        case "Urgente":
          deadlineDays = 1;
          break;
        case "Com Contagem de Prazo":
          deadlineDays = 5;
          break;
        case "Normal":
        default:
          deadlineDays = null;
          break;
      }
      console.log("Using priority-based days:", deadlineDays);
    }

    const deadline = deadlineDays ? 
      this.storage.calculateDeadlineDate(new Date(), deadlineDays) : null;

    console.log("Final deadline calculation:", { deadlineDays, deadline });
    return { deadlineDays, deadline };
  }

  /**
   * Regra: Criar documento com validações de negócio
   */
  async createDocument(documentData: Partial<InsertDocument>, createdBy: number): Promise<Document> {
    // Validações obrigatórias
    if (!documentData.subject?.trim()) {
      throw new Error("Assunto é obrigatório");
    }
    
    if (!documentData.documentTypeId) {
      throw new Error("Tipo de documento é obrigatório");
    }
    
    if (!documentData.originAreaId) {
      throw new Error("Área de origem é obrigatória");
    }

    // Garantir que todos os campos obrigatórios estão presentes
    if (!documentData.documentTypeId || !documentData.originAreaId) {
      throw new Error("Dados obrigatórios ausentes");
    }

    // Gerar números automáticos
    const documentNumber = await this.generateProcessNumber();
    const trackingNumber = await this.generateTrackingNumber();
    
    // Calcular prazo
    const { deadlineDays, deadline } = this.calculateDeadline(
      documentData.priority || "Normal",
      documentData.deadlineDays || undefined
    );

    // Criar documento
    const newDocument: InsertDocument = {
      trackingNumber,
      documentNumber,
      documentTypeId: documentData.documentTypeId,
      originAreaId: documentData.originAreaId,
      currentAreaId: documentData.currentAreaId || documentData.originAreaId,
      currentEmployeeId: documentData.currentEmployeeId || null,
      status: documentData.status || "Em Análise",
      subject: documentData.subject.trim(),
      folios: documentData.folios || 1,
      priority: documentData.priority || "Normal",
      deadlineDays,
      deadline,
      createdBy,
    };

    const document = await this.storage.createDocument(newDocument);

    // Criar registro inicial de rastreamento
    await this.createInitialTracking(document, createdBy);

    return document;
  }

  /**
   * Regra: Criar registro inicial de rastreamento
   */
  private async createInitialTracking(document: Document, createdBy: number): Promise<void> {
    const initialTracking: InsertDocumentTracking = {
      documentId: document.id,
      fromAreaId: document.originAreaId,
      toAreaId: document.currentAreaId,
      fromEmployeeId: null,
      toEmployeeId: document.currentEmployeeId || null,
      description: `Documento ${document.documentNumber} criado com prioridade ${document.priority}`,
      attachmentPath: null,
      deadlineDays: document.deadlineDays || null,
      createdBy,
    };

    await this.storage.createDocumentTracking(initialTracking);
  }

  /**
   * Regra: Validar permissão para movimentar documento
   */
  async validateDocumentMovement(userId: number, documentId: number): Promise<{ canMove: boolean, reason?: string }> {
    const user = await this.storage.getUser(userId);
    const document = await this.storage.getDocument(documentId);

    if (!user || !document) {
      return { canMove: false, reason: "Usuário ou documento não encontrado" };
    }

    // Administrador pode mover qualquer documento
    if (user.role === "Administrator") {
      return { canMove: true };
    }

    // Verificar se usuário está na área atual do documento
    if (user.areaId !== document.currentAreaId) {
      return { canMove: false, reason: "Documento não está na sua área" };
    }

    // Se documento está atribuído a um funcionário específico
    if (document.currentEmployeeId) {
      if (user.employeeId !== document.currentEmployeeId) {
        return { canMove: false, reason: "Documento atribuído a outro funcionário" };
      }
    }

    return { canMove: true };
  }

  /**
   * Regra: Movimentar documento entre áreas/funcionários
   */
  async moveDocument(
    documentId: number, 
    toAreaId: number, 
    toEmployeeId: number | null,
    description: string,
    deadlineDays: number | null,
    userId: number
  ): Promise<DocumentTracking> {
    // Validar permissão
    const { canMove, reason } = await this.validateDocumentMovement(userId, documentId);
    if (!canMove) {
      throw new Error(reason || "Sem permissão para mover documento");
    }

    const document = await this.storage.getDocument(documentId);
    if (!document) {
      throw new Error("Documento não encontrado");
    }

    // Validar área de destino
    const toArea = await this.storage.getArea(toAreaId);
    if (!toArea || !toArea.status) {
      throw new Error("Área de destino inválida ou inativa");
    }

    // Validar funcionário de destino (se fornecido)
    if (toEmployeeId) {
      const toEmployee = await this.storage.getEmployee(toEmployeeId);
      if (!toEmployee || !toEmployee.status) {
        throw new Error("Funcionário de destino inválido ou inativo");
      }
      
      if (toEmployee.areaId !== toAreaId) {
        throw new Error("Funcionário não pertence à área de destino");
      }
    }

    // Criar registro de movimentação
    const tracking: InsertDocumentTracking = {
      documentId,
      fromAreaId: document.currentAreaId,
      toAreaId,
      fromEmployeeId: document.currentEmployeeId || null,
      toEmployeeId,
      description: description || `Encaminhado para ${toArea.name}`,
      attachmentPath: null,
      deadlineDays,
      createdBy: userId,
    };

    const trackingRecord = await this.storage.createDocumentTracking(tracking);

    // Calcular nova data limite se deadlineDays foi fornecido
    let deadline = null;
    if (deadlineDays && deadlineDays > 0) {
      deadline = this.storage.calculateDeadlineDate(new Date(), deadlineDays);
    }

    // Atualizar documento
    await this.storage.updateDocument(documentId, {
      currentAreaId: toAreaId,
      currentEmployeeId: toEmployeeId,
      deadlineDays: deadlineDays || null,
      deadline: deadline
    });

    return trackingRecord;
  }

  /**
   * Regra: Atribuir documento a funcionário específico
   */
  async assignDocument(documentId: number, employeeId: number, userId: number): Promise<void> {
    const { canMove, reason } = await this.validateDocumentMovement(userId, documentId);
    if (!canMove) {
      throw new Error(reason || "Sem permissão para atribuir documento");
    }

    const document = await this.storage.getDocument(documentId);
    const employee = await this.storage.getEmployee(employeeId);

    if (!document || !employee) {
      throw new Error("Documento ou funcionário não encontrado");
    }

    if (employee.areaId !== document.currentAreaId) {
      throw new Error("Funcionário não pertence à área atual do documento");
    }

    await this.storage.updateDocument(documentId, {
      currentEmployeeId: employeeId,
    });

    // Registrar atribuição
    const tracking: InsertDocumentTracking = {
      documentId,
      fromAreaId: document.currentAreaId,
      toAreaId: document.currentAreaId,
      fromEmployeeId: document.currentEmployeeId || null,
      toEmployeeId: employeeId,
      description: `Documento atribuído a ${employee.firstName} ${employee.lastName}`,
      attachmentPath: null,
      deadlineDays: null,
      createdBy: userId,
    };

    await this.storage.createDocumentTracking(tracking);
  }

  /**
   * Regra: Validar exclusão de documento
   */
  async validateDocumentDeletion(documentId: number, userId: number): Promise<{ canDelete: boolean, reason?: string }> {
    const user = await this.storage.getUser(userId);
    const document = await this.storage.getDocument(documentId);

    if (!user || !document) {
      return { canDelete: false, reason: "Usuário ou documento não encontrado" };
    }

    // Apenas administrador pode excluir
    if (user.role !== "Administrator") {
      return { canDelete: false, reason: "Apenas administradores podem excluir documentos" };
    }

    // Verificar se documento tem movimentações (além da criação)
    const trackings = await this.storage.listDocumentTrackingByDocumentId(documentId);
    if (trackings.length > 1) {
      return { canDelete: false, reason: "Documento com histórico de movimentações não pode ser excluído" };
    }

    return { canDelete: true };
  }

  /**
   * Regra: Excluir documento (soft delete ou hard delete conforme regras)
   */
  async deleteDocument(documentId: number, userId: number): Promise<void> {
    const { canDelete, reason } = await this.validateDocumentDeletion(documentId, userId);
    if (!canDelete) {
      throw new Error(reason || "Documento não pode ser excluído");
    }

    // Hard delete (remover completamente)
    await this.storage.deleteDocument(documentId);
  }

  /**
   * Regra: Atualizar status do documento
   */
  async updateDocumentStatus(documentId: number, status: string, userId: number): Promise<void> {
    const { canMove, reason } = await this.validateDocumentMovement(userId, documentId);
    if (!canMove) {
      throw new Error(reason || "Sem permissão para atualizar documento");
    }

    const validStatuses = ["Pending", "Em Análise", "In Progress", "Completed", "Archived"];
    if (!validStatuses.includes(status)) {
      throw new Error("Status inválido");
    }

    await this.storage.updateDocument(documentId, { status });

    // Registrar mudança de status
    const document = await this.storage.getDocument(documentId);
    if (document) {
      const tracking: InsertDocumentTracking = {
        documentId,
        fromAreaId: document.currentAreaId,
        toAreaId: document.currentAreaId,
        fromEmployeeId: document.currentEmployeeId || null,
        toEmployeeId: document.currentEmployeeId || null,
        description: `Status alterado para: ${status}`,
        attachmentPath: null,
        deadlineDays: null,
        createdBy: userId,
      };

      await this.storage.createDocumentTracking(tracking);
    }
  }

  /**
   * Regra: Listar documentos conforme permissões do usuário
   */
  async listDocumentsForUser(userId: number): Promise<Document[]> {
    const user = await this.storage.getUser(userId);
    if (!user) {
      return [];
    }

    // Se for administrador, retorna todos os documentos
    if (user.role === "Administrator") {
      return await this.storage.listDocuments();
    }
    
    // Se tem área definida, filtra por área
    if (user.areaId) {
      return await this.storage.getDocumentsByAreaId(user.areaId);
    }
    
    return [];
  }

  /**
   * Regra: Verificar documentos próximos ao vencimento
   */
  async getDocumentsNearDeadline(days: number = 3): Promise<Document[]> {
    return await this.storage.getDocumentsWithDeadline(days);
  }
}