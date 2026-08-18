---
name: flask-app
description: Build, run, and debug Flask (Python) apps — routes, render_template, request/response, blueprints, debug mode.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Flask App

Flask specifics (Python, minimal).

1. **Bootstrap** — `app = Flask(__name__)`; `if __name__ == "__main__": app.run(port=..., debug=True)`. Read the port from env.
2. **Routes** — `@app.route('/x', methods=['GET','POST'])`; `request.json` for the JSON body (returns `None` if the content-type isn't JSON — check `request.is_json`). Return a tuple `(body, status)` or `jsonify(...)`.
3. **Templates/static** — `render_template('page.html')` reads from `templates/`; `url_for('static', filename='...')` from `static/`. A 500 "template not found" = wrong filename or missing templates dir.
4. **Blueprints** — split routes into `bp = Blueprint('api', __name__)` + `app.register_blueprint(bp, url_prefix='/api')`. A 404 on a blueprint route = not registered or wrong prefix.
5. **Debug** — `debug=True` shows the traceback in the browser and hot-reloads; a 500 without detail = debug off. The FIRST frame of the traceback is the bug.
6. **DB** — SQLAlchemy/Flask-SQLAlchemy for models (see `database-setup`); `db.create_all()` or migrations for schema.
7. **Verify** — run in background, curl the route (see `make-it-run`, `http-api-testing`).
