# DocFlow - Sistema de Gestão de Documentos

## Overview

DocFlow is a comprehensive document management and workflow system built for Brazilian organizations. The system enables users to register, track, and manage documents through organizational areas with detailed audit trails and deadline monitoring. It provides role-based access control with Administrator and User roles, supporting document forwarding between areas, status tracking, and comprehensive reporting capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### August 14, 2025
- ✅ **Docker Compose Setup**: Complete containerization with PostgreSQL database
- ✅ **Database Schema Migration**: Updated to PostgreSQL with comprehensive schema
- ✅ **Business Rules Centralization**: Created DocumentService class with all business logic
- ✅ **Permission Middleware**: Implemented validation middleware for document operations
- ✅ **API Routes Refactoring**: Updated all routes to use centralized business service
- ✅ **Authentication System**: Successfully implemented and tested admin login (admin/admin123)
- ✅ **Document Creation**: Fixed all form validation issues and implemented working document creation modal
- ✅ **File Upload**: Implemented complete file upload system with support for PDF, DOC, DOCX, JPG, PNG (max 10MB)
- ✅ **Database Integration**: Resolved PostgreSQL connectivity and implemented in-memory storage fallback
- ✅ **Brazilian Portuguese Interface**: Complete system interface translated to pt-br
- ✅ **Automatic Process Numbers**: Implemented automatic generation in format PROC-YYYY-MM-DD-XXXX
- ✅ **Deadline Control**: Added priority levels (Normal, Com Contagem de Prazo, Urgente) with automatic deadline calculation
- ✅ **Document Tracking**: Implemented tracking numbers (TRK-YYYY-XXX) and complete audit trail
- ✅ **Area-Based Access Control**: Users now only see documents from their assigned area
- ✅ **Individual Document Assignment**: Documents can be assigned to specific employees within areas
- ✅ **Permission-Based Movement**: Only assigned users can move their documents, with validation middleware
- ✅ **Enhanced User Management**: Added area and employee association fields to user profiles
- ✅ **Assigned Documents Dashboard**: Personal widget showing documents specifically assigned to the logged-in user
- ✅ **Comprehensive Documentation**: Created detailed README.md with complete business rules and technical architecture
- ✅ **Final Fixes**: Fixed file attachment display and deadline field functionality in forms
- ✅ **Process Navigation**: Added back button in process view to return to document details
- ✅ **Project Migration**: Successfully migrated from Replit Agent to standard Replit environment

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with protected routes
- **UI Framework**: Radix UI components with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Context-based auth system with session management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy and session-based auth
- **File Handling**: Multer for document uploads
- **Password Security**: Crypto module with scrypt for password hashing

### Data Storage Solutions
- **Primary Database**: PostgreSQL with connection pooling
- **Database Schema**: Six main tables (users, areas, document_types, employees, documents, document_tracking)
- **Session Storage**: In-memory session store with configurable expiration
- **File Storage**: Server-side file system for document attachments

### Authentication and Authorization
- **Session Management**: Express sessions with memory store
- **Password Security**: Scrypt-based password hashing with salt
- **Role-Based Access**: Two roles (Administrator, Usuário) with middleware protection
- **Area-Based Access Control**: Users can only view documents from their assigned area
- **Individual Assignment System**: Documents can be assigned to specific employees within areas
- **Permission Validation**: Middleware prevents unauthorized document movement
- **Route Protection**: Frontend and backend route guards based on authentication status
- **Initial Setup**: Automatic admin user creation if no administrators exist

### Database Design
- **Users**: Authentication and role management
- **Areas**: Organizational departments/areas
- **Document Types**: Categorization of document types
- **Employees**: Personnel management with area assignments
- **Documents**: Core document entities with tracking numbers and deadlines
- **Document Tracking**: Audit trail for document movements between areas

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **express**: Web application framework
- **passport**: Authentication middleware
- **multer**: File upload handling

### Frontend UI Dependencies
- **@radix-ui/***: Comprehensive accessible UI component library
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Performant form library
- **@hookform/resolvers**: Form validation resolvers
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management

### Development Dependencies
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution environment
- **esbuild**: JavaScript bundler for production builds
- **@types/***: TypeScript definitions for various packages

### Validation and Utilities
- **zod**: Schema validation library
- **date-fns**: Modern date utility library with Portuguese locale support
- **clsx**: Conditional className utility
- **nanoid**: URL-safe unique string ID generator