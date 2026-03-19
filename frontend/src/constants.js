export const CITIES = [
  "Ahmedabad",
  "Bengaluru",
  "Bhopal",
  "Chennai",
  "Delhi",
  "Ghaziabad",
  "Hyderabad",
  "Indore",
  "Jaipur",
  "Kanpur",
  "Kolkata",
  "Lucknow",
  "Ludhiana",
  "Mumbai",
  "Nagpur",
  "Patna",
  "Pune",
  "Surat",
  "Vadodara",
  "Visakhapatnam",
].sort();

const defaultApiHost =
  typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";

export const API_URL =
  import.meta.env.VITE_API_URL ?? `http://${defaultApiHost}:8000`;
