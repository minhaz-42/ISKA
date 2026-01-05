#!/usr/bin/env python
"""Convenience wrapper for running the Django backend from repo root.

This delegates to `backend/manage.py`, so common commands like:

  python3 manage.py runserver

work even when your current directory is the repository root.
"""

from __future__ import annotations

import os
import runpy
from pathlib import Path
import sys


if __name__ == '__main__':
    repo_root = Path(__file__).resolve().parent

    venv_python = repo_root / '.venv' / 'bin' / 'python'
    # If the project venv exists and we're not currently using it, re-exec.
    # IMPORTANT: do not `resolve()` the venv python path; it may be a symlink
    # to the base interpreter, which would bypass the venv site-packages.
    if venv_python.exists():
        try:
            in_project_venv = Path(sys.prefix).resolve() == (repo_root / '.venv').resolve()
        except Exception:
            in_project_venv = False

        if not in_project_venv:
            os.execv(str(venv_python), [str(venv_python), *sys.argv])

    backend_dir = repo_root / 'backend'
    sys.path.insert(0, str(backend_dir))

    backend_manage = backend_dir / 'manage.py'
    runpy.run_path(str(backend_manage), run_name='__main__')
