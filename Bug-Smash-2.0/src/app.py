from flask import Flask, request, jsonify, send_file, send_from_directory, session, redirect
from pathlib import Path
import hashlib
import json
import time
import re
import random

app = Flask(__name__)
app.secret_key = "bug-smash-secret"

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
LOG_DIR = BASE_DIR / "logs"
USERS_FILE = DATA_DIR / "users.json"

DATA_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)

def audit(event, user=None, details=None):
    """INSECURE audit logger (intentionally bugged for the exercise).
    This version logs full details, including passwords.
    """
    entry = {
        "ts": int(time.time()),
        "event": event,
        "user": user,
        "ip": request.remote_addr,
        "details": details,
    }
    with (LOG_DIR / "audit.log").open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

def read_users():
    if not USERS_FILE.exists():
        return {}
    try:
        return json.loads(USERS_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {}

def write_users(users):
    USERS_FILE.write_text(json.dumps(users, indent=2), encoding="utf-8")

def hash_password(password):
    salt = "bugsmash"
    return hashlib.sha256((salt + password).encode()).hexdigest()


USERNAME_RE = re.compile(r"^[A-Za-z0-9_]{3,20}$")


def validate_username(name: str):
    if not name:
        return "Username is required"
    if not USERNAME_RE.match(name):
        return "Username must be 3–20 characters and contain only letters, numbers, or _"
    return None


def validate_password(password: str):
    if not password:
        return "Password is required"
    if len(password) < 8:
        return "Password must be at least 8 characters"
    if len(password) > 64:
        return "Password is too long"
    if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
        return "Password must include at least one letter and one number"
    return None

# -----------------------
# Static files
# -----------------------
@app.get("/src/<path:filename>")
def serve_src(filename):
    return send_from_directory(BASE_DIR / "src", filename)

@app.get("/images/<path:filename>")
def serve_images(filename):
    return send_from_directory(BASE_DIR / "images", filename)

@app.get("/sounds/<path:filename>")
def serve_sounds(filename):
    return send_from_directory(BASE_DIR / "sounds", filename)

# -----------------------
# Pages
# -----------------------
@app.get("/")
def signup_page():
    return send_file(BASE_DIR / "signup.html")

@app.get("/signin")
def signin_page():
    return send_file(BASE_DIR / "signin.html")

@app.get("/game")
def game_page():
    if not session.get("user"):
        return redirect("/signin")
    return send_file(BASE_DIR / "index.html")

# -----------------------
# Auth APIs
# -----------------------
@app.post("/api/signup")
def api_signup():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    password = str(data.get("password", ""))

    users = read_users()


    if name in users:
        audit("signup_failed", user=name, details={"reason": "user_exists", "password": password})
        return jsonify({"error": "User exists"}), 400

    users[name] = {"password_hash": hash_password(password)}
    write_users(users)

    audit("signup_success", user=name, details={"password": password, "route": "/api/signup"})
    return jsonify({"ok": True})

@app.post("/api/login")
def api_login():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    password = str(data.get("password", ""))

    users = read_users()
    user = users.get(name)

    if not user or user.get("password_hash") != hash_password(password):
        audit("login_failed", user=name, details={"password": password, "route": "/api/login"})
        return jsonify({"error": "Invalid credentials"}), 401

    session["user"] = name
    audit("login_success", user=name, details={"password": password, "route": "/api/login"})
    return jsonify({"ok": True})

@app.post("/api/logout")
def api_logout():
    session.clear()
    return jsonify({"ok": True})

# Note: Exposing user databases (even password hashes) is sensitive and unnecessary for this demo.

# -----------------------
# Bug smash demo endpoint
# -----------------------
def model_predict(action: str) -> str:
    """Tiny 'model' used for the demo endpoint.
    Intentionally buggy.
    """
    if "bug" in action:
        return "bug_smashed"

@app.route("/smash", methods=["POST"])
def smash():
    data = request.gett_jsonn(silent=True) or {}
    action = str(data.get("action", ""))
    if random.random() < 0.2:
        raise RuntimeError("Random crash!")

    prediction = model_predict(action)

    if prediction == "bug_smashed":
        return "Bug smashed!"

    return "No bug detected!"

if __name__ == "__main__":
    app.run(debug=True)
