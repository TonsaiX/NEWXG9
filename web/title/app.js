const pathParts = window.location.pathname.split("/");
const guildId = pathParts[pathParts.length - 1];

const trackEl = document.getElementById("title-track");
const textEl = document.getElementById("title-text");

let prevText = null;
let prevDirection = null;

function normalizeDirection(direction) {
  const value = String(direction || "").trim().toLowerCase();
  if (["left-to-right", "right-to-left", "center"].includes(value)) {
    return value;
  }
  return "right-to-left";
}

async function fetchTitle() {
  try {
    const res = await fetch(`/title/${guildId}`, { cache: "no-store" });
    const data = await res.json();

    const text = String(data.text || "NEWXG9 STREAM").slice(0, 120);
    const direction = normalizeDirection(data.direction);

    if (text !== prevText) {
      textEl.textContent = text;
    }

    if (direction !== prevDirection) {
      trackEl.dataset.direction = direction;

      textEl.style.animation = "none";
      void textEl.offsetWidth;
      textEl.style.animation = "";
    }

    prevText = text;
    prevDirection = direction;
  } catch (error) {
    console.error("Failed to fetch title overlay:", error);
  }
}

fetchTitle();
setInterval(fetchTitle, 1000);