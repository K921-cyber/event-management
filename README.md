# 🎪 EventFlow — Event Management System

> **A complete web app where people can create events, sell tickets, and check guests in at the door — all in one place.**

---

## 📖 What is this project?

EventFlow is a **full-stack web application** built with the **MERN stack** (MongoDB, Express, React, Node.js). Think of it as a mini version of Eventbrite or Ticketmaster.

The app has **two types of users**:

| User Type | What they can do |
|-----------|-----------------|
| **🎪 Organizer** | Create events, set ticket prices, publish events live, view sales charts, and scan QR tickets at the venue entrance |
| **👤 Attendee** | Browse events, book free tickets, view tickets with a QR code, and get checked in at the door |

---

## ✨ What can you actually do with it?

Here's every feature, explained simply:

### 1️⃣ User Accounts
- **Sign up** — Create an account as either an **Attendee** or an **Organizer**
- **Log in / Log out** — Standard login with email and password
- **Your profile** — The app remembers who you are

### 2️⃣ Events (for Organizers)
- **Create an event** — Add a title, description, venue location (name, address, city), date/time, and ticket types
- **Ticket Tiers** — You can sell different types of tickets (e.g. "General Admission" for $20, "VIP" for $50, "Early Bird" for $15). Each tier has its own price and quantity limit.
- **Draft & Publish** — Events start as "draft" (hidden from public). When you're ready, click **Publish** to make it visible to attendees.
- **Edit or Delete** — You can update or remove your own events

### 3️⃣ Browsing & Booking (for Attendees)
- **Browse events** — See all published events on the homepage, filter by category or city
- **Search events** — Search by event name or description
- **Event details page** — Click any event to see full details and book tickets
- **Choose tickets** — Pick a ticket type and how many you want
- **Free tickets** — Tickets are free! Click **"Get Free Ticket"** and your booking is instantly confirmed with a QR code — no payment needed
- **My Tickets page** — Your ticket appears here with a **QR code** ready for scanning

### 4️⃣ QR Code Check-in (for Organizers)
- Every confirmed booking gets a **unique, signed QR code** that cannot be faked or copied
- On the event day, the organizer opens the **Check-in page** and uses their phone/laptop camera to scan attendee QR codes
- The system instantly tells you: ✅ **Valid ticket** or ❌ **Invalid / Already used**
- You can also paste the QR code text manually for testing
- If someone tries to scan the same ticket twice, the system rejects it

### 5️⃣ Analytics Dashboard (for Organizers)
- See **how much money** you've made per event
- See **how many tickets** you've sold out of total capacity
- See **how many people** have checked in
- **Charts** show:
  - 💰 **Sales over time** (line chart)
  - 📊 **Revenue by ticket tier** (bar chart)

### 6️⃣ Real-time Updates
- When someone buys a ticket, the organizer's dashboard updates **automatically** (no need to refresh the page) using **Socket.io**
- Same for check-ins — they show up live

---

## 🧱 How is the project structured?

```
event-management-system/
│
├── backend/                        # The server (API) - runs on port 5000
│   ├── config/db.js                # Connects to MongoDB database
│   ├── models/                     # Database schemas
│   │   ├── User.js                 # User accounts (name, email, password, role)
│   │   ├── Event.js                # Events (title, date, venue, ticket tiers)
│   │   └── Booking.js              # Bookings (who bought what, payment status, QR secret)
│   ├── controllers/                # The actual logic of each feature
│   │   ├── authController.js       # Register, login, get profile
│   │   ├── eventController.js      # Create, edit, delete, list events
│   │   ├── bookingController.js    # Create bookings, generate QR codes
│   │   ├── checkinController.js    # Scan and verify QR codes
│   │   └── analyticsController.js  # Revenue/sales reports
│   ├── routes/                     # API endpoint definitions
│   ├── middleware/                  # Auth guard, error handling
│   ├── utils/qr.js                 # QR code generation & verification (signed with HMAC)
│   └── server.js                   # App entry point - wires everything together
│
├── frontend/                       # The website (UI) - runs on port 5173
│   └── src/
│       ├── api/client.js           # Handles all API calls to the backend
│       ├── context/AuthContext.jsx  # Manages login/logout state
│       ├── components/             # Reusable UI pieces
│       │   ├── Navbar.jsx          # Top navigation bar
│       │   ├── CreateEventForm.jsx # Form to create new events
│       │   └── AnalyticsPanel.jsx  # Charts for revenue and sales
│       ├── pages/                  # Full pages of the website
│       │   ├── EventsList.jsx      # Browse all events (homepage)
│       │   ├── EventDetail.jsx     # Event details + ticket purchase
│       │   ├── Login.jsx           # Log in page
│       │   ├── Register.jsx        # Sign up page
│       │   ├── MyTickets.jsx       # Your purchased tickets with QR codes
│       │   ├── OrganizerDashboard.jsx  # Create events + view analytics
│       │   └── CheckInScanner.jsx  # Camera-based QR code scanner
│       └── index.css               # All the styling
│
└── README.md                       # This file!
```

