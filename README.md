# StoreFront Management System

A simple marketplace project with a Django REST backend and a React/Vite frontend.

The production Docker deployment lives on the deployment branch and is available at
https://storefront.jirayusmoolsart.online/. This `main` branch README is focused on
cloning the project and running it locally step by step.

## Tech Stack

- Backend: Django, Django REST Framework, PostgreSQL
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Database: Supabase Postgres

## Prerequisites

Install these before starting:

- Git
- Python 3.12 or newer
- Node.js 20 or newer
- npm
- A Supabase account

## 1. Clone The Project

```bash
git clone <your-repository-url>
cd stone-mash-exam
git switch main
```

If you already cloned the project:

```bash
git pull
git switch main
```

## 2. Create Environment Files

Copy the example env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

### Backend Env

Open `backend/.env` and check these values:

```env
DJANGO_SECRET_KEY=django-insecure-change-this-secret-key-for-local-development
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marketplace
DB_SSLMODE=prefer
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

Use `DATABASE_URL` for the database connection. The backend will read the
database settings from this value.

### Frontend Env

Open `frontend/.env` and check:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## 3. Set Up Supabase Database

1. Go to https://supabase.com/ and create a new project.
2. Open the project dashboard.
3. Go to `Project Settings` > `Database`.
4. Copy the PostgreSQL connection string.
5. Paste it into `backend/.env` as `DATABASE_URL`.

Example:

```env
DATABASE_URL=postgresql://postgres:<your-password>@db.<project-ref>.supabase.co:5432/postgres
DB_SSLMODE=require
```

Keep your real database password only in `backend/.env`. Do not commit `.env`
files to Git.

## 4. Run Backend

From the project root:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies and run migrations:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend URL:

```text
http://localhost:8000
```

Admin URL:

```text
http://localhost:8000/admin/
```

To create an admin user:

```bash
python manage.py createsuperuser
```

## 5. Run Frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Useful Commands

Backend:

```bash
cd backend
python manage.py migrate
python manage.py runserver
python manage.py test
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run lint
```

## Branch Notes

- `main`: local development setup, easiest branch to clone and run step by step.
- `deployment`: Docker deployment setup for the live site.

Live deployment:

```text
https://storefront.jirayusmoolsart.online/
```
