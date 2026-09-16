markdown
# LearnNest

## Tech Stack

**Languages**
- Python
- JavaScript (JSX)
- SQL (SQLite)

**Backend**
- Django 6.x
- Django REST Framework
- djangorestframework-simplejwt (JWT authentication)
- django-cors-headers
- Pillow (image uploads)
- SQLite (development database)

**Frontend**
- React 18
- Vite
- React Router
- Tailwind CSS
- Axios

**Other**
- Node.js + npm (for the frontend toolchain)
- Git

---

## Backend — What to Install

1. **Python 3.11+** — verify with:
   ```powershell
   python --version
Create and activate a virtual environment (from LearnNest\backend):

powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
If PowerShell blocks the activate script, run this once and retry:

powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
Install the backend dependencies (while the venv is active):

powershell
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pillow
Or, if you have a requirements.txt:

powershell
pip install -r requirements.txt
Backend — How to Run
From LearnNest\backend:

powershell
.\venv\Scripts\Activate.ps1
cd learnnest_api
python manage.py migrate
python manage.py runserver
Backend runs at http://127.0.0.1:8000/.

 The (venv) prefix must be visible in your prompt before running manage.py.
If it isn't, you'll get ModuleNotFoundError: rest_framework_simplejwt.

Frontend — What to Install
Node.js 18+ (includes npm) — verify with:

powershell
node --version
npm --version
Install the frontend dependencies (from LearnNest\frontend):

powershell
npm install
Frontend — How to Run
From LearnNest\frontend:

powershell
npm run dev
Frontend runs at http://localhost:5173/.

The frontend expects the backend at http://127.0.0.1:8000. If your backend runs elsewhere, set it in frontend/.env:

t
VITE_API_URL=http://127.0.0.1:8000
Running Both Together
Open PowerShell window 1 — start the backend:

powershell
cd D:\LearnNest\backend
.\venv\Scripts\Activate.ps1
cd learnnest_api
python manage.py runserver
Leave this window open.

Open PowerShell window 2 — start the frontend:

powershell
cd D:\LearnNest\frontend
npm run dev
Leave this window open.

Open http://localhost:5173/ in your browser.

text

---

That's it — nothing about features, endpoints, seed data, deployment, or architecture. Just the three things you asked for.

One small heads-up: your `pip install -r requirements.txt` line will only work if that file actually exists in `learnnest_api/`. If it doesn't, use the explicit `pip install django djangorestframework ...` line. If you'd like, I can also generate a proper `requirements.txt` for you in the next message.
