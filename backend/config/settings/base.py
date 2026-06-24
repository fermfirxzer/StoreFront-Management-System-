"""Shared Django settings used by local and production environments."""

from __future__ import annotations

import os
from urllib.parse import urlparse
from datetime import timedelta
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def _load_env_file(path: Path) -> None:
    """Load simple KEY=VALUE pairs from a local .env file when present."""
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[7:].strip()
        if "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def _load_database_url() -> None:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        return

    parsed = urlparse(database_url)
    if parsed.scheme not in {"postgres", "postgresql"}:
        return

    if parsed.path and len(parsed.path) > 1:
        os.environ.setdefault("DB_NAME", parsed.path.lstrip("/"))
    if parsed.username:
        os.environ.setdefault("DB_USER", parsed.username)
    if parsed.password:
        os.environ.setdefault("DB_PASSWORD", parsed.password)
    if parsed.hostname:
        os.environ.setdefault("DB_HOST", parsed.hostname)
    if parsed.port:
        os.environ.setdefault("DB_PORT", str(parsed.port))


_load_env_file(BASE_DIR / ".env")
_load_database_url()


def _load_env_file(path: Path) -> None:
    """Load simple KEY=VALUE pairs from a local .env file if it exists."""
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[7:].strip()
        if "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("\"").strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def _load_database_url() -> None:
    """Map DATABASE_URL to the DB_* variables this project uses."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        return

    parsed = urlparse(database_url)
    if parsed.scheme not in {"postgres", "postgresql"}:
        return

    if parsed.path and len(parsed.path) > 1:
        os.environ.setdefault("DB_NAME", parsed.path.lstrip("/"))
    if parsed.username:
        os.environ.setdefault("DB_USER", parsed.username)
    if parsed.password:
        os.environ.setdefault("DB_PASSWORD", parsed.password)
    if parsed.hostname:
        os.environ.setdefault("DB_HOST", parsed.hostname)
    if parsed.port:
        os.environ.setdefault("DB_PORT", str(parsed.port))


_load_env_file(BASE_DIR / ".env")
_load_database_url()

SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-please-change-this-secret-key-when-deploying",
)
DEBUG = os.getenv("DJANGO_DEBUG", "False").lower() == "true"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    if host.strip()
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "storages",
    "rest_framework_simplejwt.token_blacklist",
    "apps.accounts",
    "apps.products",
    "apps.cart",
    "apps.orders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", "marketplace"),
        "USER": os.getenv("DB_USER", "postgres"),
        "PASSWORD": os.getenv("DB_PASSWORD", "postgres"),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "5432"),
        "OPTIONS": {
            "sslmode": os.getenv("DB_SSLMODE", "prefer"),
        },
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Bangkok"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

SUPABASE_PROJECT_REF = os.getenv("SUPABASE_PROJECT_REF")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET")
SUPABASE_S3_ENDPOINT_URL = os.getenv("SUPABASE_S3_ENDPOINT_URL")

if SUPABASE_STORAGE_BUCKET and SUPABASE_S3_ENDPOINT_URL:
    AWS_ACCESS_KEY_ID = os.getenv("SUPABASE_S3_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("SUPABASE_S3_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME = SUPABASE_STORAGE_BUCKET
    AWS_S3_ENDPOINT_URL = SUPABASE_S3_ENDPOINT_URL
    AWS_S3_REGION_NAME = os.getenv("SUPABASE_S3_REGION", "us-east-1")
    AWS_S3_ADDRESSING_STYLE = "path"
    AWS_S3_SIGNATURE_VERSION = "s3v4"
    AWS_S3_FILE_OVERWRITE = False
    AWS_DEFAULT_ACL = "public-read"
    AWS_QUERYSTRING_AUTH = False

    if SUPABASE_PROJECT_REF:
        AWS_S3_CUSTOM_DOMAIN = (
            f"{SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/"
            f"{SUPABASE_STORAGE_BUCKET}"
        )

    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.s3.S3Storage",
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "accounts.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "EXCEPTION_HANDLER": "core.exceptions.custom_exception_handler",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=int(os.getenv("JWT_ACCESS_TOKEN_LIFETIME_MINUTES", "60"))
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=int(os.getenv("JWT_REFRESH_TOKEN_LIFETIME_DAYS", "7"))
    ),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "DJANGO_CORS_ALLOWED_ORIGINS", "http://localhost:5173"
    ).split(",")
    if origin.strip()
]
CORS_ALLOW_CREDENTIALS = True

REFRESH_TOKEN_COOKIE_NAME = os.getenv(
    "REFRESH_TOKEN_COOKIE_NAME", "marketplace_refresh_token"
)
REFRESH_TOKEN_COOKIE_PATH = os.getenv("REFRESH_TOKEN_COOKIE_PATH", "/")
REFRESH_TOKEN_COOKIE_SAMESITE = os.getenv("REFRESH_TOKEN_COOKIE_SAMESITE", "Lax")
REFRESH_TOKEN_COOKIE_SECURE = os.getenv("REFRESH_TOKEN_COOKIE_SECURE", "False").lower() == "true"

