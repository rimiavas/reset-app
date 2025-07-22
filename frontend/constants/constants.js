// constants/constants.js
import { Platform } from "react-native";

export const API_URL =
    Platform.OS === "web"
        ? "http://www.doc.gold.ac.uk/usr/215"
        : "http://www.doc.gold.ac.uk/usr/215";
