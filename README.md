# frontdesk-AI-Supervisor
Human-in-the-Loop AI Supervisor
🚀 Overview

A simulation of an AI receptionist that:

Answers customer queries

Escalates to a human supervisor when unsure

Learns from the supervisor’s response automatically

Built for the Frontdesk Engineering Test using Node.js, Firebase Firestore, and React.

⚙️ Tech Stack

Backend: Node.js + Express

Database: Firebase Firestore

Frontend: React.js

Worker: Node cron job (for timeouts)

🧩 Flow
Caller → AI Agent → Firestore → Supervisor → Knowledge Base → AI Learns

🗂 Folder Structure
backend/
 ├── server.js
 ├── firebase.js
 ├── timeoutWorker.js
 ├── routes/
 │   ├── agent.js
 │   └── supervisor.js

frontend/
 └── supervisor-ui/
     ├── src/App.js
     └── components/



# Backend
cd backend
npm install
node server.js

# Frontend
cd ../frontend/supervisor-ui
npm install
npm start

🔥 Firebase Setup

Create Firebase project → Enable Firestore

Generate Service Account Key → rename to firebase-key.json

Place in backend/ folder

Add to .gitignore

**/firebase-key.json

🧠 API Endpoints
Method	Endpoint	Description
POST	/agent/call	Simulates AI receiving a call
GET	/supervisor	Fetch all help requests
POST	/supervisor/:id/answer	Submit supervisor answer
💡 Demo Flow

Send request via Postman → /agent/call

Firestore creates a help_request (pending)

Supervisor UI displays it

Supervisor submits answer → backend updates KB

AI “texts back” (console log)

🚀 Next Improvements

Add LiveKit for real voice calls

Add auth for supervisors

Add semantic search for knowledge base

Add Slack/SMS notifications

