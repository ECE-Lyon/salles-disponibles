// Sert la page d'affichage et relaie le planning Omnes.
// Le navigateur ne peut pas appeler le planning directement (CORS) : c'est ce serveur qui le fait.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const PORT = process.env.PORT || 3000;
const URL_PLANNING = "https://planning-lyon.omneseducation.com/appelpanneauinformations";
const CACHE_MS = 30 * 1000; // plusieurs écrans peuvent ouvrir la page sans multiplier les appels

let cache = { date: 0, contenu: null };

async function lirePlanning() {
  if (cache.contenu && Date.now() - cache.date < CACHE_MS) return cache.contenu;

  const response = await fetch(URL_PLANNING, {
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
  // La page n'a besoin que de l'heure du planning et des cours.
  const contenu = JSON.stringify({
    parametres: { date: data.parametres?.date },
    listeCours: (data.listeCours ?? []).map(({ deb, fin, sal }) => ({ deb, fin, sal })),
  });
  cache = { date: Date.now(), contenu };
  return contenu;
}

const serveur = createServer(async (req, res) => {
  const chemin = new URL(req.url, "http://localhost").pathname;
  try {
    if (chemin === "/api/planning") {
      const contenu = await lirePlanning();
      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      res.end(contenu);
    } else if (chemin === "/") {
      const page = await readFile(new URL("./public/index.html", import.meta.url));
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(page);
    } else {
      res.writeHead(404).end();
    }
  } catch (erreur) {
    console.error(new Date().toISOString(), erreur.message);
    res.writeHead(502, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ erreur: erreur.message }));
  }
});

serveur.listen(PORT, () => console.log(`Page d'affichage : http://localhost:${PORT}`));
