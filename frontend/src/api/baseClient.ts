import axios from "axios";

export const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export function createBaseClient() {
  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

