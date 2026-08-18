---
name: django-app
description: Build, run, and debug Django (Python) apps — manage.py, apps, urls/views/models, migrations, runserver.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Django App

Django specifics (Python, batteries-included).

1. **manage.py** — `python manage.py runserver` (dev), `makemigrations` + `migrate` (schema), `startapp` (new app), `createsuperuser`. Always via `manage.py`, not raw Django calls.
2. **Structure** — a feature lives in an APP (`myapp/views.py`, `models.py`, `urls.py`); the app is registered in `settings.INSTALLED_APPS`. A URL that 404s = the app isn't in `INSTALLED_APPS` or its `urls` isn't `include`d in the project urls.
3. **Views** — function or class-based; return `HttpResponse`/`JsonResponse`/`render`. A view that "does nothing" = the template name is wrong or `urls` maps the wrong name.
4. **Models → DB** — `makemigrations` then `migrate`; a "table does not exist" = migrations weren't run (see `database-migration`, `database-setup`).
5. **Settings** — `settings.py`: `DATABASES`, `ALLOWED_HOSTS` (a "DisallowedHost" error = add the host), `STATICFILES`, `SECRET_KEY` from env (see `configuration-loading`, `secret-management`). Debug off = a 500 without traceback; set `DEBUG=True` in dev.
6. **Auth/admin** — the admin + auth come built-in; `@login_required`/`@permission_required` (see `authentication`).
7. **Verify** — runserver in background, curl the URL (see `make-it-run`, `http-api-testing`).
