// Seul pont entre la page et l'application : lire le planning et être prévenu d'une actualisation.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("citadelle", {
  lirePlanning: () => ipcRenderer.invoke("lire-planning"),
  surActualisation: (rappel) => ipcRenderer.on("actualiser", () => rappel()),
});
