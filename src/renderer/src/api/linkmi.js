const BASE_URL = import.meta.env.VITE_LINKMI_BASE_API_URL;
const header = {
  Authorization: "Bearer " + import.meta.env.VITE_STEAMGRIDDB_API_KEY,
};

export async function updateLinkmiGameclockWidget(linkmiApiKey) {
  const data = await fetch(`${BASE_URL}/widgets/gameclock`, {
    headers: {
      'Authorization': `Bearer ${linkmiApiKey}`,
      'Content-Type': 'application/json'
    }
  }).then((res) => res.json());
  return data.data[0];
}