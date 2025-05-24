import { getPreferences } from "../preferences/preferences";

const BASE_URL = import.meta.env.VITE_LINKMI_BASE_API_URL;
const LINKMI_API_KEY = getPreferences("linkmi_apikey");

export async function addLastSessionToLinkmi(gameName, duration, was_cool, comment, platform, date) {
  await fetch(`${BASE_URL}/widgets/gameclock/last-session`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${LINKMI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      gameName, duration, was_cool, comment, platform, date
    })
  });
}

export async function setLinkmiPlayingStatus(status) {
  await fetch(`${BASE_URL}/widgets/gameclock/playing-status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${LINKMI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status,
      changed_at: new Date().toString()
    })
  })
}