// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
function getClubById(id) {
  return DATA.clubs.find((c) => c.id === id);
}
function getTournamentById(id) {
  return DATA.tournaments[id];
}
function esc(text) {
  return String(text || "");
}

function renderBreadcrumbs(items) {
  const app = document.getElementById("app");
  const oldBread = document.querySelector(".breadcrumbs");
  if (oldBread) oldBread.remove();

  const bread = document.createElement("nav");
  bread.className = "breadcrumbs";
  bread.setAttribute("aria-label", "Хлебные крошки");

  items.forEach((item, index) => {
    if (index > 0) {
      const sep = document.createElement("span");
      sep.className = "separator";
      sep.textContent = "›";
      bread.appendChild(sep);
    }
    if (item.link) {
      const a = document.createElement("a");
      a.href = item.link;
      a.textContent = item.label;
      bread.appendChild(a);
    } else {
      const span = document.createElement("span");
      span.className = "current";
      span.textContent = item.label;
      bread.appendChild(span);
    }
  });

  app.insertBefore(bread, app.firstChild);
}

// РЕНДЕР КОМПОНЕНТОВ
function renderHomePage() {
  renderBreadcrumbs([{ label: "Главная", link: "#" }]);
  const app = document.getElementById("app");
  app.innerHTML = "";
  const hero = document.createElement("section");
  hero.className = "fade-in";
  hero.innerHTML = `
    <h1 class="section-title">Добро пожаловать во Всероссийский футбольный союз</h1>
    <p style="color:var(--text-secondary);margin-bottom:30px;">Следите за Русской футбол-лигой, Чемпионатом-1, Кубком Царя и выступлениями наших клубов в Европе.</p>
  `;
  const rflBlock = document.createElement("div");
  rflBlock.className = "league-preview";
  rflBlock.innerHTML = `<h2><a href="#/league/rfl" style="color:var(--accent-gold);">Русская футбол-лига</a></h2>`;
  rflBlock.appendChild(renderLeagueTable("rfl", 5));
  rflBlock.innerHTML += `<a href="#/league/rfl" class="btn" style="margin-top:15px;">Полная таблица и матчи</a>`;

  const ch1Block = document.createElement("div");
  ch1Block.className = "league-preview";
  ch1Block.innerHTML = `<h2><a href="#/league/champ1" style="color:var(--accent-gold);">Чемпионат-1</a></h2>`;
  ch1Block.appendChild(renderLeagueTable("champ1", 5));
  ch1Block.innerHTML += `<a href="#/league/champ1" class="btn" style="margin-top:15px;">Полная таблица и матчи</a>`;

  const cupsBlock = document.createElement("div");
  cupsBlock.className = "cups-links";
  cupsBlock.innerHTML = `
    <h2 class="section-title">Кубки</h2>
    <div style="display:flex; gap:25px; flex-wrap:wrap;">
      <a href="#/league/kingCup" class="btn">Кубок Царя</a>
      <a href="#/league/cl" class="btn">Кубок Наций</a>
      <a href="#/league/el" class="btn">Кубок Претендентов</a>
    </div>
  `;
  app.append(hero, rflBlock, ch1Block, cupsBlock);
}

function renderTournamentPage(tourId) {
  const tournament = getTournamentById(tourId);
  if (!tournament) {
    document.getElementById("app").innerHTML = "<p>Турнир не найден</p>";
    return;
  }
  const app = document.getElementById("app");
  app.innerHTML = "";
  const header = document.createElement("div");
  header.className = "tournament-header fade-in";
  const championClub = getClubById(tournament.currentChampion);
  const mostTitledClub = getClubById(tournament.mostTitled);
  header.innerHTML = `
    <img src="${esc(tournament.logo)}" alt="${esc(tournament.name)}" class="tournament-logo" onerror="this.outerHTML='<span style=font-size:3rem;>🏆</span>'">
    <div>
      <h1 class="tournament-title">${esc(tournament.name)}</h1>
      <p class="tournament-meta">Действующий чемпион: ${championClub ? `<a href="#/club/${championClub.id}">${esc(championClub.name)}</a>` : "—"}</p>
      <p class="tournament-meta">Самый титулованный: ${mostTitledClub ? `<a href="#/club/${mostTitledClub.id}">${esc(mostTitledClub.name)}</a>` : "—"}</p>
    </div>
  `;
  renderBreadcrumbs([
    { label: "Главная", link: "#" },
    { label: esc(tournament.name), link: null },
  ]);
  app.appendChild(header);

  if (tourId === "rfl" || tourId === "champ1") {
    app.appendChild(
      Object.assign(document.createElement("h2"), {
        className: "section-title",
        textContent: "Турнирная таблица",
      }),
    );
    app.appendChild(renderLeagueTable(tourId));
    app.appendChild(
      Object.assign(document.createElement("h2"), {
        className: "section-title",
        textContent: "Результаты последнего тура",
      }),
    );
    app.appendChild(renderRecentMatches(tourId));
  }
  if (tourId === "kingCup" || tourId === "cl" || tourId === "el") {
    const bracketTitle = document.createElement("h2");
    bracketTitle.className = "section-title";
    bracketTitle.textContent = "Турнирная сетка";
    app.appendChild(bracketTitle);
    const bracketData = DATA.brackets[tourId];
    if (bracketData) app.appendChild(renderTreeBracket(bracketData));
  }
}

