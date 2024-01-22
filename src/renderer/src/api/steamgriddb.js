import SGDB from "steamgriddb";
const client = new SGDB(import.meta.env.VITE_STEAMGRIDDB_API_KEY);

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
