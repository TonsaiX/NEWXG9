const pathParts = window.location.pathname.split("/");
const guildId = pathParts[pathParts.length - 1];

const winsEl = document.getElementById("wins");
const lossesEl = document.getElementById("losses");
const winrateEl = document.getElementById("winrate");

let prevWins = null;
let prevLosses = null;

function animate(el, className) {
  el.classList.remove("pop", "flash-win", "flash-lose");
  void el.offsetWidth;
  el.classList.add("pop", className);
}

function calculateWinRate(wins, losses) {
  const total = wins + losses;
  if (total === 0) return "0%";
  return `${Math.round((wins / total) * 100)}%`;
}

async function fetchOverlay() {
  try {
    const res = await fetch(`/overlay/${guildId}`, { cache: "no-store" });
    const data = await res.json();

    const wins = Number(data.wins ?? 0);
    const losses = Number(data.losses ?? 0);

    winsEl.textContent = wins;
    lossesEl.textContent = losses;
    winrateEl.textContent = calculateWinRate(wins, losses);

    if (prevWins !== null && wins !== prevWins) {
      animate(winsEl, wins > prevWins ? "flash-win" : "flash-lose");
      animate(winrateEl, "flash-win");
    }

    if (prevLosses !== null && losses !== prevLosses) {
      animate(lossesEl, losses > prevLosses ? "flash-lose" : "flash-win");
      animate(winrateEl, "flash-lose");
    }

    prevWins = wins;
    prevLosses = losses;
  } catch (error) {
    console.error("Failed to fetch overlay data:", error);
  }
}

fetchOverlay();
setInterval(fetchOverlay, 1000);