// constants/constants.js
import { Platform } from "react-native";

export const API_URL =
    Platform.OS === "web" ? "http://localhost:3000" : "https://6b3a09f33e03.ngrok-free.app";
