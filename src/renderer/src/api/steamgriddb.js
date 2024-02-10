import SGDB from "steamgriddb";
const BASE_URL = "https://www.steamgriddb.com/api/v2";
const header = {
  Authorization: "Bearer " + import.meta.env.VITE_STEAMGRIDDB_API_KEY,
};

const client = new SGDB({
  key: import.meta.env.VITE_STEAMGRIDDB_API_KEY,
  baseURL: BASE_URL,
});

export async function getGameId(name) {
  const games = await client.searchGame(name);
  if (games.length === 0) {
    throw new Error(`No game found for ${name}`);
  }
  for (let g of games) {
    if (g.name == name) return g.id;
  }
  return games[0].id; //default
}

export async function getGameGrid(id) {
  const grids = await client.getGrids({ type: "game", id: id });
  return grids[0].url;
}

export async function getGameLogo(id) {
  const url = BASE_URL + "/icons/game/" + id;
  const data = await fetch(url, { headers: header }).then((res) => res.json());
  return data.data[0].url;
}

export async function getGameHeroe(id) {
  const url = BASE_URL + "/heroes/game/" + id;
  const data = await fetch(url, { headers: header }).then((res) => res.json());
  return data.data[0].url;
}