function renderClubPage(clubId) {
  const club = getClubById(clubId);
  if (!club) {
    document.getElementById("app").innerHTML = "<p>Клуб не найден</p>";
    return;
  }
  const app = document.getElementById("app");
  app.innerHTML = "";
  const hero = document.createElement("div");
  hero.className = "club-hero fade-in";
  hero.innerHTML = `
  <img src="${esc(club.logo)}" alt="${esc(club.name)}" class="club-logo-large" onerror="this.outerHTML='<span style=font-size:4rem;>⚽</span>'">
  <div class="club-info">
    <h1 class="club-name">${esc(club.name)}</h1>
    <div class="club-details">
      <span class="detail-item">
        <img src="images/location.png" alt="" class="detail-icon">
        <span>${esc(club.city)}</span>
      </span>
      <span class="detail-item">
        <img src="images/calendar.png" alt="" class="detail-icon">
        <span>Основан: ${club.founded}</span>
      </span>
    </div>
    <div class="club-details">
      <span class="detail-item">
        <img src="images/speak.png" alt="" class="detail-icon">
        <span>Прозвище: ${esc(club.nickname) || "—"}</span>
      </span>
    </div>
    <div class="club-details">
      <span class="detail-item">
        <img src="images/stadium.png" alt="" class="detail-icon">
        <span>${esc(club.stadium)} (${club.capacity ? club.capacity.toLocaleString() : "—"} мест)</span>
      </span>
    </div>
    ${
      club.sponsor
        ? `<div class="sponsor-block">
      <span class="sponsor-label">Спонсор:</span>
      <img src="${esc(club.sponsor.logo)}" alt="${esc(club.sponsor.name)}" class="sponsor-logo" onerror="this.parentElement.innerHTML='<span class=sponsor-label>${esc(club.sponsor.name)}</span>'">
    </div>`
        : ""
    }
  </div>
`;
  renderBreadcrumbs([
    { label: "Главная", link: "#" },
    { label: esc(club.name), link: null },
  ]);
  app.appendChild(hero);
  if (club.history && club.history.length) {
    const hist = document.createElement("div");
    hist.className = "history-block fade-in";
    hist.innerHTML = "<h3>История клуба</h3>";
    club.history.forEach((p) => {
      const pp = document.createElement("p");
      pp.textContent = p;
      hist.appendChild(pp);
    });
    app.appendChild(hist);
  }
}

