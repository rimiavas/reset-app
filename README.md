# Reset App

Final project for Creative Computing: "Reset" a student well-being/tracking app

## Tech Stack

-   **Frontend:** React Native (Expo)
-   **Backend:** Node.js, Express
-   **Database:** MongoDB

## Features (MVP)

-   Daily Habit Tracker
-   Task Planner with Calendar

## Setup

1. Clone the repo
2. Navigate to `frontend` or `backend` to run each app

3.1 Start the backend API in terminal

-   "cd backend" and then
-   "node server.js"

3.2 Expose API with Ngrok (if testing on phone)

-   Start Ngrok in terminal "ngrok http 3000"
-   You’ll get a forwarding URL like:
    Forwarding: https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3000
-   go to the "backend" folder -> "constants" folder -> update "constants.js" this line "export const API_URL =
    Platform.OS === "web" ? "http://localhost:3000" : "https://xxxx.ngrok-free.app"; add the forwarding URL
    "
    3.3 Start the React Native App (Expo)
-   in terminal "cd frontend" and then start the expo "npx expo start"
    -This will open up the Expo DevTools in your browser.

*To run on Web: Press w
*To run on Android: Press a (or scan the QR with Expo Go)
\*To run on iOS (Mac only): Press i

## Folder Structure
