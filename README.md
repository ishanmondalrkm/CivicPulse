# CivicPulse

**CivicPulse** is a smart civic complaint management platform designed
to make reporting, tracking, and resolving local civic issues more
structured, transparent, and evidence-driven.

Citizens can submit complaints with location, descriptions, images, and
voice input. The system can use AI-assisted processing to help classify
complaints, detect potentially invalid/fraudulent evidence, identify
duplicates, and route complaints toward the appropriate administrative
workflow.

## Features

### Citizen

-   User registration and login
-   Email OTP-based authentication
-   Mobile number + password login
-   Forgot-password flow
-   Citizen dashboard
-   Complaint submission
-   GPS/location selection using an interactive map
-   Image/file evidence upload
-   Live camera capture
-   Voice-based complaint input
-   Multilingual voice input
-   Complaint status/timeline tracking
-   Location-aware complaint reporting

### Administration

-   Separate admin dashboard
-   View and manage submitted complaints
-   Complaint prioritization
-   Complaint categorization and routing
-   Complaint status management
-   Evidence-based complaint handling

### AI-assisted functionality

-   Complaint text processing/classification
-   Multilingual input processing
-   Image/evidence analysis
-   Duplicate complaint detection
-   Potentially suspicious/fraudulent evidence detection

> AI-assisted features are intended to support the workflow; final
> administrative decisions remain with authorized users.

## Tech Stack

### Frontend

-   React
-   JavaScript / JSX
-   React Leaflet
-   Tailwind CSS / PostCSS
-   Context API for authentication/state
-   npm

### Backend

-   Python
-   FastAPI
-   Uvicorn
-   Pytest
-   MongoDB
-   JWT/authentication-related utilities
-   Python environment managed with `venv`

### Other

-   Git & GitHub
-   Leaflet / OpenStreetMap-based mapping
-   Environment variables using `.env`

------------------------------------------------------------------------

# Project Structure

``` text
civicPulse/
│
├── .emergent/
│
├── backend/
│   ├── __pycache__/
│   ├── tests/
│   ├── uploads/
│   ├── venv/
│   │
│   ├── .env
│   ├── ai_service.py
│   ├── auth.py
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── seed_data.py
│   └── server.py
│
├── frontend/
│   ├── node_modules/
│   ├── plugins/
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── testIds/
│   │   │   ├── ui/
│   │   │   ├── ComplaintTimeline.jsx
│   │   │   ├── MapPicker.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── VoiceInput.jsx
│   │   │
│   │   ├── constants/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   ├── lib/
│   │   │
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CitizenDashboard.jsx
│   │   │   ├── CitizenLocationPicker.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   └── LoginPage.jsx
│   │   │
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   │
│   ├── .env
│   ├── .gitignore
│   ├── components.json
│   ├── craco.config.js
│   ├── jsconfig.json
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   └── README.md
│
└── README.md
```

## Important Directories

### `backend/`

Contains the FastAPI server and backend services.

-   `server.py` --- main backend/server entry point
-   `auth.py` --- authentication-related functionality
-   `ai_service.py` --- AI-assisted processing
-   `seed_data.py` --- development/test data initialization
-   `tests/` --- backend tests
-   `uploads/` --- uploaded complaint/evidence files
-   `requirements.txt` --- Python dependencies
-   `.env` --- backend environment variables and secrets
-   `venv/` --- local Python virtual environment

### `frontend/src/components/`

Reusable UI components used across the application.

-   `ComplaintTimeline.jsx` --- displays complaint progress/history
-   `MapPicker.jsx` --- interactive location selection
-   `Navbar.jsx` --- navigation/header component
-   `VoiceInput.jsx` --- voice-based complaint input
-   `ui/` --- reusable UI components
-   `testIds/` --- testing-related identifiers/components

### `frontend/src/context/`

Application-wide React context.

-   `AuthContext.jsx` --- authentication state and related logic

### `frontend/src/pages/`

Major application pages.

-   `LandingPage.jsx` --- public landing page
-   `LoginPage.jsx` --- authentication/login page
-   `CitizenDashboard.jsx` --- citizen interface
-   `AdminDashboard.jsx` --- administration interface
-   `CitizenLocationPicker.jsx` --- citizen location-selection interface

------------------------------------------------------------------------

# Getting Started

## 1. Clone the repository

``` bash
git clone <YOUR_REPOSITORY_URL>
cd civicPulse
```

## 2. Backend setup

Move into the backend:

``` bash
cd backend
```

Create a virtual environment:

``` bash
python -m venv venv
```

Activate it on Windows:

``` bash
venv\Scripts\activate
```

Install dependencies:

``` bash
pip install -r requirements.txt
```

Create/configure the backend `.env` file with the required credentials
and configuration.

Start the FastAPI server:

``` bash
uvicorn server:app --reload --port 8001
```

The backend will normally be available at:

``` text
http://localhost:8001
```

## 3. Frontend setup

Open another terminal:

``` bash
cd frontend
```

Install dependencies:

``` bash
npm install
```

Start the React development server:

``` bash
npm start
```

The frontend will normally run at:

``` text
http://localhost:3000
```


Use the actual variables required by the current implementation of
`server.py`, `auth.py`, and `ai_service.py`.

## Development Notes

### Backend

The backend is built around FastAPI and provides APIs for
authentication, complaints, uploads, AI-assisted processing, and
administrative workflows.

API documentation is available through FastAPI's automatically generated
documentation when the server is running:

``` text
http://localhost:8001/docs
```

### Frontend

The frontend communicates with the FastAPI backend and contains separate
citizen and admin experiences.

React components are organized into:

-   reusable components
-   pages
-   context/state
-   hooks
-   utility/library code

## Testing

Backend tests are located in:

``` text
backend/tests/
```

Run:

``` bash
pytest
```

## Git Workflow

A typical development workflow:

``` bash
git pull
git checkout -b feature/your-feature
```

Make changes, then:

``` bash
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

Create a Pull Request on GitHub when appropriate.

## Security

-   Never commit `.env` files containing real credentials.
-   Never commit API keys, database passwords, JWT secrets, or
    email-service credentials.
-   Validate uploaded files on the backend.
-   Authenticate and authorize administrative endpoints.
-   Keep citizen information protected and expose only the data required
    for each role.

## Future Improvements

Possible future development areas include:

-   More advanced duplicate detection
-   Better complaint prioritization
-   Department-specific workflows
-   Real-time complaint status notifications
-   Improved multilingual NLP
-   Stronger image/evidence verification
-   Analytics and reporting dashboards
-   Role-based access control for different administrative departments
-   Production deployment and monitoring
-   Automated testing and CI/CD

## License

This project is currently intended as an academic/project
implementation.

------------------------------------------------------------------------

## Contributors


Built as a collaborative civic-tech project.



