const pathParts = window.location.pathname.split("/");
const guildId = pathParts[pathParts.length - 1];
const appEl = document.getElementById("app");

let prevState = {
  profile: null,
  wins: null,
  losses: null,
  template: null
};

function calculateWinRate(wins, losses) {
  const total = wins + losses;
  if (total === 0) return "0%";
  return `${Math.round((wins / total) * 100)}%`;
}

function formatProfile(name) {
  return (name || "NO ACTIVE PROFILE").toUpperCase();
}

function animate(el, className) {
  if (!el) return;
  el.classList.remove("pop", "flash-win", "flash-lose", "flash-neutral");
  void el.offsetWidth;
  el.classList.add("pop", className);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getTemplate(data) {
  const template = String(data.template || "compact").toLowerCase();
  return ["compact", "scorebar", "duel", "clean"].includes(template) ? template : "compact";
}

function renderCompact(data) {
  return `
    <section class="wl-compact" data-template="compact">
      <div class="wl-compact-head">
        <div class="wl-compact-dot"></div>
        <div class="wl-profile" data-role="profile">${escapeHtml(data.profile)}</div>
      </div>

      <div class="wl-compact-row">
        <div class="wl-compact-box">
          <div class="wl-label">W</div>
          <div class="wl-value wl-win" data-role="wins">${data.wins}</div>
        </div>

        <div class="wl-compact-box">
          <div class="wl-label">L</div>
          <div class="wl-value wl-lose" data-role="losses">${data.losses}</div>
        </div>
      </div>

      <div class="wl-compact-bottom">
        <div class="wl-rate" data-role="rate">${escapeHtml(data.rate)}</div>
        <div class="wl-total" data-role="total">${escapeHtml(data.totalText)}</div>
      </div>
    </section>
  `;
}

function renderScorebar(data) {
  return `
    <section class="wl-scorebar" data-template="scorebar">
      <div class="wl-scorebar-top">
        <div class="wl-badge">LIVE SCOREBOARD</div>
        <div class="wl-profile" data-role="profile">${escapeHtml(data.profile)}</div>
      </div>

      <div class="wl-scorebar-main">
        <div class="wl-scorebar-side">
          <div class="wl-count wl-win" data-role="wins">${data.wins}</div>
          <div class="wl-side-caption">WIN</div>
        </div>

        <div class="wl-scorebar-center">
          <div class="wl-bar">
            <div class="wl-bar-fill" data-role="bar-fill" style="width:${data.barPercent}%"></div>
          </div>

          <div class="wl-scorebar-meta">
            <div class="wl-scorebar-rate" data-role="rate">${escapeHtml(data.rate)} WIN RATE</div>
            <div class="wl-scorebar-total" data-role="total">${escapeHtml(data.totalText)}</div>
          </div>
        </div>

        <div class="wl-scorebar-side">
          <div class="wl-count wl-lose" data-role="losses">${data.losses}</div>
          <div class="wl-side-caption">LOSE</div>
        </div>
      </div>
    </section>
  `;
}

function renderDuel(data) {
  return `
    <section class="wl-duel" data-template="duel">

      <div class="wl-duel-main">
        <div class="wl-duel-side">
          <div class="wl-label">WIN</div>
          <div class="wl-value wl-win" data-role="wins">${data.wins}</div>
        </div>

        <div class="wl-duel-mid">
          <div class="wl-duel-ring">
            <div class="wl-duel-ring-inner">
              <div class="wl-duel-rate-label">RATE</div>
              <div class="wl-duel-rate-value wl-rate" data-role="rate">${escapeHtml(data.rate)}</div>
            </div>
          </div>
          <div class="wl-duel-total wl-total" data-role="total">${escapeHtml(data.totalText)}</div>
        </div>

        <div class="wl-duel-side">
          <div class="wl-label">LOSE</div>
          <div class="wl-value wl-lose" data-role="losses">${data.losses}</div>
        </div>
      </div>
    </section>
  `;
}

function renderClean(data) {
  return `
    <section class="wl-clean" data-template="clean">
      <div class="wl-clean-profile wl-profile" data-role="profile">${escapeHtml(data.profile)}</div>

      <div class="wl-clean-main">
        <div class="wl-clean-stat">
          <div class="wl-clean-number wl-win" data-role="wins">${data.wins}</div>
          <div class="wl-clean-caption">WIN</div>
        </div>

        <div class="wl-clean-center">
          <div class="wl-clean-rate wl-rate" data-role="rate">${escapeHtml(data.rate)}</div>
          <div class="wl-clean-total wl-total" data-role="total">${escapeHtml(data.totalText)}</div>
        </div>

        <div class="wl-clean-stat">
          <div class="wl-clean-number wl-lose" data-role="losses">${data.losses}</div>
          <div class="wl-clean-caption">LOSE</div>
        </div>
      </div>
    </section>
  `;
}

function renderTemplate(template, data) {
  switch (template) {
    case "scorebar":
      return renderScorebar(data);
    case "duel":
      return renderDuel(data);
    case "clean":
      return renderClean(data);
    case "compact":
    default:
      return renderCompact(data);
  }
}

function getNodes() {
  return {
    profile: appEl.querySelector('[data-role="profile"]'),
    wins: appEl.querySelector('[data-role="wins"]'),
    losses: appEl.querySelector('[data-role="losses"]'),
    rate: appEl.querySelector('[data-role="rate"]'),
    total: appEl.querySelector('[data-role="total"]'),
    barFill: appEl.querySelector('[data-role="bar-fill"]')
  };
}

function updateExistingDOM(data) {
  const nodes = getNodes();

  if (nodes.profile) nodes.profile.textContent = data.profile;
  if (nodes.wins) nodes.wins.textContent = data.wins;
  if (nodes.losses) nodes.losses.textContent = data.losses;
  if (nodes.rate) nodes.rate.textContent = data.rate;
  if (nodes.total) nodes.total.textContent = data.totalText;
  if (nodes.barFill) nodes.barFill.style.width = `${data.barPercent}%`;
}

function animateChanges(data) {
  const nodes = getNodes();

  if (prevState.profile !== null && data.profile !== prevState.profile) {
    animate(nodes.profile, "flash-neutral");
  }

  if (prevState.wins !== null && data.wins !== prevState.wins) {
    animate(nodes.wins, data.wins > prevState.wins ? "flash-win" : "flash-lose");
    animate(nodes.rate, "flash-win");
    animate(nodes.total, "flash-neutral");
  }

  if (prevState.losses !== null && data.losses !== prevState.losses) {
    animate(nodes.losses, data.losses > prevState.losses ? "flash-lose" : "flash-win");
    animate(nodes.rate, "flash-lose");
    animate(nodes.total, "flash-neutral");
  }
}

async function fetchOverlay() {
  try {
    const res = await fetch(`/overlay/${guildId}`, { cache: "no-store" });
    const raw = await res.json();

    const wins = Number(raw.wins ?? 0);
    const losses = Number(raw.losses ?? 0);
    const total = wins + losses;
    const rate = calculateWinRate(wins, losses);
    const profile = formatProfile(raw.profile);
    const template = getTemplate(raw);
    const barPercent = total > 0 ? Math.round((wins / total) * 100) : 0;

    const data = {
      profile,
      wins,
      losses,
      total,
      rate,
      template,
      totalText: `${total} MATCH${total === 1 ? "" : "ES"}`,
      barPercent
    };

    if (prevState.template !== template || !appEl.firstChild) {
      appEl.innerHTML = renderTemplate(template, data);
      const nodes = getNodes();
      animate(nodes.profile, "flash-neutral");
      animate(nodes.wins, "flash-win");
      animate(nodes.losses, "flash-lose");
      animate(nodes.rate, "flash-neutral");
    } else {
      updateExistingDOM(data);
      animateChanges(data);
    }

    prevState = {
      profile,
      wins,
      losses,
      template
    };
  } catch (error) {
    console.error("Failed to fetch overlay data:", error);
  }
}

fetchOverlay();
setInterval(fetchOverlay, 1000);