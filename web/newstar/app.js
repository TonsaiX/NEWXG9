const pathParts = window.location.pathname.split("/");
const guildId = pathParts[pathParts.length - 1];
const appEl = document.getElementById("app");

let prevState = {
  rank: null,
  stars: null,
  template: null
};

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function animate(el, className) {
  if (!el) return;
  el.classList.remove("pop", "flash-rank", "flash-star", "flash-neutral");
  void el.offsetWidth;
  el.classList.add("pop", className);
}

function renderStars(rank, stars) {
  if (rank === "เทพสงคราม") {
    return `${stars} ดาว`;
  }

  return `${"★".repeat(stars)}${"☆".repeat(Math.max(0, 5 - stars))}`;
}

function getTemplate(data) {
  const template = String(data.template || "compact").toLowerCase();
  return ["compact", "banner", "orb", "clean"].includes(template) ? template : "compact";
}

function renderCompact(data) {
  return `
    <section class="ns-compact" data-template="compact">
      <div class="ns-label">RANK</div>
      <div class="ns-rank" data-role="rank">${escapeHtml(data.rank)}</div>

      <div class="ns-divider"></div>

      <div class="ns-label">STARS</div>
      <div class="ns-stars" data-role="stars">${escapeHtml(data.starsLabel)}</div>
    </section>
  `;
}

function renderBanner(data) {
  return `
    <section class="ns-banner" data-template="banner">
      <div class="ns-banner-top">
        <div class="ns-badge">LIVE RANK STAR</div>
        <div class="ns-label">CURRENT PROGRESSION</div>
      </div>

      <div class="ns-banner-main">
        <div class="ns-banner-rankbox">
          <div class="ns-banner-sub">CURRENT RANK</div>
          <div class="ns-rank" data-role="rank">${escapeHtml(data.rank)}</div>
        </div>

        <div class="ns-banner-starbox">
          <div class="ns-banner-sub">CURRENT STARS</div>
          <div class="ns-stars" data-role="stars">${escapeHtml(data.starsLabel)}</div>
        </div>
      </div>
    </section>
  `;
}

function renderOrb(data) {
  return `
    <section class="ns-orb" data-template="orb">
      <div class="ns-orb-main">
        <div class="ns-orb-ring">
          <div class="ns-orb-ring-inner">
            <div class="ns-label">RANK</div>
            <div class="ns-rank" data-role="rank">${escapeHtml(data.rank)}</div>

            <div class="ns-label" style="margin-top:10px;">STARS</div>
            <div class="ns-stars" data-role="stars">${escapeHtml(data.starsLabel)}</div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderClean(data) {
  return `
    <section class="ns-clean" data-template="clean">
      <div class="ns-clean-rank-block">
        <div class="ns-label">RANK</div>
        <div class="ns-rank" data-role="rank">${escapeHtml(data.rank)}</div>
      </div>

      <div class="ns-clean-sep"></div>

      <div class="ns-clean-star-block">
        <div class="ns-label">STARS</div>
        <div class="ns-stars" data-role="stars">${escapeHtml(data.starsLabel)}</div>
      </div>
    </section>
  `;
}

function renderTemplate(template, data) {
  switch (template) {
    case "banner":
      return renderBanner(data);
    case "orb":
      return renderOrb(data);
    case "clean":
      return renderClean(data);
    case "compact":
    default:
      return renderCompact(data);
  }
}

function getNodes() {
  return {
    rank: appEl.querySelector('[data-role="rank"]'),
    stars: appEl.querySelector('[data-role="stars"]')
  };
}

function updateExistingDOM(data) {
  const nodes = getNodes();

  if (nodes.rank) nodes.rank.textContent = data.rank;
  if (nodes.stars) nodes.stars.textContent = data.starsLabel;
}

function animateChanges(data) {
  const nodes = getNodes();

  if (prevState.rank !== null && data.rank !== prevState.rank) {
    animate(nodes.rank, "flash-rank");
  }

  if (prevState.stars !== null && data.stars !== prevState.stars) {
    animate(nodes.stars, "flash-star");
  }
}

async function fetchOverlay() {
  try {
    const res = await fetch(`/newstar/${guildId}`, { cache: "no-store" });
    const raw = await res.json();

    const rank = raw.displayRank ?? raw.rank ?? "EPIC V";
    const stars = Number(raw.stars ?? 0);
    const template = getTemplate(raw);

    const data = {
      rank,
      stars,
      template,
      starsLabel: renderStars(raw.rank, stars)
    };

    if (prevState.template !== template || !appEl.firstChild) {
      appEl.innerHTML = renderTemplate(template, data);
      const nodes = getNodes();
      animate(nodes.rank, "flash-rank");
      animate(nodes.stars, "flash-star");
    } else {
      updateExistingDOM(data);
      animateChanges(data);
    }

    prevState = {
      rank,
      stars,
      template
    };
  } catch (error) {
    console.error("Failed to fetch newstar overlay:", error);
  }
}

fetchOverlay();
setInterval(fetchOverlay, 1000);