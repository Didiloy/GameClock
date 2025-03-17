import { app, BrowserWindow, shell, ipcMain } from "electron";
import { join } from "path";
import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import {
  barChartAllGames,
  gamesFunPercentage,
  playtimeHome,
  pieChartGamePercentage,
  doughnutChartPlatform,
  lineChartByMonth,
  lineChartPlayerOfTheWeek,
  lineChartLastMonth,
} from "./graphs";
import { teamList } from "./team_list";
import { addSessionCountToGames, singleGameStats } from "./games_settings";
import { dashboardteam } from "./dashboardteam";

const { Tray, Menu } = require("electron/main");
let tray;

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 650,
    minHeight: 600,
    minWidth: 950,
    show: false,
    autoHideMenuBar: true,
    icon: icon,
    frame: false,
    roundedCorners: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      webSecurity: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  ipcMain.on("maximize", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on("minimize", () => {
    mainWindow.minimize();
  });

  //Graphs
  ipcMain.on("playtimehome", (event, data) => {
    const result = playtimeHome(data);
    BrowserWindow.getAllWindows()[0].webContents.send(
      "result_playtimehome",
      result,
    );
  });

  ipcMain.on("barchartallgames", (event, data) => {
    const { games_names, sessions_number, averages_duration } =
      barChartAllGames(
        data.ids_of_team,
        data.team_name,
        data.games,
        data.sessions,
      );
    BrowserWindow.getAllWindows()[0].webContents.send(
      "result_barchartallgames",
      { games_names, sessions_number, averages_duration },
    );
  });

  ipcMain.on("gamesfunpercentage", (event, data) => {
    const { games_names, fun_percentage, neutral_percentage, bad_percentage } =
      gamesFunPercentage(data.ids_of_team, data.games, data.sessions);
    BrowserWindow.getAllWindows()[0].webContents.send(
      "result_gamesfunpercentage",
      { games_names, fun_percentage, neutral_percentage, bad_percentage },
    );
  });

  ipcMain.on("piechartgamepercentage", (event, data) => {
    const { games_name, games_percentage, games_playtime } =
      pieChartGamePercentage(data.ids_of_team, data.games, data.sessions);
    BrowserWindow.getAllWindows()[0].webContents.send(
      "result_piechartgamepercentage",
      { games_name, games_percentage, games_playtime },
    );
  });

  ipcMain.on("doughnutchartplatform", (event, data) => {
    const {
      platforms_name,
      platform_percentage,
      platform_playtime,
      platform_number_of_sessions,
    } = doughnutChartPlatform(data.ids_of_team, data.platforms, data.sessions);
    BrowserWindow.getAllWindows()[0].webContents.send(
      "result_doughnutchartplatform",
      {
        platforms_name,
        platform_percentage,
        platform_playtime,
        platform_number_of_sessions,
      },
    );
  });

  ipcMain.on("linechartgamebymonth", (event, data) => {
    const {
      labels_year_month,
      game_duration_by_year_month,
      joyrate_by_year_month,
    } = lineChartByMonth(data.ids_of_team, data.sessions);
    BrowserWindow.getAllWindows()[0].webContents.send(
      "result_linechartgamebymonth",
      {
        labels_year_month,
        game_duration_by_year_month,
        joyrate_by_year_month,
      },
    );
  });

  ipcMain.on("linechartplayeroftheweek", (event, data) => {
    const { labels_dates, map_player_time_played } = lineChartPlayerOfTheWeek(
      data.sessions,
      data.teams,
    );
    BrowserWindow.getAllWindows()[0].webContents.send(
      "result_linechartplayeroftheweek",
      {
        labels_dates,
        map_player_time_played,
      },
    );
  });

  //teams
  ipcMain.on("teamlist", (event, data) => {
    const teams = teamList(data.teams, data.sessions, data.games);
    BrowserWindow.getAllWindows()[0].webContents.send("result_teamlist", {
      teams,
    });
  });

  ipcMain.on("gamesessionscount", (event, data) => {
    const games_values = addSessionCountToGames(data.games, data.sessions);
    BrowserWindow.getAllWindows()[0].webContents.send(
      "result_gamesessionscount",
      {
        games_values,
      },
    );
  });

  ipcMain.on("singlegamestats", (event, data) => {
    let {
      gameId,
      _total_sessions,
      _longuest_session,
      _smallest_session,
      _average_session,
      _team_who_play_the_most,
      _total_playtime,
    } = singleGameStats(data.game_id, data.sessions, data.teams);
    BrowserWindow.getAllWindows()[0].webContents.send(
      "result_singlegamestats",
      {
        gameId,
        _total_sessions,
        _longuest_session,
        _smallest_session,
        _average_session,
        _team_who_play_the_most,
        _total_playtime,
      },
    );
  });

  ipcMain.on("dashboardteam", (event, data) => {
    const {
      team_time,
      sessions_number,
      number_of_games,
      total_fun_percentage,
      team_average_session_duration,
      biggest_session,
      game_of_biggest_session,
      max_day,
      max_duration,
    } = dashboardteam(data.ids_of_team, data.games, data.sessions, data.teams);
    BrowserWindow.getAllWindows()[0].webContents.send("result_dashboardteam", {
      team_time,
      sessions_number,
      number_of_games,
      total_fun_percentage,
      team_average_session_duration,
      biggest_session,
      game_of_biggest_session,
      max_day,
      max_duration,
    });
  });

  ipcMain.on("linechartlastmonth", (event, data) => {
    const { labels_dates, map_player_time_played } = lineChartLastMonth(
      data.sessions,
      data.teams,
    );
    BrowserWindow.getAllWindows()[0].webContents.send(
      "result_linechartlastmonth",
      {
        labels_dates,
        map_player_time_played,
      },
    );
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.github.Didiloy");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: "Quitter", type: "normal", click: () => app.quit() },
  ]);
  tray.setToolTip("GameClock");
  tray.setTitle("GameClock");
  tray.setContextMenu(contextMenu);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("close", () => {
  app.quit();
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
