// Application de bureau : une fenêtre qui affiche la page, et le relais vers le planning Omnes.
const { app, BrowserWindow, ipcMain, Menu, net, powerMonitor, session } = require("electron");
const path = require("node:path");

const URL_PLANNING = "https://planning-lyon.omneseducation.com/appelpanneauinformations";
const CACHE_MS = 30 * 1000;
const DEMO = process.argv.includes("--demo");

let fenetre = null;
let cache = { date: 0, contenu: null };

// net.fetch passe par la pile réseau de Chromium : le proxy du système est pris en compte.
async function lirePlanning() {
  if (cache.contenu && Date.now() - cache.date < CACHE_MS) return cache.contenu;

  const response = await net.fetch(URL_PLANNING, {
    method: "POST",
    headers: {
      accept: "*/*",
      "content-type": "text/plain;charset=UTF-8",
      referer: "https://planning-lyon.omneseducation.com/panneauinformations.html",
    },
    body: JSON.stringify({ id: "CITADELLE", init: true }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Le planning a répondu ${response.status}`);

  const data = await response.json();
  const contenu = {
    parametres: { date: data.parametres?.date },
    listeCours: (data.listeCours ?? []).map(({ deb, fin, sal }) => ({ deb, fin, sal })),
  };
  cache = { date: Date.now(), contenu };
  return contenu;
}

function demanderActualisation() {
  cache = { date: 0, contenu: null };
  fenetre?.webContents.send("actualiser");
}

function creerMenu() {
  const surMac = process.platform === "darwin";
  const modele = [
    ...(surMac ? [{ role: "appMenu" }] : []),
    {
      label: "Affichage",
      submenu: [
        { label: "Actualiser le planning", accelerator: "CmdOrCtrl+R", click: demanderActualisation },
        { type: "separator" },
        { label: "Taille réelle", role: "resetZoom" },
        { label: "Agrandir", role: "zoomIn" },
        { label: "Réduire", role: "zoomOut" },
        { type: "separator" },
        { label: "Plein écran", role: "togglefullscreen" },
        { type: "separator" },
        { label: "Outils de diagnostic", role: "toggleDevTools" },
      ],
    },
    ...(surMac ? [{ role: "windowMenu" }] : [{ label: "Fichier", submenu: [{ label: "Quitter", role: "quit" }] }]),
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(modele));
}

function creerFenetre() {
  fenetre = new BrowserWindow({
    width: 1440,
    height: 860,
    minWidth: 420,
    minHeight: 500,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#170b26",
    icon: path.join(__dirname, "build", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // La fenêtre n'affiche que la page de l'application.
  fenetre.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  fenetre.webContents.on("will-navigate", (evenement) => evenement.preventDefault());

  fenetre.once("ready-to-show", () => {
    fenetre.maximize();
    fenetre.show();
  });
  fenetre.on("closed", () => { fenetre = null; });
  fenetre.loadFile(path.join(__dirname, "src", "index.html"), DEMO ? { hash: "demo" } : {});
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!fenetre) return;
    if (fenetre.isMinimized()) fenetre.restore();
    fenetre.focus();
  });

  app.whenReady().then(() => {
    session.defaultSession.setPermissionRequestHandler((_c, _p, reponse) => reponse(false));
    ipcMain.handle("lire-planning", lirePlanning);
    powerMonitor.on("resume", demanderActualisation);
    creerMenu();
    creerFenetre();
    app.on("activate", () => { if (!fenetre) creerFenetre(); });
  });

  app.on("window-all-closed", () => app.quit());
}
