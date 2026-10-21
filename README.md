# League Of Our Own

A full-stack application for managing league cricket data with real-time scoring, player profiles, and administrative features.

## Project Structure

```
League_of_our_own/
├── frontend/          # React.js + Vite + Tailwind CSS
├── backend/           # FastAPI + Python
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- npm or yarn

## Getting Started

### Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

Navigate to the backend directory and create a virtual environment:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the development server:

```bash
uvicorn main:app --reload
```

The backend API will be available at `http://localhost:8000`

API documentation will be available at `http://localhost:8000/docs`

## Features

- **Viewer Screens**: Live scorecard, schedule & points table, player profiles
- **Admin Dashboard**: Match management, user management, system settings
- **Scoring Console**: Real-time match scoring with WebSocket support
- **Authentication**: JWT-based authentication for admin and scorer roles

## Technology Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API communication

### Backend
- FastAPI for REST API
- PostgreSQL for database
- WebSocket for real-time updates
- JWT for authentication
