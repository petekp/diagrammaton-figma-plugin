import { BASE_URL_DEV, BASE_URL_PROD } from "../constants";

export function generateTimeBasedUUID() {
  const time = Date.now();
  const uuid = "x2xxyxxz".replace(/[xy]/g, (c) => {
    const r = (time + Math.random() * 16) % 16 | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

export function isDevEnv() {
  return process.env.NODE_ENV === "development";
}

export function getBaseUrl() {
  return isDevEnv() ? BASE_URL_DEV : BASE_URL_PROD;
}
