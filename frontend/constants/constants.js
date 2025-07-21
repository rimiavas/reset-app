// constants/constants.js
import { Platform } from "react-native";

export const API_URL =
    Platform.OS === "web" ? "http://localhost:3000" : "https://6f059808ea63.ngrok-free.app";
