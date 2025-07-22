# Reset App

Final project for Creative Computing:
"Reset" a student well-being tracker built with React Native (Expo) on the frontend and a Node.js/Express backend. MongoDB is used for data storage.

## Features

-   Daily habit tracker
-   Create tasks plan with Calendar
-   Keep Track of Mood by logging and Journal

## Setup

1. Clone the repo
2. Navigate to `frontend` or `backend` to run each.

3.1 Backend Setup

-   Install dependencies:

`cd backend
npm install`

-   Create a .env file in backend/ based on `.env.example`. It should contain::

`MONGO_URI=<your MongoDB connection string>
PORT= <your PORT here>`

-   Start the API:

`node server.js`

This will listen on the port defined by PORT or default to 3000.

3.2 [Optional]For when testing backend on phone only with Ngrok.

-   Install ngrok

`npm install -g ngrok`

This will install ngrok globally

-   Start Ngrok from any terminal

`ngrok http 3000` or `ngrok http <YOUR PORT>`
You’ll get a forwarding URL like:

`Forwarding: https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:<YOUR PORT>`

Copy the HTTPS forwarding URL it gives you.

-   Update constants.js in frontend/constants/constants.js
    `export const API_URL =
    Platform.OS === "web" ? "http://localhost:<YOUR PORT>" : "https://xxxx.ngrok-free.app";` <= update this with the forwarding URL received in the pervious step.

    3.3 Frontend Setup

-   Install dependencies:
    `cd frontend
npm install`

-   Make sure you adjust API endpoint in frontend/constants/constants.js. Set API_URL to the URL of your running backend(either ngrok URL or deployed server URL):

-   Start the Expo server:
    `npx expo start`

To run on Web: Press w
To run on Android: Press a (or scan the QR with Expo Go app)
To run on iOS (Mac only): Press i
