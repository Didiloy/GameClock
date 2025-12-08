export function calculateWrappedStats(sessions, games, teams, year, ids_of_team) {
  // Filter sessions for the specified year
  const yearSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.date * 1000);
    return sessionDate.getFullYear() === year;
  });

  if (yearSessions.length === 0) {
    return null;
  }

  // 1. Total time played
  const totalTime = yearSessions.reduce((acc, s) => acc + s.duration, 0);

  // 2. Number of games played (unique games)
  const uniqueGames = new Set(yearSessions.map((s) => s.game.id));
  const numberOfGames = uniqueGames.size;

  // Helper to aggregate data by game
  const gameStats = {};
  yearSessions.forEach((session) => {
    const gameId = session.game.id;
    if (!gameStats[gameId]) {
      const gameObj = games.find((g) => g.id === gameId);
      gameStats[gameId] = {
        id: gameId,
        name: gameObj ? gameObj.name : "Unknown",
        duration: 0,
        sessions: 0,
        totalJoyrate: 0,
        sessionsWithJoyrate: 0,
        image: gameObj ? gameObj.grid : "", // Assuming game object has image/logo
        logo: gameObj ? gameObj.logo : "",
      };
    }
    gameStats[gameId].duration += session.duration;
    gameStats[gameId].sessions += 1;
    if (session.was_cool !== undefined && session.was_cool !== null) {
      gameStats[gameId].totalJoyrate += session.was_cool ? 1 : 0;
      gameStats[gameId].sessionsWithJoyrate += 1;
    }
  });

  const gameStatsArray = Object.values(gameStats);

  // 3. Top 5 games by time
  const topGamesByTime = [...gameStatsArray]
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5);

  // 4. Top 5 games by session count
  const topGamesBySessions = [...gameStatsArray]
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5);

  // 5. Fun stats (Best/Worst/Avg)
  // Calculate average joyrate for each game (min 3 sessions to be significant?)
  const gamesWithJoyrate = gameStatsArray.filter(
    (g) => g.sessionsWithJoyrate > 0,
  );
  gamesWithJoyrate.forEach((g) => {
    g.averageJoyrate = g.totalJoyrate / g.sessionsWithJoyrate;
  });

  const mostFunGame =
  gamesWithJoyrate.length > 0
    ? gamesWithJoyrate.reduce((prev, current) => {
        if (current.averageJoyrate > prev.averageJoyrate) {
          return current;
        }
        if (
          current.averageJoyrate === prev.averageJoyrate &&
          current.duration > prev.duration
        ) {
          return current;
        }
        return prev;
      })
    : null;

    const leastFunGame =
    gamesWithJoyrate.length > 0
      ? gamesWithJoyrate.reduce((prev, current) => {
          if (current.averageJoyrate < prev.averageJoyrate) {
            return current;
          }
          if (
            current.averageJoyrate === prev.averageJoyrate &&
            current.duration < prev.duration
          ) {
            return current;
          }
          return prev;
        })
      : null;


  // 6. Game with highest average session duration
  const gamesWithAvg = gameStatsArray
    .filter((g) => g.sessions > 0)
    .map((g) => ({
      ...g,
      avgDuration: g.duration / g.sessions,
    }));

  const highestAvgDurationGame =
    gamesWithAvg.length > 0
      ? gamesWithAvg.reduce((prev, current) =>
          prev.avgDuration > current.avgDuration ? prev : current,
        )
      : null;

  const topLongestAvgGames = gamesWithAvg
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, 3);

  // 7. Time Patterns (Day/Week/Month)
  const dayStats = {}; // "YYYY-MM-DD" -> duration
  const monthStats = {}; // Month Index (0-11) -> duration
  // Week calculation is a bit more complex, can approximate or use ISO week

  yearSessions.forEach((session) => {
    const date = new Date(session.date * 1000);
    const dayKey = date.toISOString().split("T")[0];
    const monthKey = date.getMonth();

    dayStats[dayKey] = (dayStats[dayKey] || 0) + session.duration;
    monthStats[monthKey] = (monthStats[monthKey] || 0) + session.duration;
  });

  const mostPlayedDayEntry = Object.entries(dayStats).reduce((a, b) =>
    a[1] > b[1] ? a : b,
  );
  const mostPlayedDay = {
    date: mostPlayedDayEntry[0],
    duration: mostPlayedDayEntry[1],
  };

  const mostPlayedMonthEntry = Object.entries(monthStats).reduce((a, b) =>
    a[1] > b[1] ? a : b,
  );
  const mostPlayedMonth = {
    month: parseInt(mostPlayedMonthEntry[0]),
    duration: mostPlayedMonthEntry[1],
  };
  
    // Most played week (simple ISO week approximation)
    const weekStats = {};
    yearSessions.forEach((session) => {
        const date = new Date(session.date * 1000);
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
        const monday = new Date(d);
        monday.setUTCDate(d.getUTCDate() - 3);
        const sunday = new Date(monday);
        sunday.setUTCDate(monday.getUTCDate() + 6);

        const format = (dt) =>
          dt.getUTCDate().toString().padStart(2, "0") + "/" +
          (dt.getUTCMonth() + 1).toString().padStart(2, "0") + "/" +
          dt.getUTCFullYear();
  
      const weekKey = `${format(monday)} -> ${format(sunday)}`;
        
        weekStats[weekKey] = (weekStats[weekKey] || 0) + session.duration;
    });

    
    const mostPlayedWeekEntry = Object.entries(weekStats).reduce((a, b) => a[1] > b[1] ? a : b, ["", 0]);
    const mostPlayedWeek = {
        week: mostPlayedWeekEntry[0],
        duration: mostPlayedWeekEntry[1]
    }

  // Active / Calm day of week
  const weekdayStats = {};
  yearSessions.forEach((session) => {
    const date = new Date(session.date * 1000);
    const weekday = date.getDay(); // 0=Sun ... 6=Sat
    weekdayStats[weekday] = (weekdayStats[weekday] || 0) + session.duration;
  });
  const entriesWeekday = Object.entries(weekdayStats);
  const mostActiveDayOfWeekEntry =
    entriesWeekday.length > 0
      ? entriesWeekday.reduce((a, b) => (a[1] > b[1] ? a : b))
      : ["", 0];
  const leastActiveDayOfWeekEntry =
    entriesWeekday.length > 0
      ? entriesWeekday.reduce((a, b) => (a[1] < b[1] ? a : b))
      : ["", 0];


  // 8. Social (Best Friend)
  
  const friendStats = {};
  
  yearSessions.forEach((session) => {
    const otherTeams = session.teams.filter(tId => !ids_of_team.map(t => t.id).includes(tId));
    
    otherTeams.forEach(friendId => {
        if (!friendStats[friendId]) {
             const teamObj = teams.find(t => t.id === friendId);
             friendStats[friendId] = {
                 id: friendId,
                 name: teamObj ? teamObj.name : "Unknown",
                 count: 0
             };
         }
         friendStats[friendId].count += 1;
    });
  });
  
  const sortedFriends = Object.values(friendStats).sort((a, b) => b.count - a.count);
  const bestFriends = sortedFriends.slice(1, 6);

  // 9. First and last game played in the year
  const sortedByDate = [...yearSessions].sort(
    (a, b) => a.date - b.date,
  );
  const firstSession = sortedByDate[0];
  const lastSession = sortedByDate[sortedByDate.length - 1];
  const firstGame = firstSession
    ? games.find((g) => g.id === firstSession.game.id) || {
        id: firstSession.game.id,
        name: "Unknown",
        grid: "",
        logo: "",
      }
    : null;
  const lastGame = lastSession
    ? games.find((g) => g.id === lastSession.game.id) || {
        id: lastSession.game.id,
        name: "Unknown",
        grid: "",
        logo: "",
      }
    : null;

  return {
    year,
    totalTime,
    numberOfGames,
    topGamesByTime,
    topGamesBySessions,
    mostFunGame,
    leastFunGame,
    highestAvgDurationGame,
    topLongestAvgGames,
    mostPlayedDay,
    mostPlayedWeek,
    mostPlayedMonth,
    bestFriends: bestFriends,
    firstGameOfYear: firstGame
      ? {
          id: firstGame.id,
          name: firstGame.name,
          date: firstSession.date,
          image: firstGame.grid || firstGame.image || "",
          logo: firstGame.logo || "",
        }
      : null,
    lastGameOfYear: lastGame
      ? {
          id: lastGame.id,
          name: lastGame.name,
          date: lastSession.date,
          image: lastGame.grid || lastGame.image || "",
          logo: lastGame.logo || "",
        }
      : null,
    mostActiveDayOfWeek: {
      index: parseInt(mostActiveDayOfWeekEntry[0] || "0", 10),
      duration: mostActiveDayOfWeekEntry[1],
    },
    leastActiveDayOfWeek: {
      index: parseInt(leastActiveDayOfWeekEntry[0] || "0", 10),
      duration: leastActiveDayOfWeekEntry[1],
    },
  };
}

