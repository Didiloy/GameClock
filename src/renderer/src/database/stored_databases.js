const stored_databases_name = "stored_databases";

export function getStoredDatabases() {
  const stored_databases = JSON.parse(
    localStorage.getItem(stored_databases_name)
  );
  if (stored_databases === null || stored_databases === undefined) {
    return [];
  }
  return stored_databases;
}

export function addDatabase(
  name,
  apiKey,
  authDomain,
  databaseURL,
  projectId,
  storageBucket,
  messagingSenderId,
  appId
) {
  let stored_databases = JSON.parse(
    localStorage.getItem(stored_databases_name)
  );
  if (stored_databases === null) {
    stored_databases = [];
  }
  let obj = {
    name: name,
    apiKey: apiKey,
    authDomain: authDomain,
    databaseURL: databaseURL,
    projectId: projectId,
    storageBucket: storageBucket,
    messagingSenderId: messagingSenderId,
    appId: appId,
  };

  stored_databases.push(obj);
  localStorage.setItem(stored_databases_name, JSON.stringify(stored_databases));
}

export function deleteDatabase(name, apiKey, authDomain) {
  let stored_databases = JSON.parse(
    localStorage.getItem(stored_databases_name)
  );
  if (stored_databases === null) {
    return;
  }
  for (let database of stored_databases) {
    if (
      name === database.name &&
      apiKey === database.apiKey &&
      authDomain === database.authDomain
    ) {
      stored_databases.splice(stored_databases.indexOf(database), 1);
      localStorage.setItem(
        stored_databases_name,
        JSON.stringify(stored_databases)
      );
      return;
    }
  }
}
