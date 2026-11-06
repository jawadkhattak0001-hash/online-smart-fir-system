🚨 Online Smart FIR System (Fironix)A Digital Platform for Transparent, Efficient, and Accessible First Information Report ManagementDigitizing the traditional FIR filing process using mobile and web technology, enabling real-time case tracking, secure data management, and improving transparency between citizens and law enforcement.👥 Project Team & SupervisionRoleDetailsTeam MembersMuhammad Jawad, Rohail Ahmad, Ali RehmanSupervisorDr. Ghani Ur RehmanDepartmentDepartment of Computer ScienceInstitutionKhushal Khan Khattak University KarakAcademic Year2026📌 Problem Statement & Motivation🛑 Challenges in Traditional FIR FilingLong Queues: Citizens wait hours at police stations just to file a complaint.Manual Paperwork: Paper forms are prone to human errors, damage, or record loss.Lack of Transparency: No real-time status updates; complainants remain unaware of case progress.Delayed Investigation: Slow manual processing impacts timely justice and evidence collection.✨ Smart FIR Digital Solution24/7 Mobile Filing: Log complaints digitally from anywhere using a smartphone.Paperless & Automated: Digital records with secure database and cloud storage.Real-Time Transparency: Track case progress live via mobile app and police dashboard.Faster Investigation: Automated routing for swift police response and officer assignment.📊 Feature Comparison: Existing vs. Our SolutionFeatureExisting SystemsOur Smart FIR SystemMobile FilingUnavailable / Physical visits required✅ Available via React Native Mobile AppReal-time TrackingNot Available✅ Live Status Updates & NotificationsOfficer AssignmentManual process / Unclear delays✅ Automated Assignment & Status WorkflowIncident CategorizationManual / Paper-based✅ Categorized & Prioritized OnlineCitizen CommunicationLimited or No Notifications✅ Direct In-App Tracking & Status Sync🏗️ System Architecture & Workflow┌─────────────────────────────────────────────────────────┐
│              Citizen Mobile Application                 │
│              (React Native + Expo Go)                   │
└───────────────────────────┬─────────────────────────────┘
                            │ (REST API Requests)
                            ▼
┌─────────────────────────────────────────────────────────┐
│               Node.js & Express Backend                 │
│     (JWT Token Authentication & CNIC Validation)        │
└──────────────┬──────────────────────────┬───────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────┐    ┌─────────────────────────┐
│     MongoDB Database     │    │   Police Web Dashboard  │
│  (Data Store & Mongoose) │    │       (React.js)        │
└──────────────────────────┘    └─────────────────────────┘
🔄 End-to-End Execution FlowCitizen Reporting (Mobile App):Citizens log into the React Native mobile app using Expo Go.They select incident details (Category, Location, Date & Time, Description) and submit the FIR in <60 seconds.Backend Authentication & API Processing:Node.js / Express backend validates request headers using JWT Authentication and CNIC Verification.Processed FIR data is saved into MongoDB.Police Web Dashboard Monitoring (smartfir):Centralized station web dashboard receives incoming FIR logs live.Case status initializes as Pending Review.Officer Assignment & Live Synchronization:Admin reviews case details and assigns an available Sub-Inspector (e.g., SI Ali Raza, SI Hamza Ahmed, or SI Usman Khan).Status updates to Under Investigation across both the Police Web Dashboard and Citizen Mobile App.🛠️ Tech Stack & ToolsMobile App: React Native, Expo GoWeb Dashboard: React.js, Tailwind CSSBackend API: Node.js, Express.jsAuthentication: JWT (JSON Web Tokens), CNIC ValidationDatabase: MongoDB, Mongoose ODMDevelopment Tools: VS Code, Postman, Git & GitHub💻 Local Execution Guide1. Backend Server Setupcd backend
npm install
npm start
2. Police Web Dashboard Setupcd smartfir
npm install
npm run dev
3. Citizen Mobile App Setupcd mobileApp
npm install
npx expo start
Scan the displayed QR code using the Expo Go application on your mobile device.🔮 Future Roadmap & EnhancementsGPS Auto Location: Automatically capture precise incident coordinates.Photo/Video Evidence: Allow uploading direct multimedia evidence during FIR filing.Nearest Police Station Map: Integrated map routing to the nearest police station.Chat with Officer: Direct real-time chat channel between citizen and assigned SI.AI Classification: Automated FIR categorization and priority assignment.Blockchain Security: Tamper-proof logging for legal record integrity.
