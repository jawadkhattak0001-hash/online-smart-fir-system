🚨 Online Smart FIR System (Fironix)
<p align="center">
  <b>A Digital Platform for Transparent, Efficient, and Accessible First Information Report Management</b>
</p>


📌 Project Overview & Motivation
The Online Smart FIR System digitizes the traditional First Information Report (FIR) process through modern mobile and web technology. Traditional police complaint filing often involves long queues, manual paper-based forms prone to errors or loss, lack of transparency, and delayed investigations.
This system addresses these gaps by offering:
24/7 Mobile Filing: Complainants can file an FIR anytime, anywhere via the mobile app using Expo Go.
Real-Time Tracking: Citizens can monitor their complaint status (Pending Review ➔ Under Investigation ➔ Resolved).
Automated Officer Assignment: Police admins can seamlessly review cases and assign Sub-Inspectors (SIs) directly from the Web Dashboard.
Paperless & Secure: All records are authenticated and securely stored in MongoDB.

👥 Project Team & Supervision
Team Members:
Muhammad Jawad
Rohail Ahmad
Ali Rehman
Supervisor: Dr. Ghani Ur Rehman
Department: Department of Computer Science
Academic Year: 2026

🏗️ Architecture & Workflow
[ Citizen Mobile App (React Native / Expo Go) ]
                       │
                       │ (REST API / JWT Auth / CNIC Verification)
                       ▼
         [ Node.js + Express Backend ]
                       │
                       ▼
             [ MongoDB Database ]
                       │
                       │ (Real-Time Status Sync)
                       ▼
     [ Police Web Dashboard (React.js) ]
End-to-End User Journey:
User Sign Up & Login: Citizens create an account on the mobile application (verified with CNIC/JWT authentication).
File New FIR: Citizens submit incident details (Category, Location, Date & Time, Description).
Real-time Web Dashboard Notification: Incoming complaints instantly appear on the Centralized Station Dashboard.
Case Review & Officer Assignment: Admin opens the Case Review Portal and assigns an Investigating Officer (e.g., SI Ali Raza, SI Hamza Ahmed, SI Usman Khan).
Investigation & Tracking: Status changes to Under Investigation, allowing citizens to track progress directly on their mobile app screen.

🛠️ Tech Stack & Dependencies
Mobile App (Frontend)
Framework: React Native with Expo Go
Navigation: React Navigation
HTTP Client: Axios / Fetch API
Police Web Dashboard (Frontend)
Framework: React.js (Vite / Tailwind CSS)
Icons & UI: Lucide React / UI Components
Backend & Database
Runtime: Node.js
Framework: Express.js
Database: MongoDB & Mongoose ODM
Security: JSON Web Tokens (JWT), Password Hashing (Bcrypt)

💻 Installation & Setup Guide
1. Prerequisites
Node.js (v18 or higher)
Git
Expo Go app installed on your physical mobile device (Android/iOS)
2. Backend Setup
cd backend
npm install
# Create a .env file with PORT, MONGO_URI, and JWT_SECRET
npm start
3. Police Web Dashboard Setup
cd smartfir
npm install
npm run dev
4. Mobile App Setup (Expo Go)
cd mobileApp
npm install
npx expo start
Scan the QR code printed in the terminal using the Expo Go application on your mobile device.

📊 Features Matrix: Traditional vs Smart FIR
Feature
Traditional FIR System
Our Online Smart FIR System
Filing Access
Physical visit to Police Station required
24/7 Mobile App Filing
Status Tracking
None / Manual follow-ups
Real-Time Dashboard & Mobile Updates
Officer Assignment
Manual paper routing
One-click Automated Officer Selection
Data Integrity
Paper records (risk of damage/loss)
Secure Cloud Storage (MongoDB)


🔮 Future Roadmap
GPS Auto Location: Automatic incident location mapping via device GPS.
Multimedia Evidence Upload: Support for uploading incident photos and video proof.
Nearest Police Station Integration: Interactive map routing to the closest station.
In-App Direct Chat: Real-time messaging between citizen and assigned Investigating Officer.
AI Classification: Automated categorization and urgency prioritization using AI/ML.

<p align="center">
  <i>Developed for Final Year Project 2026 — Department of Computer Science</i>
</p>
