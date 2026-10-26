/* Placar 3D: duas colunas com altura proporcional aos votos (a partir de zero, sem truncar a escala).
   Arraste para girar. Sem WebGL, o placar em texto continua na página. */
(function () {
  window.Placar3D = {
    criar: function (host, N) {
      var T = window.THREE; if (!T) return null;
      var REDUZ = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      var r; try { r = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" }); } catch (e) { return null; }
      r.setClearColor(0x000000, 0);
      var cv = r.domElement; cv.style.cssText = "width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab"; cv.setAttribute("aria-hidden", "true");
      host.appendChild(cv);
      var scene = new T.Scene(), cam = new T.PerspectiveCamera(32, 1, 0.1, 100);
      scene.add(new T.AmbientLight(0xffffff, 0.75));
      var sol = new T.DirectionalLight(0xffffff, 0.8); sol.position.set(-4, 8, 5); scene.add(sol);
      var raiz = new T.Group(); scene.add(raiz);
      var disco = new T.Mesh(new T.CylinderGeometry(3.1, 3.1, 0.16, 64), new T.MeshLambertMaterial({ color: 0x4F46E5 })); disco.position.y = -0.08; raiz.add(disco);
      var aro = new T.Mesh(new T.TorusGeometry(3.1, 0.025, 8, 96), new T.MeshBasicMaterial({ color: 0xD946EF })); aro.rotation.x = Math.PI / 2; aro.position.y = 0.005; raiz.add(aro);
      var ALTO = 3.3, dados = [
        { n: N.l, x: -1.05, cor: 0xFF5A5A, nome: "Lula" },
        { n: N.f, x: 1.05, cor: 0x7FA6FF, nome: "Flávio" }
      ];
      dados.forEach(function (d) {
        d.h = ALTO * d.n / Math.max(N.l, N.f);
        var g = new T.BoxGeometry(1.45, 1, 1.45);
        d.m = new T.Mesh(g, new T.MeshLambertMaterial({ color: d.cor })); d.m.position.x = d.x; raiz.add(d.m);
        d.l = new T.LineSegments(new T.EdgesGeometry(g), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })); d.l.position.x = d.x; raiz.add(d.l);
        d.cur = REDUZ ? d.h : 0.02;
      });
      var rot = -0.5, rotA = -0.5, w = 300, h = 300, vis = false, raf = 0, t0 = 0, arrasto = null, ocioso = true;
      function pos() { cam.position.set(0, 4.6, 10.2); cam.lookAt(0, 1.5, 0); }
      function resize() { w = host.clientWidth || 300; h = host.clientHeight || 300; r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); r.setSize(w, h, false); cam.aspect = w / h; cam.fov = w / h < 1.2 ? 40 : 32; cam.updateProjectionMatrix(); pos(); acordar(); }
      var labs = dados.map(function (d) { var e = document.createElement("div"); e.className = "p3-lab"; e.setAttribute("aria-hidden", "true"); host.appendChild(e); return e; });
      function proj(x, y, z) { var p = new T.Vector3(x, y, z); raiz.localToWorld(p); p.project(cam); return [(p.x * 0.5 + 0.5) * w, (-p.y * 0.5 + 0.5) * h]; }
      function pct(n) { return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%"; }
      var txt = [pct(N.pl), pct(N.pf)];
      labs.forEach(function (e, i) { var b = document.createElement("b"); b.textContent = txt[i]; var s = document.createElement("span"); s.textContent = dados[i].nome; e.appendChild(b); e.appendChild(s); });
      function frame(now) {
        if (!t0) t0 = now;
        var mexe = false, t = (now - t0) / 1000;
        dados.forEach(function (d) {
          var alvo = d.h, k = REDUZ ? 1 : 0.075;
          if (Math.abs(alvo - d.cur) > 0.003) { d.cur += (alvo - d.cur) * k; mexe = true; } else d.cur = alvo;
          d.m.scale.y = d.cur; d.m.position.y = d.cur / 2; d.l.scale.y = d.cur; d.l.position.y = d.cur / 2;
        });
        if (!arrasto && !REDUZ && ocioso) rotA = -0.5 + Math.sin(t * 0.6) * 0.35;
        rot += (rotA - rot) * 0.1; raiz.rotation.y = rot;
        r.render(scene, cam);
        dados.forEach(function (d, i) { var p = proj(d.x, d.cur + 0.15, 0); labs[i].style.transform = "translate(" + p[0].toFixed(1) + "px," + p[1].toFixed(1) + "px) translate(-50%,-100%)"; labs[i].style.opacity = d.cur / d.h > 0.6 ? 1 : 0; });
        return true;
      }
      function loop(now) { raf = 0; if (!vis || document.hidden) return; if (frame(now) && !REDUZ) raf = requestAnimationFrame(loop); else if (REDUZ) { frame(now); } }
      function acordar() { if (!raf && vis) raf = requestAnimationFrame(loop); }
      cv.addEventListener("pointerdown", function (e) { arrasto = { x: e.clientX, a: rotA }; ocioso = false; try { cv.setPointerCapture(e.pointerId); } catch (x) {} cv.style.cursor = "grabbing"; acordar(); });
      cv.addEventListener("pointermove", function (e) { if (!arrasto) return; rotA = arrasto.a + (e.clientX - arrasto.x) / w * 5; acordar(); });
      function solta() { arrasto = null; cv.style.cursor = "grab"; setTimeout(function () { ocioso = true; }, 2500); }
      cv.addEventListener("pointerup", solta); cv.addEventListener("pointercancel", solta);
      if (window.IntersectionObserver) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) { t0 = 0; acordar(); } }).observe(host); else vis = true;
      if (window.ResizeObserver) new ResizeObserver(resize).observe(host);
      document.addEventListener("visibilitychange", acordar);
      resize();
      return { acordar: acordar, resize: resize };
    }
  };
})();
