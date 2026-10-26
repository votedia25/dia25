/* Mapa do Brasil em 3D de verdade (three.js): cada estado é um bloco extrudado.
   Altura = votos válidos do estado. Cor = quem venceu. Arraste para girar, toque num estado para ver o percentual.
   Usa o three.js que o app já carrega. Sem WebGL, apuracao.js desenha o mapa em SVG. */
(function () {
  var REDUZ = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FRACO = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  var S = 10 / 613, CX = 306.5, CZ = 319.5;
  function css(n, fb) { var v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || fb; }
  function webgl() { try { var c = document.createElement("canvas"); return !!(c.getContext("webgl") || c.getContext("experimental-webgl")); } catch (e) { return false; } }
  function altura(ap) { return 0.2 + 1.25 * ap / 100; }

  window.Mapa3D = {
    ok: function () { return !!(window.THREE && window.BR_POLY && webgl()); },
    criar: function (host, opt) {
      var T = window.THREE, r;
      try { r = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" }); } catch (e) { return null; }
      r.setClearColor(0x000000, 0);
      var cv = r.domElement;
      cv.className = "m3d-cv"; cv.setAttribute("role", "img");
      cv.setAttribute("aria-label", "Mapa do Brasil em 3D. A altura de cada estado mostra o total de votos válidos e a cor, quem venceu. Os dados completos estão na lista abaixo.");
      cv.style.cssText = "width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab";
      host.classList.add("m3d"); host.appendChild(cv);
      var labs = document.createElement("div"); labs.className = "m3d-labs"; labs.setAttribute("aria-hidden", "true"); host.appendChild(labs);
      var call = document.createElement("div"); call.className = "m3d-call"; call.hidden = true; call.setAttribute("aria-hidden", "true"); host.appendChild(call);
      var dica = document.createElement("p"); dica.className = "m3d-dica"; dica.textContent = "Arraste: girar · Pinça ou +/−: zoom · Toque: estado"; dica.setAttribute("aria-hidden", "true"); host.appendChild(dica);

      var zb = document.createElement("div"); zb.className = "m3d-zoom";
      [["+", "Aproximar"], ["−", "Afastar"], ["1×", "Voltar ao tamanho inicial"], ["⤢", "Expandir o mapa em tela cheia"]].forEach(function (x, i) {
        var b = document.createElement("button"); b.type = "button"; b.textContent = x[0]; b.setAttribute("aria-label", x[1]); b.dataset.z = i; zb.appendChild(b);
      });
      host.appendChild(zb);
      var REG = [["Brasil", []], ["Norte", ["AC","AM","AP","PA","RO","RR","TO"]], ["Nordeste", ["AL","BA","CE","MA","PB","PE","PI","RN","SE"]], ["Centro-Oeste", ["DF","GO","MS","MT"]], ["Sudeste", ["ES","MG","RJ","SP"]], ["Sul", ["PR","RS","SC"]]];
      var rg = document.createElement("div"); rg.className = "m3d-reg"; rg.setAttribute("role", "group"); rg.setAttribute("aria-label", "Ir para uma região");
      REG.forEach(function (x, i) { var b = document.createElement("button"); b.type = "button"; b.textContent = x[0]; b.dataset.r = i; rg.appendChild(b); });
      host.appendChild(rg);

      var scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 100);
      scene.add(new T.AmbientLight(0xffffff, 0.8));
      var sol = new T.DirectionalLight(0xffffff, 0.6); sol.position.set(-5, 9, 6); scene.add(sol);
      var raiz = new T.Group(); scene.add(raiz);
      var linhaM = new T.LineBasicMaterial({ color: new T.Color(css("--ink", "#141010")) });
      var est = {}, meshes = [];
      Object.keys(window.BR_POLY).forEach(function (id) {
        var polys = window.BR_POLY[id];
        var shapes = polys.map(function (a) { var p = []; for (var i = 0; i < a.length; i += 2) p.push(new T.Vector2((a[i] - CX) * S, -(a[i + 1] - CZ) * S)); return new T.Shape(p); });
        var geo = new T.ExtrudeGeometry(shapes, { depth: 1, bevelEnabled: false });
        var topM = new T.MeshLambertMaterial({ color: 0xcccccc }), sideM = new T.MeshLambertMaterial({ color: 0x888888 });
        var mesh = new T.Mesh(geo, [topM, sideM]); mesh.rotation.x = -Math.PI / 2; mesh.userData.uf = id; raiz.add(mesh); meshes.push(mesh);
        var g = new T.Group(); raiz.add(g);
        var minx = 1e9, maxx = -1e9, minz = 1e9, maxz = -1e9;
        polys.forEach(function (a) {
          var p = [];
          for (var i = 0; i < a.length; i += 2) { var x = (a[i] - CX) * S, z = (a[i + 1] - CZ) * S; p.push(new T.Vector3(x, 0, z)); if (x < minx) minx = x; if (x > maxx) maxx = x; if (z < minz) minz = z; if (z > maxz) maxz = z; }
          g.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(p), linhaM));
        });
        var lab = document.createElement("span"); lab.textContent = id; lab.hidden = (maxx - minx) < 1.15;
        labs.appendChild(lab);
        est[id] = { mesh: mesh, g: g, topM: topM, sideM: sideM, cur: altura(0), alvo: altura(0), bx: (minx + maxx) / 2, bz: (minz + maxz) / 2, lab: lab, larg: maxx - minx, dado: null, lider: "n" };
      });

      var yaw = -0.3, yawA = -0.3, pit = 0.95, pitA = 0.95, R = 20, Z = 1, tx = 0, tz = 0, voo = null, sel = null, t0 = performance.now(), arrastando = false, vis = false, raf = 0, w = 300, h = 300;
      var ray = new T.Raycaster(), v = new T.Vector2();

      function cores(l) {
        if (l === "l") return [css("--lula", "#D0121F"), css("--lula-d", "#7D0A1A")];
        if (l === "f") return [css("--flavio", "#1F4FB4"), css("--flavio-d", "#10285E")];
        if (l === "e") return [css("--hair", "#D2CBC4"), css("--muted", "#5E5855")];
        return [css("--paper", "#F6F3EE"), css("--hair", "#D2CBC4")];
      }
      function pintarCores() {
        linhaM.color.set(css("--ink", "#141010"));
        Object.keys(est).forEach(function (id) {
          var e = est[id], c = cores(e.lider); e.topM.color.set(c[0]); e.sideM.color.set(c[1]);
          if (id === sel) e.topM.color.lerp(new T.Color(0xffffff), 0.28);
        });
      }
      function metas() { Object.keys(est).forEach(function (id) { var e = est[id]; e.alvo = (e.dado ? altura(e.dado.ap) : altura(0)) + (id === sel ? 0.4 : 0); }); }
      function pos() {
        var Rz = R / Z;
        cam.position.set(tx + Rz * Math.sin(yaw) * Math.cos(pit), 0.4 + Rz * Math.sin(pit), tz + Rz * Math.cos(yaw) * Math.cos(pit));
        cam.lookAt(tx, 0.3, tz + 0.2);
      }
      function resize() {
        w = host.clientWidth || 300; h = host.clientHeight || 300;
        r.setPixelRatio(Math.min(window.devicePixelRatio || 1, FRACO ? 1.25 : 2)); r.setSize(w, h, false);
        cam.aspect = w / h; var ju = host.classList.contains("full") ? 0.82 : 0.78; R = ju * Math.max(22, 8.3 / (0.268 * Math.min(cam.aspect, 1.3))); cam.updateProjectionMatrix(); acordar();
      }
      var plano = new T.Plane(new T.Vector3(0, 1, 0), -0.3), pt = new T.Vector3();
      function chao(cx, cy) {
        var rc = cv.getBoundingClientRect();
        v.set(((cx - rc.left) / rc.width) * 2 - 1, -((cy - rc.top) / rc.height) * 2 + 1);
        ray.setFromCamera(v, cam);
        return ray.ray.intersectPlane(plano, pt) ? pt.clone() : null;
      }
      function limitar() { var L = 7 * (1 - 1 / Z); tx = Math.max(-L, Math.min(L, tx)); tz = Math.max(-L, Math.min(L, tz)); if (Z <= 1.001) { tx = 0; tz = 0; } }
      function rotulos() { Object.keys(est).forEach(function (id) { est[id].lab.hidden = est[id].larg * Z < 1.15; }); }
      function zoomEm(f, cx, cy) {
        voo = null;
        var rc = cv.getBoundingClientRect();
        if (cx == null) { cx = rc.left + rc.width / 2; cy = rc.top + rc.height / 2; }
        pos(); cam.updateMatrixWorld(); var a = chao(cx, cy);
        Z = Math.max(1, Math.min(5, Z * f));
        pos(); cam.updateMatrixWorld(); var b = chao(cx, cy);
        if (a && b) { tx += a.x - b.x; tz += a.z - b.z; }
        limitar(); rotulos(); acordar();
      }
      function panDe(x0, y0, x1, y1) {
        voo = null;
        pos(); cam.updateMatrixWorld(); var a = chao(x0, y0), b = chao(x1, y1);
        if (a && b) { tx += a.x - b.x; tz += a.z - b.z; limitar(); }
      }
      function voarPara(z, x, zz) { z = Math.max(1, Math.min(5, z)); var L = 7 * (1 - 1 / z); voo = { z: z, x: Math.max(-L, Math.min(L, x)), zz: Math.max(-L, Math.min(L, zz)) }; if (z <= 1) { voo.x = 0; voo.zz = 0; } acordar(); }
      function irRegiao(i) {
        var ufs = REG[i][1]; if (!ufs.length) { voarPara(1, 0, 0); return; }
        var x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
        ufs.forEach(function (u) { var e = est[u]; if (!e) return; x0 = Math.min(x0, e.bx); x1 = Math.max(x1, e.bx); z0 = Math.min(z0, e.bz); z1 = Math.max(z1, e.bz); });
        var ext = Math.max(x1 - x0, z1 - z0) + 2.2;
        voarPara(Math.min(3.4, Math.max(1.6, 8 / ext)), (x0 + x1) / 2, (z0 + z1) / 2 - 0.2);
      }
      rg.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) irRegiao(+b.dataset.r); });
      function expandir(on) {
        var ja = host.classList.contains("full"); if (on === undefined) on = !ja; if (on === ja) return;
        host.classList.toggle("full", on); document.documentElement.classList.toggle("m3d-trava", on);
        zb.querySelector('[data-z="3"]').textContent = on ? "✕" : "⤢"; zb.querySelector('[data-z="3"]').setAttribute("aria-label", on ? "Fechar tela cheia" : "Expandir o mapa em tela cheia");
        setTimeout(resize, 30); acordar();
      }
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") expandir(false); });
      function modoFoco() { return host.classList.contains("full") || document.documentElement.getAttribute("data-fase") === "apuracao"; }
      zb.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        var i = +b.dataset.z;
        voo = null; if (i === 0) zoomEm(1.6); else if (i === 1) zoomEm(1 / 1.6); else if (i === 2) voarPara(1, 0, 0); else expandir();
      });
      cv.addEventListener("wheel", function (e) { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); zoomEm(Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY); }, { passive: false });
      cv.addEventListener("dblclick", function (e) { zoomEm(Z >= 3 ? 1 / Z : 2, e.clientX, e.clientY); });

      function projetar(x, y, z) { var p = new T.Vector3(x, y, z).project(cam); return [(p.x * 0.5 + 0.5) * w, (-p.y * 0.5 + 0.5) * h]; }
      function frame(now) {
        var mexe = false;
        Object.keys(est).forEach(function (id) {
          var e = est[id], d = e.alvo - e.cur;
          if (Math.abs(d) > 0.002) { e.cur += REDUZ ? d : d * 0.16; mexe = true; } else e.cur = e.alvo;
          e.mesh.scale.z = e.cur; e.g.position.y = e.cur + 0.004;
        });
        if (voo) {
          var dz = voo.z - Z, dx2 = voo.x - tx, dz2 = voo.zz - tz;
          if (Math.abs(dz) < 0.01 && Math.abs(dx2) < 0.01 && Math.abs(dz2) < 0.01) { Z = voo.z; tx = voo.x; tz = voo.zz; voo = null; }
          else { Z += dz * 0.16; tx += dx2 * 0.16; tz += dz2 * 0.16; }
          limitar(); rotulos(); mexe = true;
        }
        var t = now - t0, sway = !REDUZ && !arrastando && t < 5200;
        if (sway) yawA = -0.3 + Math.sin(t / 1300) * 0.28 * Math.max(0, 1 - t / 5200);
        yaw += (yawA - yaw) * 0.14; pit += (pitA - pit) * 0.14;
        var gira = arrastando || sway || Math.abs(yawA - yaw) > 0.002 || Math.abs(pitA - pit) > 0.002;
        pos(); r.render(scene, cam);
        Object.keys(est).forEach(function (id) {
          var e = est[id]; if (e.lab.hidden) return;
          var p = projetar(e.bx, e.cur, e.bz); e.lab.style.transform = "translate(" + p[0].toFixed(1) + "px," + p[1].toFixed(1) + "px) translate(-50%,-50%)";
        });
        if (sel && est[sel]) {
          var e = est[sel], p = projetar(e.bx, e.cur, e.bz);
          call.style.transform = "translate(" + Math.max(70, Math.min(w - 70, p[0])).toFixed(1) + "px," + Math.max(62, p[1]).toFixed(1) + "px) translate(-50%,-125%)";
        }
        return mexe || gira;
      }
      function loop(now) { raf = 0; if (!vis || document.hidden) return; if (frame(now)) raf = requestAnimationFrame(loop); }
      function acordar() { if (!raf && vis) raf = requestAnimationFrame(loop); }

      function texto(id) {
        var e = est[id], d = e && e.dado; if (!d) return id + ": sem dados";
        return (d.linhas || [d.nome]).join("\n");
      }
      function mostrar() {
        if (!sel) { call.hidden = true; return; }
        call.textContent = ""; texto(sel).split("\n").forEach(function (t, i) { var s = document.createElement(i ? "span" : "b"); s.textContent = t; call.appendChild(s); });
        call.hidden = false;
      }
      var api = {
        setData: function (lista) {
          Object.keys(est).forEach(function (id) { est[id].dado = null; est[id].lider = "n"; });
          lista.forEach(function (d) { var e = est[d.uf]; if (e) { e.dado = d; e.lider = d.lider; } });
          metas(); pintarCores(); mostrar(); acordar();
        },
        selecionar: function (uf) { sel = uf && est[uf] ? uf : null; metas(); pintarCores(); mostrar(); acordar(); },
        recolorir: function () { pintarCores(); acordar(); },
        destruir: function () { cancelAnimationFrame(raf); try { r.dispose(); r.forceContextLoss(); } catch (e) {} if (cv.parentNode) cv.parentNode.removeChild(cv); labs.remove(); zb.remove(); rg.remove(); document.documentElement.classList.remove("m3d-trava"); call.remove(); dica.remove(); host.classList.remove("m3d"); }
      };

      /* arrastar para girar; toque curto escolhe o estado */
      var d0 = null, dedos = {}, pinca = null;
      function dois() { var k = Object.keys(dedos); if (k.length < 2) return null; var a = dedos[k[0]], b = dedos[k[1]]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
      cv.addEventListener("pointerdown", function (e) {
        dedos[e.pointerId] = { x: e.clientX, y: e.clientY };
        if (Object.keys(dedos).length >= 2) { d0 = null; arrastando = false; pinca = dois(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} return; }
        d0 = { x: e.clientX, y: e.clientY, a: yawA, p: pitA, m: false, t: performance.now() }; try { cv.setPointerCapture(e.pointerId); } catch (x) {} });
      cv.addEventListener("pointermove", function (e) {
        if (dedos[e.pointerId]) { dedos[e.pointerId].x = e.clientX; dedos[e.pointerId].y = e.clientY; }
        if (pinca) { var n = dois(); if (n) { panDe(pinca.x, pinca.y, n.x, n.y); zoomEm(n.d / pinca.d, n.x, n.y); pinca = n; } return; }
        if (!d0) return;
        var dx = e.clientX - d0.x, dy = e.clientY - d0.y;
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) { d0.m = true; arrastando = true; cv.style.cursor = "grabbing"; }
        if (d0.m) { yawA = d0.a - dx / w * 4; if (e.pointerType === "mouse") pitA = Math.max(0.35, Math.min(1.4, d0.p + dy / h * 2.2)); acordar(); }
      });
      function fim(e) {
        delete dedos[e.pointerId];
        if (pinca) { if (Object.keys(dedos).length < 2) pinca = null; d0 = null; arrastando = false; return; }
        if (!d0) return;
        var toque = !d0.m && performance.now() - d0.t < 500;
        d0 = null; arrastando = false; cv.style.cursor = "grab"; acordar();
        if (toque) {
          var rc = cv.getBoundingClientRect();
          v.set(((e.clientX - rc.left) / rc.width) * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1);
          ray.setFromCamera(v, cam);
          var hit = ray.intersectObjects(meshes, false)[0];
          var uf = hit ? hit.object.userData.uf : null;
          var novo = uf === sel ? null : uf;
          api.selecionar(novo);
          if (modoFoco()) { if (novo && est[novo]) voarPara(Math.max(Z, 2.4), est[novo].bx, est[novo].bz - 0.2); else if (!novo) voarPara(Math.min(Z, 1.6), tx, tz); }
          if (opt && opt.onSelecionar) opt.onSelecionar(novo);
        }
      }
      cv.addEventListener("pointerup", fim); cv.addEventListener("pointercancel", function (e) { delete dedos[e.pointerId]; pinca = null; d0 = null; arrastando = false; });
      cv.addEventListener("webglcontextlost", function (e) { e.preventDefault(); });
      if (window.IntersectionObserver) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) { t0 = performance.now(); acordar(); } }, { rootMargin: "80px" }).observe(host); else vis = true;
      if (window.ResizeObserver) new ResizeObserver(resize).observe(host);
      document.addEventListener("visibilitychange", acordar);
      if (window.matchMedia) { var mq = matchMedia("(prefers-color-scheme: dark)"); if (mq.addEventListener) mq.addEventListener("change", function () { setTimeout(api.recolorir, 50); }); }
      api.dbg = function () { return { Z: Z, tx: tx, tz: tz, voo: voo, ne: [est.MA.bx, est.MA.bz, est.BA.bx, est.BA.bz, est.CE.bx, est.CE.bz, est.AL.bx, est.AL.bz] }; };
      if (/[?&]dbg=1/.test(location.search)) window.__m = api;
      resize(); pos(); r.render(scene, cam);
      return api;
    }
  };
})();
