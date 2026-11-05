(function () {
  const d = TOURNAMENT;
  const $ = (id) => document.getElementById(id);
  const el = (tag, attrs = {}, text) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const pick = (key) => (d.overview.find(([k]) => k === key) || [])[1] || "";

  // ---------- 文言 ----------
  $("nav-brand").textContent = d.navBrand;
  $("hero-eyebrow").textContent = d.eyebrow;
  $("hero-title").textContent = d.title;
  $("hero-subtitle").textContent = d.subtitle;
  $("weather-text").textContent = d.weather;
  $("footer-brand").textContent = d.navBrand;
  $("footer-text").textContent = d.footer;

  // ---------- ヒーローの要点 ----------
  const chips = $("meta-chips");
  d.meta.forEach(([k, v]) => {
    const li = el("li");
    li.append(el("strong", {}, k), document.createTextNode(v));
    chips.append(li);
  });

  // ---------- 開催概要カード（大会名は見出しに出すので除外） ----------
  const iconText = { 開催日: "日", 会場: "場", スタート: "時", "表彰式・懇親会": "宴", 参加人数: "人" };
  const cards = $("overview-cards");
  d.overview
    .filter(([k]) => k !== "大会名")
    .forEach(([k, v]) => {
      const card = el("div", { class: "card" });
      card.append(el("div", { class: "card-icon" }, iconText[k] || "・"));
      const body = el("div");
      body.append(el("p", { class: "card-label" }, k), el("p", { class: "card-value" }, v));
      card.append(body);
      cards.append(card);
    });

  // ---------- 当日の流れ（確定分のみ。その他は後日） ----------
  const tl = $("timeline");
  [
    ["08:00", "スタート", "組ごとの時刻は組合せを参照"],
    ["競技後", "表彰式・懇親会", pick("表彰式・懇親会")],
    ["—", "その他の時間", "詳細は後日掲載します"],
  ].forEach(([time, title, note]) => {
    const li = el("li");
    li.append(
      el("span", { class: "tl-time" }, time),
      (() => {
        const div = el("div");
        div.append(el("p", { class: "tl-title" }, title), el("p", { class: "tl-note" }, note));
        return div;
      })()
    );
    tl.append(li);
  });

  // ---------- 組合せ（人数は配列から再計算） ----------
  const grid = $("group-grid");
  let total = 0;
  d.courses.forEach((course) => {
    course.groups.forEach((g) => {
      total += g.members.length;
      const card = el("article", { class: "group" });
      card.append(el("span", { class: "group-no" }, `第${g.number}組`));
      const ul = el("ul");
      g.members.forEach((m) => ul.append(el("li", {}, m)));
      card.append(ul);
      if (g.time) card.append(el("span", { class: "group-time" }, g.time));
      grid.append(card);
    });
  });
  $("group-total").textContent = `合計 ${total} 名`;

  // ---------- ルール・賞品 ----------
  d.rules.forEach((r) => $("rules-list").append(el("li", {}, r)));
  d.prizes.forEach((p) => $("prizes-list").append(el("li", { class: "prize" }, p)));

  // ---------- 表彰式・懇親会 ----------
  $("dinner-name").textContent = pick("表彰式・懇親会");

  // ---------- 会場 ----------
  $("venue-name").textContent = pick("会場");
  $("venue-dinner").textContent = pick("表彰式・懇親会");
  const map = $("venue-map");
  if (d.venue.mapUrl) {
    map.href = d.venue.mapUrl;
    map.textContent = "地図を開く";
  } else {
    map.removeAttribute("href");
    map.textContent = "地図は後日掲載します";
  }

  // ---------- 外部導線（URL 未設定なら無効表示） ----------
  const renderActions = (target) => {
    d.links.forEach((l) => {
      const wrap = el("div", { class: "action" });
      if (l.url) {
        wrap.append(el("a", { class: "btn", href: l.url, target: "_blank", rel: "noopener noreferrer" }, l.label));
      } else {
        wrap.append(el("span", { class: "btn btn-disabled" }, `${l.label}（URL未設定）`));
      }
      wrap.append(el("small", {}, l.note));
      target.append(wrap);
    });
  };
  renderActions($("hero-actions"));
  renderActions($("cta-actions"));

  // ---------- カウントダウン（秒単位・終了後は「開催済み」） ----------
  const target = new Date(d.startAt).getTime();
  const dayEnd = new Date(`${d.startAt.slice(0, 10)}T00:00:00+09:00`).getTime() + 86400000;
  const cd = $("countdown");
  const unit = (num, label) => {
    const u = el("div", { class: "cd-unit" });
    u.append(el("span", { class: "cd-num" }, String(num).padStart(2, "0")), el("span", { class: "cd-label" }, label));
    return u;
  };
  const showEnded = () => cd.replaceChildren(el("span", { class: "countdown-text" }, "開催済み"));
  const tick = () => {
    const now = Date.now();
    if (now >= dayEnd) {
      showEnded();
      return false;
    }
    const diff = target - now;
    if (diff <= 0) {
      cd.replaceChildren(el("span", { class: "countdown-text" }, "本日開催です"));
      return true;
    }
    cd.replaceChildren(
      unit(Math.floor(diff / 86400000), "DAYS"),
      unit(Math.floor((diff % 86400000) / 3600000), "HOURS"),
      unit(Math.floor((diff % 3600000) / 60000), "MINUTES"),
      unit(Math.floor((diff % 60000) / 1000), "SECONDS")
    );
    return true;
  };
  if (tick()) {
    const timer = setInterval(() => {
      if (!tick()) clearInterval(timer);
    }, 1000);
  }
})();
