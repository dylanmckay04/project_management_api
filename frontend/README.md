# Project Management App - Frontend

A modern, type-safe React application for managing projects and tasks with real-time synchronization. Built with React 18, TypeScript, and Vite for optimal performance and developer experience.

**Live Demo:** https://pulsepm.vercel.app/

## Overview

This frontend application provides a comprehensive interface for managing projects and their associated tasks. It features authentication, CRUD operations for projects and tasks, user profiles, and intuitive UI components with real-time data synchronization through React Query.

## Tech Stack

- **React 18** - Modern UI library with hooks and functional components
- **TypeScript** - Type-safe development with full type coverage for API responses
- **Vite** - Lightning-fast build tool and development server
- **React Router v6** - Client-side routing with protected routes
- **TanStack React Query v4** - Server state management, caching, and synchronization
- **Axios** - HTTP client with centralized configuration
- **CSS3** - Responsive design with modern CSS features

## Features

### Authentication & Authorization
- JWT-based authentication with secure token management
- Protected routes that redirect unauthenticated users
- User session persistence across browser refreshes
- Automatic token refresh and authorization header injection

### Project Management
- Create, read, update, and delete projects
- View all projects with owner information
- Inline project editing with modal forms
- Real-time UI updates via automatic cache invalidation

### Task Management
- Create, read, update, and delete tasks
- Filter tasks by project with dropdown selector
- Set task priority (low, medium, high) and status (todo, in_progress, completed)
- Assign tasks to users with optional due dates
- Visual status indicators with color-coded badges

### User Experience
- Persistent navigation header with user info display
- Error handling and user feedback
- Modal dialogs for creating/editing resources
- Clean, responsive UI that works on multiple screen sizes

### Code Quality
- Full TypeScript type definitions for all API responses
- Type-safe React Query hooks with generic types
- Centralized API client with consistent error handling
- Component-based architecture with separation of concerns

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.ts           # Configured Axios instance with base URL
│   ├── auth/
│   │   └── AuthProvider.tsx    # Authentication context and user state management
│   ├── components/
│   │   ├── Header.tsx          # Navigation header with user info
│   │   ├── ProjectForm.tsx     # Modal form for creating/editing projects
│   │   └── TaskForm.tsx        # Modal form for creating/editing tasks
│   ├── pages/
│   │   ├── Login.tsx           # User login page
│   │   ├── Register.tsx        # User registration page
│   │   ├── Projects.tsx        # Projects list with filtering
│   │   ├── Project.tsx         # Individual project detail view
│   │   ├── Tasks.tsx           # Tasks list with project filtering
│   │   ├── Task.tsx            # Individual task detail view
│   │   └── Profile.tsx         # User profile page
│   ├── types.ts                # TypeScript interfaces for API responses
│   ├── App.tsx                 # Main app component with route definitions
│   ├── main.tsx                # React app entry point
│   ├── styles.css              # Global styles and component styling
│   └── index.html              # HTML template
├── package.json
└── vite.config.ts
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm 7+
- Backend API running on `http://localhost:8000`

### Installation

1. Clone the repository and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Running the Development Server

Start the development server with hot module replacement:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

Create an optimized production bundle:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Architecture & Design Patterns

### State Management

**Authentication State** - Managed via React Context (`AuthProvider`) with:
- JWT token storage in localStorage
- Automatic user data fetching on token change
- Global user availability to all components

**Server State** - Managed via React Query (`TanStack`) with:
- Automatic caching and synchronization
- Query key-based invalidation for instant UI updates
- Stale-time configuration for intelligent refetching
- Error boundary patterns for graceful failure handling

### API Integration

The application uses a centralized Axios instance with:
- Automatic bearer token injection from auth context
- Consistent error handling throughout
- Type-safe responses with TypeScript generics
- Support for query parameters and request bodies

### Type Safety

All API responses are fully typed:
- `User` - User account information from `/users` endpoints
- `Project` - Project data from `/projects` endpoints
- `Task` - Task data with status and priority enums
- `ProjectWithTasks` - Extended type for project detail view

## Key Implementation Details

### Protected Routes

Routes requiring authentication are wrapped in a guard that checks for valid tokens and redirects to login if needed. The authentication provider handles token persistence automatically.

### Real-time Sync

React Query cache invalidation is triggered after mutations (create, update, delete) to ensure the UI stays in sync with the backend. View-specific query keys enable efficient cache management.

### Form Handling

Modal forms (`ProjectForm`, `TaskForm`) accept optional initial data for editing. They handle both creation and update operations, with error messages displayed to users.

### Loading States

The header displays a spinner during API calls. Individual pages show loading states before data is returned. Error pages provide user feedback on failures.

## Development Workflow

### Adding a New Feature

1. Define types in `types.ts` if needed
2. Create API client functions or hooks as needed
3. Build the page component with React Query hooks
4. Add route in `App.tsx` with appropriate protection
5. Update navigation in `Header.tsx` if needed

### Modifying API Integration

1. Update types in `types.ts` to match backend changes
2. Update fetch functions and React Query queries
3. Run `npm run dev` to check for TypeScript errors
4. Test the feature against the running backend

## Performance Considerations

- **Code Splitting** - Vite handles dynamic imports automatically
- **Lazy Loading** - React Router enables route-based code splitting
- **Cache Strategy** - React Query with 5-minute stale time prevents excessive API calls
- **Bundle Size** - Minimal dependencies with optimal tree-shaking

## API Integration

The frontend communicates with a FastAPI backend. Key endpoints used:

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /users/me` - Current user data (requires auth)
- `GET /projects` - List all projects (requires auth)
- `POST /projects` - Create new project
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project
- `GET /tasks` - List tasks with optional filtering
- `POST /tasks` - Create new task
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

## Troubleshooting

**Issue: "Cannot find module" errors**
- Solution: Run `npm install` to ensure all dependencies are installed

**Issue: API requests failing with 401 Unauthorized**
- Solution: Ensure you're logged in and the backend server is running on port 8000

**Issue: Port 3000 already in use**
- Solution: The dev server will use the next available port automatically, or stop other processes using the port

**Issue: Stale data in the UI**
- Solution: This is intentional - React Query waits for the stale-time before refetching. You can manually refetch by interacting with buttons that trigger mutations

## Future Enhancements

- [ ] Real-time collaboration using WebSockets
- [ ] Drag-and-drop task board view
- [ ] Advanced filtering and search
- [ ] Task comments and attachments
- [ ] User roles and permissions
- [ ] Dark mode support
- [ ] Mobile app version

## License

This project is part of a portfolio and can be used as a reference for learning React, TypeScript, and modern web development practices.
