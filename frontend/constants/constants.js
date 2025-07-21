// constants/constants.js
import { Platform } from "react-native";

export const API_URL =
    Platform.OS === "web" ? "http://localhost:3000" : "https://b0dbe72914de.ngrok-free.app";
