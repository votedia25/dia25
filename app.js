/* Sufrágio app: resultado do 2º turno de 2026 (dados fixos em data.js, com fonte) e mapa 3D por estado.
   Só textContent: nenhum innerHTML com dados. */
(function () {
  var S = window.SUF; if (!S) return;
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function fmt(n) { return Math.round(n).toLocaleString("pt-BR"); }
  function pc(n) { return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%"; }
  function link(f) { var a = el("a", null, f.nome); a.href = f.url; a.rel = "noopener"; return a; }
  function fonte(host, ids) { var p = el("p", "nota", "Fonte: "); ids.forEach(function (id, i) { if (i) p.appendChild(document.createTextNode(" · ")); p.appendChild(link(S.fontes[id])); }); host.appendChild(p); }

  /* ---- estados: percentuais sobre votos válidos ---- */
  var maxV = 0;
  var est = S.estados.map(function (e) {
    var v = e.l + e.f; if (v > maxV) maxV = v;
    return { uf: e.uf, nome: e.nome, l: e.l, f: e.f, v: v, pl: e.l / v * 100, pf: e.f / v * 100, lider: e.l > e.f ? "l" : "f" };
  });
  est.forEach(function (e) {
    e.ap = 100 * Math.sqrt(e.v / maxV); /* altura da coluna: raiz do total de votos válidos */
    e.linhas = [e.nome + " · vence " + (e.lider === "l" ? "Lula" : "Flávio"), "Lula " + pc(e.pl) + " · " + fmt(e.l) + " votos", "Flávio " + pc(e.pf) + " · " + fmt(e.f) + " votos"];
  });
  var porUF = {}; est.forEach(function (e) { porUF[e.uf] = e; });

  /* ---- placar nacional ---- */
  var N = S.nacional, box = document.getElementById("placar");
  if (box) {
    var ele = el("div", "eleito"); ele.appendChild(el("i"));
    var tx = el("div"); tx.appendChild(el("b", null, "Eleito: " + N.eleito)); tx.appendChild(el("span", null, "Resultado do 2º turno, segundo o TSE.")); ele.appendChild(tx); box.appendChild(ele);
    var duo = el("div", "duo");
    [["l", "Lula", N.l, N.pl], ["f", "Flávio Bolsonaro", N.f, N.pf]].forEach(function (c) {
      var d = el("div", "cand " + c[0]); d.appendChild(el("span", "nm", c[1])); d.appendChild(el("b", "pc", pc(c[3]))); d.appendChild(el("span", "vt", fmt(c[2]) + " votos")); duo.appendChild(d);
    });
    box.appendChild(duo);
    var br = el("div", "barra"); br.setAttribute("role", "img"); br.setAttribute("aria-label", "Lula " + pc(N.pl) + ", Flávio " + pc(N.pf));
    var bl = el("i", "l"); bl.style.width = N.pl + "%"; var bf = el("i", "f"); bf.style.width = N.pf + "%"; br.appendChild(bl); br.appendChild(bf); box.appendChild(br);
    box.appendChild(el("p", "nota", "Porcentagem dos votos válidos. Brancos e nulos não entram. Diferença: " + fmt(N.l - N.f) + " votos."));
    var fa = el("div", "fatos");
    [["Comparecimento (valor aproximado)", N.comparecimento], ["Abstenção (valor aproximado)", N.abstencao]].forEach(function (x) { var c = el("div", "card"); c.appendChild(el("b", null, x[1])); c.appendChild(el("span", null, x[0])); fa.appendChild(c); });
    box.appendChild(fa);
    fonte(box, ["tse"]);
  }

  /* ---- mapa 3D + lista ---- */
  var mapa = document.getElementById("mapa"), det = document.getElementById("det"), lista = document.getElementById("lista"), m3d = null, sel = null;
  function detalhe(uf) {
    det.textContent = "";
    var e = uf ? porUF[uf] : null;
    if (!e) { det.appendChild(el("p", "nota", "Toque num estado no mapa ou na lista para ver a porcentagem e os votos de cada candidato.")); return; }
    det.appendChild(el("h4", null, e.nome + " (" + e.uf + ")"));
    det.appendChild(el("p", "l", "Lula: " + pc(e.pl) + " · " + fmt(e.l) + " votos"));
    det.appendChild(el("p", "f", "Flávio Bolsonaro: " + pc(e.pf) + " · " + fmt(e.f) + " votos"));
    det.appendChild(el("p", "nota", "Venceu " + (e.lider === "l" ? "Lula" : "Flávio Bolsonaro") + ", com " + fmt(Math.abs(e.l - e.f)) + " votos de vantagem. Votos válidos no estado: " + fmt(e.v) + "."));
  }
  function marcar(uf) {
    sel = uf; detalhe(uf);
    Array.prototype.forEach.call(lista.children, function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-uf") === uf ? "true" : "false"); });
  }
  est.forEach(function (e) {
    var b = el("button", "row"); b.type = "button"; b.setAttribute("data-uf", e.uf); b.setAttribute("aria-pressed", "false");
    b.appendChild(el("span", "u", e.uf));
    var bar = el("span", "bar"), a = el("i", "l"), c = el("i", "f"); a.style.width = e.pl + "%"; c.style.width = e.pf + "%"; bar.appendChild(a); bar.appendChild(c); b.appendChild(bar);
    b.appendChild(el("span", "q", e.nome + ": " + (e.lider === "l" ? "Lula " + pc(e.pl) : "Flávio " + pc(e.pf))));
    b.addEventListener("click", function () { var novo = sel === e.uf ? null : e.uf; marcar(novo); if (m3d) m3d.selecionar(novo); });
    lista.appendChild(b);
  });
  marcar(null);
  function criar3D() {
    if (m3d || !window.Mapa3D || !Mapa3D.ok()) return false;
    mapa.textContent = "";
    try { m3d = Mapa3D.criar(mapa, { onSelecionar: function (uf) { marcar(uf); } }); } catch (e) { m3d = null; }
    if (!m3d) return false;
    mapa.classList.remove("sem"); m3d.setData(est); return true;
  }
  var tent = 0;
  (function tenta() {
    if (criar3D()) return;
    if (tent++ < 20) { setTimeout(tenta, 400); return; }
    mapa.classList.add("sem"); mapa.textContent = "";
    mapa.appendChild(el("p", "nota", "Seu aparelho não mostrou o mapa 3D. Use a lista abaixo para ver cada estado."));
  })();

  /* ---- fontes e navegação ---- */
  var fl = document.getElementById("fontes-lista");
  if (fl) Object.keys(S.fontes).forEach(function (k) { var li = el("li"); li.appendChild(link(S.fontes[k])); fl.appendChild(li); });
  var links = {}; Array.prototype.forEach.call(document.querySelectorAll(".nav a"), function (a) { links[a.getAttribute("href").slice(1)] = a; });
  if (window.IntersectionObserver) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { Object.keys(links).forEach(function (k) { links[k].classList.toggle("on", k === x.target.id); }); } });
    }, { rootMargin: "-35% 0px -55% 0px" });
    Object.keys(links).forEach(function (k) { var s = document.getElementById(k); if (s) io.observe(s); });
  }
  if ("serviceWorker" in navigator) window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  /* abertura 3D: uma vez por sessão, toque pula */
  var sp = document.getElementById("splash");
  if (sp) {
    var vis = false; try { vis = sessionStorage.getItem("splash") === "1"; } catch (e) {}
    if (vis) sp.remove(); else {
      try { sessionStorage.setItem("splash", "1"); } catch (e) {}
      var rm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      var fim = function () { if (sp.classList.contains("sai")) return; sp.classList.add("sai"); setTimeout(function () { sp.remove(); }, rm ? 60 : 420); };
      sp.addEventListener("click", fim); setTimeout(fim, rm ? 500 : 2600);
    }
  }
})();
