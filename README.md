# Enterprise Employee Management Portal

A modern, enterprise-grade employee management portal built with Next.js 14, featuring OTP-based authentication, attendance tracking, leave management, and more.

## Features

- 🔐 **Secure OTP Authentication** via Outlook SMTP
- 📊 **Dashboard** with real-time stats and announcements
- ⏰ **Attendance Management** with check-in/out functionality
- 🏖️ **Leave Management System** with approval workflow
- 👥 **Employee Directory** with search and profiles
- 📋 **Policies & Announcements** management
- 🎯 **Role-Based Access Control** (Admin, HR, Manager, Employee)
- 🎨 **Premium UI/UX** with smooth animations
- 📱 **Fully Responsive** design

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS 3
- **Animations**: Framer Motion
- **Database**: MongoDB Atlas with Prisma ORM
- **Authentication**: JWT + OTP via Outlook SMTP
- **State Management**: Zustand + TanStack Query
- **Email**: Nodemailer (Outlook SMTP)

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Outlook/Microsoft 365 account for SMTP

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd employee-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
- MongoDB connection string
- JWT secrets
- SMTP credentials

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Push database schema:
```bash
npx prisma db push
```

6. Seed the database (optional):
```bash
npx prisma db seed
```

7. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

- **Email**: admin@company.com
- **Password**: Admin@123

## Project Structure

```
frontend/
├── app/
│   ├── api/              # API Routes (serverless functions)
│   │   ├── auth/        # Authentication endpoints
│   │   ├── attendance/  # Attendance endpoints
│   │   ├── leaves/      # Leave management endpoints
│   │   └── ...
│   ├── (auth)/          # Auth pages (login, verify-otp)
│   ├── (dashboard)/     # Protected dashboard pages
│   └── layout.tsx
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components (Sidebar, Navbar)
│   └── features/        # Feature-specific components
├── lib/
│   ├── api/             # Frontend API client
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand stores
│   ├── server/          # Server-side code
│   │   ├── config/      # Configuration
│   │   ├── services/    # Business logic
│   │   ├── utils/       # Utility functions
│   │   └── middleware/  # Auth middleware
│   └── utils/           # Client-side utilities
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeding
└── public/
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP & login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Attendance
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance/today` - Today's attendance
- `GET /api/attendance/history` - Attendance history

### Leave Management
- `POST /api/leaves` - Apply for leave
- `GET /api/leaves` - List leaves
- `PUT /api/leaves/:id/approve` - Approve leave
- `PUT /api/leaves/:id/reject` - Reject leave

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically:
- Build the Next.js application
- Set up serverless functions for API routes
- Configure CDN and edge caching
- Enable automatic deployments

### Environment Variables for Production

Make sure to set these in Vercel:
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - Strong JWT secret (256+ bits)
- `JWT_REFRESH_SECRET` - Strong refresh token secret
- `SMTP_USER` - Outlook email
- `SMTP_PASSWORD` - Outlook app password
- `NEXT_PUBLIC_APP_URL` - Your production domain

## Database Schema

The application includes:
- Users & Departments
- Authentication (OTP, Refresh Tokens)
- Attendance records
- Leave management (types, balances, requests)
- Policies & Acknowledgments
- Announcements & News
- Holidays
- Notifications
- Audit logs

## Features Roadmap

- [ ] Real-time notifications
- [ ] Advanced analytics and reporting
- [ ] Document management
- [ ] Performance reviews
- [ ] Payroll integration
- [ ] Mobile app (React Native)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, email your-email@example.com or join our Slack channel.
