# FitAI - AI Fitness & Nutrition Platform

A modern fitness platform with AI-generated workout plans, nutrition recommendations, class booking, event registration, and progress tracking.

## Tech Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Database:** Neon (PostgreSQL)
- **Backend:** Express.js
- **Deployment:** Netlify (frontend) + Render/Railway (backend)
- **Routing:** React Router DOM
- **Charts:** Recharts

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Neon PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fitness-platform
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_NEON_DATABASE_URL=postgres://user:password@host/dbname
VITE_AI_API_KEY=your_ai_api_key_here
JWT_SECRET=your-jwt-secret-key-change-in-production
```

4. Set up the database:
   - Go to your Neon dashboard
   - Run the SQL schema from `database/schema.sql`

5. Start the development server:
```bash
npm run dev:all
```

Or run frontend and backend separately:
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server
```

## Features

### User Features
- Registration and login (no OTP)
- Onboarding with personal info (name, weight, height, age, goal)
- AI-generated workout plans
- AI-generated nutrition recommendations
- Fitness class booking (Yoga, Cardio, Strength Training)
- Event registration
- Challenge participation
- Progress tracking (BMI, calories burned, weight progress)
- Workout history
- Food logging

### Admin Features
- User management
- Activity tracking
- Platform analytics
- Role management

## Project Structure

```
fitness-platform/
├── src/                  # Frontend React app
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   └── assets/          # Static assets
├── server/              # Backend Express API
│   ├── routes/          # API routes
│   ├── middleware/       # Auth middleware
│   └── db/              # Database connection
├── database/            # Database schema
├── .env                 # Environment variables
├── .env.example         # Environment template
├── netlify.toml         # Netlify config
└── package.json
```

## Deployment

### Frontend (Netlify)

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard:
   - `VITE_API_URL` = your backend URL
   - `VITE_NEON_DATABASE_URL` = your Neon database URL
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

### Backend (Render/Railway/Fly.io)

1. Deploy the `server` folder to your backend hosting service
2. Set environment variables:
   - `PORT` = 5000 (or as required by your host)
   - `VITE_NEON_DATABASE_URL` = your Neon database URL
   - `JWT_SECRET` = a secure random string
3. Start command: `npm run server`

## Scripts

- `npm run dev` - Start frontend dev server
- `npm run server` - Start backend API server
- `npm run dev:all` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter

## Default Admin Credentials

- Email: `admin@fitai.com`
- Password: `admin123`

## Styling

- Modern and clean design
- Blue and white color theme
- Light gray backgrounds
- Rounded buttons and cards
- Responsive design for mobile and desktop

## License

MIT