---

## 🔐 How the secure QR check-in works

This is one of the most interesting parts of the app, so here's a simple explanation:

1. When a ticket is **booked**, the server creates a **secret code** (called `qrSecret`) that only the server knows. It's stored in the database for that specific booking.
2. The server then creates a QR code that contains:
   - The booking ID
   - A **digital signature** (like a tamper-proof seal) made by combining the booking ID + secret + a server-only password (`QR_SECRET`)
3. When an organizer **scans the QR code**, the server:
   - Reads the booking ID
   - Re-computes the signature using its secrets
   - If the signatures **match**, the ticket is **genuine**
   - If they **don't match**, someone forged the QR code
4. The system also checks if the ticket was **already used** — no duplicate entries!

This means nobody can create a fake QR code or copy someone else's ticket.

---

## 🛠️ What do I need to install to run this?

Here's everything you need, from start to finish:

### ✅ Required Software

| Software | What it's for | Where to get it |
|----------|--------------|-----------------|
| **Node.js** (version 18 or higher) | Runs both the backend server and frontend | [nodejs.org](https://nodejs.org/) |
| **MongoDB** | Stores all data (users, events, bookings) | See options below 👇 |
### 📦 MongoDB Options

**Option A: Local install**
- Install MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- After installation, run `mongod --dbpath ./data` to start the database

**Option B: Docker (easiest)**
```bash
docker run -d -p 27017:27017 mongo
```

**Option C: MongoDB Atlas (cloud, free tier — no installation needed)**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a cluster (free M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (it looks like `mongodb+srv://...`)

---

## 🚀 Step-by-step installation guide

### Step 1: Install Node.js
Download from [nodejs.org](https://nodejs.org/) and install. This also installs **npm** (Node Package Manager).

Verify it worked:
```bash
node --version    # Should show v18 or higher
npm --version     # Should show something
```

### Step 2: Install MongoDB

**Local install (recommended):**
- Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- After installation, find `mongod.exe` in `C:\Program Files\MongoDB\Server\<version>\bin\`
- Create a `data` folder in your project and run:
  ```bash
  "C:\Program Files\MongoDB\Server\8.0\bin\mongod" --dbpath ./data
  ```

**Or use Docker:**
```bash
docker run -d -p 27017:27017 mongo
```

**Or use MongoDB Atlas** (free cloud, no installation):
- Get your connection string from [mongodb.com/atlas](https://www.mongodb.com/atlas)

### Step 3: Set up the Backend

Open a terminal in the project folder:

```bash
# Go into the backend folder
cd backend

# Install all the required packages
npm install
```

Now create a file called `.env` inside the `backend` folder with the following content:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventflow
JWT_SECRET=make_up_a_random_secret_string_here
QR_SECRET=make_up_another_random_secret_string_here
```

> **Note:** `JWT_SECRET` and `QR_SECRET` can be anything — just type random characters. No payment keys needed!

### Step 4: Start the Backend

```bash
npm start
```

You should see:
```
Server running on port 5000
MongoDB connected: ...
```

### Step 5: Set up the Frontend

Open a **new terminal**:

```bash
# Go into the frontend folder
cd frontend

# Install all required packages
npm install

# Create a .env file (optional — defaults work fine)
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### Step 6: Start the Frontend

```bash
npm run dev
```

You should see:
```
VITE v5.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 7: Open the app!

Open your web browser and go to:
```
http://localhost:5173
```

---

## 🎮 How to test the whole thing end-to-end

Follow these steps to see everything working:

### 1. Create an Organizer account
- Click **"Sign up"** in the top navigation
- Fill in your name, email, and password
- Select **"Organizer"** as the role
- Click Sign Up — you'll be logged in automatically

### 2. Create an event
- Click **"Dashboard"** in the navigation
- Click **"+ New event"**
- Fill in:
  - **Title:** "My Test Concert"
  - **Description:** "A great test event"
  - **Venue name:** "City Hall"
  - **City:** "New York"
  - **Address:** "123 Main St"
  - **Category:** "Music"
  - **Start/End dates:** pick a future date/time
  - **Ticket tiers:** add "General" ($20, 100 tickets) and "VIP" ($50, 50 tickets)
- Click **"Create event (as draft)"**
- The event is now created but hidden from the public

### 3. Publish the event
- Click the **"Publish event"** button
- Now the event is visible to everyone

### 4. Create an Attendee account
- Click **"Log out"** (top right)
- Click **"Sign up"** again
- Use a different email address
- Leave the role as **"Attendee"**
- Sign up

### 5. Browse and book a free ticket
- You should see the event on the homepage
- Click on it to see details
- Pick a ticket type (e.g. "General") and quantity (e.g. 2)
- Click **"Get Free Ticket"** — the booking is confirmed instantly!
- Your QR code appears right on the confirmation screen

### 6. View your ticket with QR code
- Click **"Go to My Tickets"**
- You'll see your booking with a **QR code** displayed
- This is the ticket you'll show at the door

### 7. Check in (as the Organizer)
- Click **"Log out"**
- Log back in as the **Organizer** account you created earlier
- Click **"Check-in"** in the navigation
- You can either:
  - **Scan the QR code** with your camera (click "Start camera scan")
  - **Or paste the QR payload manually** for testing
- Click **"Verify"**
- You should see: ✅ **Valid ticket — General × 2**
- Try scanning again — it should say ❌ **Ticket already used**

### 8. Check the Dashboard
- Click **"Dashboard"** in the navigation
- Select your event from the dropdown
- You'll see:
  - Total tickets sold (2 out of 150)
  - Checked in (1)
  - A chart showing sales over time
  - A chart showing revenue by ticket tier

---

## 🔧 Troubleshooting

| Problem | Likely Fix |
|---------|-----------|
| **Backend says "MongoDB connection error"** | Make sure MongoDB is running (`docker ps` if using Docker, or check your Atlas connection string) |
| **QR code not showing** | Try refreshing the page. If it still doesn't appear, check the browser console for errors |
| **Frontend can't connect to backend** | Make sure `VITE_API_URL` in `frontend/.env` matches the backend URL (should be `http://localhost:5000`) |
| **CORS error in browser** | Check that the backend is running on port 5000 and the frontend on port 5173 |
| **"Not authorized" errors** | Make sure you're logged in with the correct account type (organizer for dashboard/check-in, attendee for buying tickets) |

---

## 🧰 Tech Stack (for developers)

| Technology | What it does |
|-----------|-------------|
| **React 18** | Frontend UI framework |
| **Vite** | Fast development server for the frontend |
| **React Router v6** | Page navigation |
| **Axios** | Making API calls from frontend to backend |
| **Express.js** | Backend web server |
| **MongoDB + Mongoose** | Database and data modeling |
| **JWT (JSON Web Tokens)** | User authentication |
| **Socket.io** | Real-time updates (live sales, check-ins) |
| **Recharts** | Charts and graphs for the analytics dashboard |
| **html5-qrcode** | Camera-based QR code scanning |
| **bcryptjs** | Password hashing |
| **qrcode** | Generating QR code images |

---

## 📝 API Endpoints (summary)

| Method | Endpoint | What it does | Who can access |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create an account | Anyone |
| POST | `/api/auth/login` | Log in | Anyone |
| GET | `/api/auth/me` | Get your profile | Logged-in users |
| GET | `/api/events` | List published events | Anyone |
| GET | `/api/events/:id` | Get event details | Anyone |
| GET | `/api/events/mine/list` | Get organizer's events | Organizer |
| POST | `/api/events` | Create an event | Organizer |
| PUT | `/api/events/:id` | Update an event | Organizer (owner) |
| DELETE | `/api/events/:id` | Delete an event | Organizer (owner) |
| POST | `/api/bookings/checkout` | Book free tickets (instant confirm) | Logged-in users |
| GET | `/api/bookings/mine` | Get your bookings | Logged-in users |
| GET | `/api/bookings/:id` | Get booking details | Owner or organizer |
| POST | `/api/checkin/scan` | Scan a QR ticket | Organizer |
| GET | `/api/checkin/event/:id/stats` | Get check-in stats | Organizer |
| GET | `/api/analytics/event/:id/summary` | Revenue summary | Organizer (owner) |
| GET | `/api/analytics/event/:id/sales-over-time` | Sales chart data | Organizer (owner) |
| GET | `/api/analytics/event/:id/revenue-by-tier` | Revenue by tier | Organizer (owner) |

---



## 🎯 What you've built

When everything is running, you have a fully functional **event management platform** that can:

- 🎫 **Book free tickets** with instant QR code generation
- 🔐 **Generate secure QR codes** that can't be forged
- 📱 **Scan tickets at the door** using any camera
- 📊 **Show live analytics** of attendance and ticket sales
- ⚡ **Update in real-time** as bookings and check-ins happen

---

> Built with ❤️ using the MERN stack (MongoDB, Express, React, Node.js)
