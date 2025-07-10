// constants/constants.js
import { Platform } from "react-native";

export const API_URL =
    Platform.OS === "web" ? "http://localhost:3000" : "https://8f9de12014b2.ngrok-free.app";
