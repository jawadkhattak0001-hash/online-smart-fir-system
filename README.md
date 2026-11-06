# 🚔 Online Smart FIR System
### A Digital Platform for Transparent, Efficient & Accessible First Information Report Management

<p align="center">
  <img src="https://img.shields.io/badge/Project-Final%20Year%20Project-0078D7?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Developed-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Platform-Mobile%20%26%20Web-blueviolet?style=for-the-badge" />
</p>

<p align="center">
  <b>Empowering Citizens | Strengthening Law Enforcement | Building Digital Trust</b>
</p>

---

## 📌 About The Project

**Online Smart FIR System (SmartFIR)** is a digital platform developed to modernize and simplify the traditional First Information Report (FIR) registration and management process.

The system provides a mobile application for citizens to submit FIR reports online and a web-based dashboard for police officers to manage, review, assign, and track complaints.

The main objective is to improve transparency, accessibility, efficiency, and communication between citizens and law enforcement agencies.

## 🎯 Problem Statement

Traditional FIR registration systems often face several challenges:

- ❌ Long queues and delays at police stations.
- ❌ Manual paperwork and documentation.
- ❌ Limited transparency in FIR status tracking.
- ❌ Delays in assigning investigating officers.
- ❌ Difficulty accessing complaint updates.

### 💡 Our Digital Solution

SmartFIR addresses these challenges through:

- ✅ Quick online FIR submission.
- ✅ Digital and centralized record management.
- ✅ Real-time FIR status tracking.
- ✅ Officer assignment and investigation workflow.
- ✅ Improved transparency and accessibility.

---

## ✨ Key Features

### 👤 1. Citizen Mobile Application

- User registration and login.
- Online FIR submission.
- Complaint and incident details.
- Location and multimedia evidence support.
- View submitted FIRs.
- Track FIR status and updates.

### 👮 2. Police Web Dashboard

- Secure police officer login.
- View and manage incoming FIR reports.
- Review complaint details.
- Assign investigating officers.
- Update investigation status.
- Monitor FIR progress.

### 🔐 3. Security & Authentication

- JWT-based authentication.
- Secure token-based authorization.
- CNIC verification/validation.
- Protected API endpoints.
- Role-based access management.

### 📊 4. FIR Management

- Digital FIR records.
- Centralized database management.
- Officer assignment workflow.
- Investigation notes and status updates.
- Improved accountability and transparency.

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| 📱 Mobile Application | React Native, Expo Go |
| 🌐 Web Dashboard | React.js |
| ⚙️ Backend | Node.js, Express.js |
| 🗄️ Database | MongoDB |
| 🔗 ODM | Mongoose |
| 🔐 Authentication | JWT |
| 🔑 Verification | CNIC Verification |
| 🔌 API | RESTful API |
| 💻 Development Tools | VS Code, Postman, MongoDB |

---

## 🏗️ System Architecture

SmartFIR follows a client-server architecture.

```text
       👤 CITIZEN
            |
            ▼
   React Native Mobile App
            |
            ▼
       RESTful API
            |
            ▼
     Node.js + Express
            |
            ▼
         MongoDB
            |
            ▼
      FIR Management
            |
            ▼
    Police Web Dashboard
            |
            ▼
      👮 POLICE OFFICERS
```

### 🔄 How It Works

1. Citizens submit FIR reports through the mobile application.
2. The backend processes requests through REST APIs.
3. FIR information is stored in MongoDB.
4. Police officers access submitted reports through the web dashboard.
5. Officers review complaints and assign investigating officers.
6. FIR status and investigation progress are updated through the system.

---

## 📸 Project Screenshots & Demo

The project includes the following main interfaces:

- Citizen Mobile Application
- New FIR Registration Screen
- Police Officer Dashboard
- FIR Management Interface
- Officer Assignment Workflow

<!-- Add your actual screenshots here after uploading them to your GitHub repository. -->

<!--
Example:

![Citizen App](screenshots/citizen-app.png)
![FIR Registration](screenshots/fir-registration.png)
![Police Dashboard](screenshots/police-dashboard.png)
![Officer Assignment](screenshots/officer-assignment.png)
-->

---

## 📂 Project Structure

The project repository is organized into the following main directories:

```text
Online-Smart-FIR-System/
│
├── backend/
│
├── face-detection-service/
│
├── mobileApp/
│
├── smartfir/
│
├── scripts/
│
├── .vscode/
│
├── package.json
│
├── package-lock.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

Follow these steps to set up the project locally.

### 1. Clone the Repository

git clone https://github.com/jawadkhattak0001-hash/online-smart-fir-system.git

### 2. Navigate to Project Directory

```bash
cd YOUR_PROJECT_FOLDER
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Configure the required environment variables for the backend, database connection, and authentication.

Keep your credentials and secret keys private. Do not upload your `.env` file to GitHub.

### 5. Start the Mobile Application

```bash
npm start
```

This starts the Expo development server using the root project script.

**Note:** Backend and web dashboard services may require their own dependency installation and startup commands, depending on their respective package configurations.

---

## 🔮 Future Enhancements

The following improvements are planned for future development:

- 📍 GPS-based automatic location detection.
- 📷 Improved photo and video evidence management.
- 🗺️ Interactive reporting and location maps.
- 💬 Real-time communication with police officers.
- 🤖 AI-assisted incident categorization.
- 🔗 Blockchain-based security for tamper-proof FIR records.

*These are proposed future enhancements, not claims of
