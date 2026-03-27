const pathParts = window.location.pathname.split("/");
const guildId = pathParts[pathParts.length - 1];

const rankEl = document.getElementById("rank");
const starsEl = document.getElementById("stars");

function renderStars(rank, stars) {
  if (rank === "เทพสงคราม") {
    return `${stars} ดาว`;
  }

  return `${"⭐".repeat(stars)}${"☆".repeat(Math.max(0, 5 - stars))}`;
}

async function fetchOverlay() {
  try {
    const res = await fetch(`/newstar/${guildId}`, { cache: "no-store" });
    const data = await res.json();

    rankEl.textContent = data.displayRank ?? data.rank ?? "EPIC V";
    starsEl.textContent = renderStars(data.rank, Number(data.stars ?? 0));
  } catch (error) {
    console.error("Failed to fetch newstar overlay:", error);
  }
}

fetchOverlay();
setInterval(fetchOverlay, 1000);