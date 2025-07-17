// constants/constants.js
import { Platform } from "react-native";

export const API_URL =
    Platform.OS === "web" ? "http://localhost:3000" : "https://cac32824ab30.ngrok-free.app";
