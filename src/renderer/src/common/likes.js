const preferences_name = "liked_sessions";

export function isLiked(id) {
  const liked_sessions = JSON.parse(localStorage.getItem(preferences_name));
  if (liked_sessions === null) {
    return false;
  }
  return liked_sessions.includes(id);
}

export function addSession(id) {
  let liked_sessions = JSON.parse(localStorage.getItem(preferences_name));
  if (liked_sessions === null) {
    liked_sessions = [id];
  }
  liked_sessions.push(id);
  localStorage.setItem(preferences_name, JSON.stringify(liked_sessions));
}

export function removeSession(id) {
  let liked_sessions = JSON.parse(localStorage.getItem(preferences_name));
  if (liked_sessions === null) {
    return;
  }
  liked_sessions = liked_sessions.filter((session) => session !== id);
  localStorage.setItem(preferences_name, JSON.stringify(liked_sessions));
}
