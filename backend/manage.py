#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""

from __future__ import annotations

import os
import sys
from pathlib import Path


def main() -> None:
    deps_dir = Path(__file__).resolve().parent / ".deps"
    if deps_dir.exists():
        sys.path.insert(0, str(deps_dir))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Django is not installed. Activate the backend environment first."
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
