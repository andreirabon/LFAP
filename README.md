# Leave Filing and Approval System (LFAP)

A comprehensive web application for managing leave requests within the Department of Science and Technology (DOST). This application streamlines the entire leave management process from filing requests to approvals and reporting.

## Features

### User Authentication

- Secure login system with role-based access control
- User registration with email verification
- Password management and security

### Leave Request Management

- File different types of leave requests (Vacation, Sick, Special Privilege, Mandatory/Force)
- View personal leave balances and history
- Track request status in real-time
- Upload supporting documents for leave requests

### Approval Workflow

- Multi-level approval process (Manager endorsement, HR approval)
- Email notifications for request status changes
- Comments and feedback system for rejected/returned requests

### Manager Functions

- Endorse employee leave requests
- View team calendar for leave planning
- View team member leave balances
- Manage approvals (approve, reject, or return for revision)

### HR and Administrative Features

- Leave balance management for all employees
- Audit trail of all system activities
- Generate reports on leave utilization
- Review and process approved leave requests

### Reporting and Analytics

- Monthly leave utilization reports
- Leave history reports by department or individual
- Approval logs for compliance documentation

## Technology Stack

### Frontend

- React 19.0
- Next.js 15.3.1 (App Router)
- Tailwind CSS 4.x
- shadcn/ui components
- Luxon for date manipulation
- React Hook Form with Zod validation

### Backend

- Next.js API Routes
- iron-session for authentication
- Drizzle ORM for database operations
- PostgreSQL (via Neon Serverless)

### Tools and Utilities

- TypeScript for type safety
- Sonner for toast notifications
- PDF generation with @react-pdf/renderer
- TRPC for API communication

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+ (recommended package manager)
- PostgreSQL database

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Department of Science and Technology for project requirements
- All contributors to the open-source libraries used in this project
