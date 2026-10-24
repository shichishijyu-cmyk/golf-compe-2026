(function () {
  const d = TOURNAMENT;
  const $ = (id) => document.getElementById(id);
  const el = (tag, attrs = {}, text) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (text !== undefined) node.textContent = text;
    return node;
  };

  // 静的な文言
  $("hero-eyebrow").textContent = d.eyebrow;
  $("hero-title").textContent = d.title;
  $("hero-subtitle").textContent = d.subtitle;
  $("weather-text").textContent = d.weather;
  $("venue-text").textContent = d.venue.text;
  $("footer-text").textContent = d.footer;

  // 概要
  const overview = $("overview-list");
  d.overview.forEach(([k, v]) => {
    overview.append(el("dt", {}, k), el("dd", {}, v));
  });

  // 組合せ（人数は配列から再計算）
  const grid = $("course-grid");
  let total = 0;
  d.courses.forEach((course) => {
    const card = el("article", { class: "course-card" });
    card.append(el("h3", {}, course.name), el("p", { class: "course-label" }, course.label));
    course.groups.forEach((g) => {
      total += g.members.length;
      const row = el("div", { class: "group-row" });
      row.append(
        el("span", { class: "group-no" }, `第${g.number}組`),
        el("span", { class: "group-time" }, g.time),
        el("span", { class: "group-members" }, g.members.join("　"))
      );
      card.append(row);
    });
    grid.append(card);
  });
  grid.after(el("p", { class: "note" }, `合計 ${total} 名`));

  // ルール・賞品
  d.rules.forEach((r) => $("rules-list").append(el("li", {}, r)));
  d.prizes.forEach((p) => $("prizes-list").append(el("li", {}, p)));

  // 会場マップ
  const map = $("venue-map");
  if (d.venue.mapUrl) {
    map.href = d.venue.mapUrl;
    map.textContent = "地図を開く";
  } else {
    map.removeAttribute("href");
    map.textContent = "地図URL未設定";
  }

  // 外部導線（URL 未設定なら無効表示）
  const actions = $("hero-actions");
  d.links.forEach((l) => {
    const wrap = el("div", { class: "action" });
    if (l.url) {
      wrap.append(
        el("a", { class: "btn", href: l.url, target: "_blank", rel: "noopener noreferrer" }, l.label)
      );
    } else {
      wrap.append(el("span", { class: "btn btn-disabled" }, `${l.label}（URL未設定）`));
    }
    wrap.append(el("small", {}, l.note));
    actions.append(wrap);
  });

  // カウントダウン
  const target = new Date(d.startAt).getTime();
  const cd = $("countdown");
  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      cd.textContent = "本日開催です";
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    cd.textContent = `開催まで あと ${days}日 ${hours}時間 ${mins}分`;
  };
  tick();
  setInterval(tick, 30000);
})();