function renderLeagueTable(leagueId, limit = null) {
  const tableData = DATA.leagueTables[leagueId];
  if (!tableData) return document.createElement("p");
  const rows = limit ? tableData.slice(0, limit) : tableData;
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";
  const table = document.createElement("table");
  table.className = "tournament-table";
  table.innerHTML =
    "<thead><tr><th>#</th><th>Клуб</th><th>И</th><th>В</th><th>Н</th><th>П</th><th>Мячи</th><th>О</th></tr></thead>";
  const tbody = document.createElement("tbody");
  rows.forEach((row) => {
    const club = getClubById(row.clubId);
    if (!club) return;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="indicator ${row.indicator}"></span>${row.position}</td>
      <td><a href="#/club/${club.id}" class="team-cell"><img src="${esc(club.logo)}" class="team-logo-small" onerror="this.style.display='none'"><span class="team-name">${esc(club.name)}</span></a></td>
      <td>${row.played}</td><td>${row.won}</td><td>${row.drawn}</td><td>${row.lost}</td><td>${row.goalsFor}–${row.goalsAgainst}</td><td><strong>${row.points}</strong></td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrapper.appendChild(table);
  return wrapper;
}

function renderRecentMatches(leagueId) {
  const matches = DATA.recentMatches[leagueId];
  if (!matches || !matches.length) return document.createElement("p");
  const container = document.createElement("div");
  container.className = "match-list";
  matches.forEach((m) => {
    const home = getClubById(m.home),
      away = getClubById(m.away);
    if (!home || !away) return;
    const item = document.createElement("div");
    item.className = "match-item";
    item.innerHTML = `
  <div class="match-date">${esc(m.date)}</div>
  <div class="match-teams"><a href="#/club/${home.id}"><img src="${esc(home.logo)}" onerror="this.style.display='none'"></a><span>${esc(home.name)}</span></div>
  <div class="match-score">${esc(m.score)}</div>
  <div class="match-teams match-away"><a href="#/club/${away.id}"><img src="${esc(away.logo)}" onerror="this.style.display='none'"></a><span>${esc(away.name)}</span></div>
  <div class="match-tour">${m.tour} тур</div>
`;
    container.appendChild(item);
  });
  return container;
}

// ДРЕВОВИДНАЯ СЕТКА
function renderTreeBracket(root) {
  const wrapper = document.createElement("div");
  wrapper.className = "bracket-scroll";

  const tree = document.createElement("div");
  tree.className = "tree";

  function buildNode(node) {
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "tree-node";

    const matchEl = document.createElement("div");
    matchEl.className = "tree-match";
    const home = getClubById(node.match.home),
      away = getClubById(node.match.away);
    if (home && away) {
      matchEl.innerHTML = `
        <a href="#/club/${home.id}" class="tree-team"><img src="${esc(home.logo)}" onerror="this.style.display='none'"><span>${esc(home.name)}</span></a>
        <span class="tree-score">${esc(node.match.score)}</span>
        <a href="#/club/${away.id}" class="tree-team"><img src="${esc(away.logo)}" onerror="this.style.display='none'"><span>${esc(away.name)}</span></a>
      `;
    }
    const roundLabel = document.createElement("div");
    roundLabel.className = "tree-round";
    roundLabel.textContent = node.round;
    nodeDiv.appendChild(roundLabel);
    nodeDiv.appendChild(matchEl);

    if (node.left || node.right) {
      const childrenWrap = document.createElement("div");
      childrenWrap.className = "tree-children";
      if (node.left) childrenWrap.appendChild(buildNode(node.left));
      if (node.right) childrenWrap.appendChild(buildNode(node.right));
      nodeDiv.appendChild(childrenWrap);
    }
    return nodeDiv;
  }

  tree.appendChild(buildNode(root));
  wrapper.appendChild(tree);
  return wrapper;
}

// РОУТЕР
function resolveRoute() {
  const hash = location.hash.slice(1) || "/";
  if (hash === "/" || hash === "") renderHomePage();
  else {
    const parts = hash.split("/").filter(Boolean);
    if (parts[0] === "league" && parts[1]) renderTournamentPage(parts[1]);
    else if (parts[0] === "club" && parts[1]) renderClubPage(parts[1]);
    else
      document.getElementById("app").innerHTML = "<p>Страница не найдена</p>";
  }
  updateNavActive();
}

function updateNavActive() {
  const hash = location.hash.slice(1) || "/"; // убираем #
  const links = document.querySelectorAll(".main-nav a");

  links.forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href");

    // Главная страница: hash пустой или "/"
    if (href === "#" && (hash === "" || hash === "/" || hash === "#")) {
      link.classList.add("active");
    }
    // Внутренние страницы: href начинается с "#/..." и совпадает с хэшем
    else if (href !== "#" && hash.startsWith(href.substring(1))) {
      link.classList.add("active");
    }
  });
}

// МОБИЛЬНОЕ МЕНЮ
function initMobileMenu() {
  const burger = document.getElementById("burger"),
    nav = document.getElementById("mainNav");
  if (!burger || !nav) return;

  burger.addEventListener("click", () => {
    nav.classList.toggle("active");
    burger.classList.toggle("active");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("active");
      burger.classList.remove("active");
    });
  });
}

window.addEventListener("hashchange", resolveRoute);
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  resolveRoute();
});
