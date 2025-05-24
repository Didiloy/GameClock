import { getPreferences, setPreferences } from "../../preferences/preferences";

const BASE_URL = import.meta.env.VITE_LINKMI_BASE_API_URL;
const LINKMI_API_KEY = getPreferences("linkmi_apikey");

export async function addLastSessionToLinkmi() {
  const data = await fetch(`${BASE_URL}/widgets/gameclock/last-session`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${LINKMI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }).then((res) => res.json());
  return data.data[0];
}

export async function setLinkmiPlayingStatus(status) {
  const data = await fetch(`${BASE_URL}/widgets/gameclock/playing-status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${LINKMI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }).then((res) => res.json());
  return data.data[0];
}