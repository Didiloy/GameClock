export function playtimeHome(values) {
  let teams_to_return = [];
  for (const team of values.teams) {
    teams_to_return.push({
      name: team.name,
      playtime: values.sessions.reduce((acc, s) => {
        if (s.team.id === team.id) {
          return acc + s.duration;
        }
        return acc;
      }, 0),
    });
  }
  return teams_to_return.sort((a, b) => {
    return b.playtime - a.playtime;
  });
}
