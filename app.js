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

  var N = S.nacional, REDUZ = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function vibra() { try { if (navigator.vibrate) navigator.vibrate(10); } catch (e) {} }
  function $(id) { return document.getElementById(id); }

  /* ---- início: placar 3D e números ---- */
  var p3 = $("p3"), placar = null;
  function criarPlacar() {
    if (placar || !window.Placar3D || !window.THREE) return;
    try { placar = Placar3D.criar(p3, N); } catch (e) { placar = null; }
    if (!placar) { p3.classList.add("sem"); p3.textContent = ""; p3.appendChild(el("p", null, "Lula " + pc(N.pl) + " (" + fmt(N.l) + " votos) · Flávio Bolsonaro " + pc(N.pf) + " (" + fmt(N.f) + " votos)")); }
  }
  var quem = $("quem"); if (quem) quem.textContent = "Lula " + pc(N.pl) + " e Flávio Bolsonaro " + pc(N.pf) + " dos votos válidos";
  function contar(e, ate, dec, suf) {
    if (REDUZ) { e.textContent = ate.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; return; }
    var t0 = null; function f(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 900), v = ate * (1 - Math.pow(1 - k, 3)); e.textContent = v.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; if (k < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }
  var fa = $("fatos");
  [["Comparecimento (valor aproximado)", 128.2, 1, " milhões"], ["Abstenção (valor aproximado)", 19.2, 1, "%"]].forEach(function (x) {
    var d = el("div", "fato"), b = el("b", null, ""); d.appendChild(b); d.appendChild(el("span", null, x[0])); fa.appendChild(d); contar(b, x[1], x[2], x[3]);
  });

  /* ---- resultado: mapa 3D + folha inferior ---- */
  var vr = $("v-resultado"), mapa = $("mapa"), m3d = null, sel = null;
  var shPeek = $("sh-peek"), shEst = $("sh-est"), shLista = $("sh-lista"), lista = $("lista"), grab = $("grab");
  (function () {
    var d = $("sh-duo");
    [["l", "Lula", N.l, N.pl], ["f", "Flávio Bolsonaro", N.f, N.pf]].forEach(function (c) { var x = el("div", "cd " + c[0]); x.appendChild(el("span", null, c[1])); x.appendChild(el("b", null, pc(c[3]))); x.appendChild(el("small", null, fmt(c[2]) + " votos")); d.appendChild(x); });
    var br = $("sh-barra"); br.setAttribute("aria-label", "Lula " + pc(N.pl) + ", Flávio " + pc(N.pf));
    var l = el("i", "l"), f = el("i", "f"); l.style.width = N.pl + "%"; f.style.width = N.pf + "%"; br.appendChild(l); br.appendChild(f);
  })();
  function modo(m) {
    vr.setAttribute("data-m", m);
    shPeek.hidden = m !== "peek"; shEst.hidden = m !== "estado"; shLista.hidden = m !== "lista";
    grab.setAttribute("aria-label", m === "lista" ? "Fechar a lista de estados" : "Abrir a lista de estados");
    if (m === "lista") { var on = lista.querySelector('[aria-pressed="true"]'); if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest" }); }
  }
  function detalhe(e) {
    shEst.textContent = "";
    var cab = el("div", "sh-cab"); cab.appendChild(el("b", null, e.nome + " (" + e.uf + ")"));
    var x = el("button", null, "Limpar"); x.type = "button"; x.addEventListener("click", function () { marcar(null); if (m3d) m3d.selecionar(null); }); cab.appendChild(x); shEst.appendChild(cab);
    var duo = el("div", "duo");
    [["l", "Lula", e.l, e.pl], ["f", "Flávio Bolsonaro", e.f, e.pf]].forEach(function (c) { var d = el("div", "cd " + c[0]); d.appendChild(el("span", null, c[1])); d.appendChild(el("b", null, pc(c[3]))); d.appendChild(el("small", null, fmt(c[2]) + " votos")); duo.appendChild(d); });
    shEst.appendChild(duo);
    var br = el("div", "barra"); br.setAttribute("role", "img"); br.setAttribute("aria-label", "Lula " + pc(e.pl) + ", Flávio " + pc(e.pf));
    var l = el("i", "l"), f = el("i", "f"); l.style.width = e.pl + "%"; f.style.width = e.pf + "%"; br.appendChild(l); br.appendChild(f); shEst.appendChild(br);
    shEst.appendChild(el("span", "venc " + e.lider, "Venceu " + (e.lider === "l" ? "Lula" : "Flávio") + " por " + fmt(Math.abs(e.l - e.f)) + " votos"));
  }
  function marcar(uf) {
    sel = uf;
    Array.prototype.forEach.call(lista.children, function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-uf") === uf ? "true" : "false"); });
    if (uf && porUF[uf]) { detalhe(porUF[uf]); modo("estado"); vibra(); } else modo("peek");
  }
  est.forEach(function (e) {
    var b = el("button", "row"); b.type = "button"; b.setAttribute("data-uf", e.uf); b.setAttribute("aria-pressed", "false");
    b.appendChild(el("span", "u", e.uf));
    var mid = el("span"); mid.appendChild(el("span", "nm", e.nome));
    var bar = el("span", "bar2"), a = el("i", "l"), c = el("i", "f"); a.style.width = e.pl + "%"; c.style.width = e.pf + "%"; bar.appendChild(a); bar.appendChild(c); mid.appendChild(bar); b.appendChild(mid);
    b.appendChild(el("span", "q", e.lider === "l" ? "Lula " + pc(e.pl) : "Flávio " + pc(e.pf)));
    b.addEventListener("click", function () { marcar(e.uf); if (m3d) m3d.selecionar(e.uf); });
    lista.appendChild(b);
  });
  $("b-lista").addEventListener("click", function () { modo("lista"); });
  $("b-fecha").addEventListener("click", function () { modo(sel ? "estado" : "peek"); });
  grab.addEventListener("click", function () { modo(vr.getAttribute("data-m") === "lista" ? (sel ? "estado" : "peek") : "lista"); });
  function criar3D() {
    if (m3d || !window.Mapa3D || !Mapa3D.ok()) return false;
    mapa.textContent = "";
    try { m3d = Mapa3D.criar(mapa, { onSelecionar: function (uf) { marcar(uf); } }); } catch (e) { m3d = null; }
    if (!m3d) return false;
    mapa.classList.remove("sem"); m3d.setData(est); return true;
  }
  var tent = 0;
  function tenta() {
    if (m3d || vr.hidden) return;
    if (criar3D()) return;
    if (tent++ < 25) { setTimeout(tenta, 400); return; }
    mapa.classList.add("sem"); mapa.textContent = ""; mapa.appendChild(el("p", "nota", "Seu aparelho não mostrou o mapa 3D. Abra a lista de estados para ver os números.")); modo("lista");
  }

  /* ---- fontes e navegação entre telas ---- */
  var fl = $("fontes-lista");
  if (fl) Object.keys(S.fontes).forEach(function (k) { var li = el("li"); li.appendChild(link(S.fontes[k])); fl.appendChild(li); });
  var telas = ["inicio", "resultado", "historico", "sobre"], tabs = document.querySelectorAll(".tabs a"), atual = null;
  function ir() {
    var h = (location.hash || "#inicio").slice(1); if (telas.indexOf(h) < 0) h = "inicio";
    if (h === atual) return;
    var antes = atual; atual = h;
    telas.forEach(function (t) { var v = $("v-" + t); if (!v) return; var on = t === h; v.hidden = !on; if (on) { v.classList.remove("in"); void v.offsetWidth; if (antes) v.classList.add("in"); } });
    Array.prototype.forEach.call(tabs, function (a) { if (a.getAttribute("href") === "#" + h) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    window.scrollTo(0, 0);
    if (antes) vibra();
    if (h === "inicio") { criarPlacar(); if (placar) { placar.resize(); placar.acordar(); } }
    if (h === "resultado") requestAnimationFrame(tenta);
    document.title = (h === "inicio" ? "" : { resultado: "Resultado", historico: "Histórico", sobre: "Sobre" }[h] + " · ") + "Sufrágio app";
  }
  window.addEventListener("hashchange", ir);
  var ini = function () { ir(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ini); else ini();
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
