# StoreFront Management System

A simple marketplace project with a Django REST backend and a React/Vite frontend.

The production Docker deployment lives on the deployment branch and is available at
https://storefront.jirayusmoolsart.online/. This `main` branch README is focused on
cloning the project and running it locally step by step.

Note: when opening the live site, please wait a little bit for Render to resume
the project.

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
git clone https://github.com/fermfirxzer/StoreFront-Management-System-
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

# Supabase Storage values for uploaded product images.
# Use these when product images should be stored in Supabase instead of local media files.
SUPABASE_PROJECT_REF=
SUPABASE_STORAGE_BUCKET=
SUPABASE_S3_ACCESS_KEY_ID=
SUPABASE_S3_SECRET_ACCESS_KEY=
SUPABASE_S3_REGION=ap-northeast-1
SUPABASE_S3_ENDPOINT_URL=
```

Use `DATABASE_URL` for the database connection. The backend will read the
database settings from this value.

The Supabase Storage values are used for product image uploads when images are
stored in Supabase Storage instead of the local `backend/media` folder.

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

## 4. Set Up Supabase Storage For Images

Use Supabase Storage when uploaded product images should be saved in Supabase
instead of the local folder.

1. Open your Supabase project.
2. Go to `Storage` and create or select the `product-images` bucket.
3. Go to `Project Settings` > `Storage`.
4. Create S3 access keys.
5. Paste the values into `backend/.env`.

Example for `backend/.env`:

```env
SUPABASE_PROJECT_REF=ibuqxmqpgfkqlpknbddx
SUPABASE_STORAGE_BUCKET=product-images
SUPABASE_S3_ACCESS_KEY_ID=<your-supabase-s3-access-key-id>
SUPABASE_S3_SECRET_ACCESS_KEY=<your-supabase-s3-secret-access-key>
SUPABASE_S3_REGION=ap-northeast-1
SUPABASE_S3_ENDPOINT_URL=https://ibuqxmqpgfkqlpknbddx.storage.supabase.co/storage/v1/s3
```

Replace the access key and secret key placeholders with the real values in your
local `backend/.env` file. Keep the S3 access key and secret key only in
`backend/.env`. Do not commit real Supabase Storage credentials to Git.

## 5. Run Backend

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

## 6. Run Frontend

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

Live deployment:

```text
https://storefront.jirayusmoolsart.online/
```

If the site does not load immediately, wait a little bit for Render to resume
the project.
