/* Urna3D: urna eletrônica em 3D para a abertura. A tela mostra a logo do app no lugar da foto/nome de candidato. */
(function(){
"use strict";
window.Urna3D={criar:function(host,opc){
  var T=window.THREE; if(!T) return null;
  var r; try{ r=new T.WebGLRenderer({antialias:true,alpha:true}); }catch(e){ return null; }
  r.setClearColor(0x000000,0); host.appendChild(r.domElement); r.domElement.setAttribute("aria-hidden","true");
  var est=-1,parado=!!(opc&&opc.parado),vivo=true,t0=0;
  var cam=new T.PerspectiveCamera(30,1,.1,100);
var sc=new T.Scene();
sc.add(new T.AmbientLight(0xffffff,.55));var sol=new T.DirectionalLight(0xffffff,.8);sol.position.set(-4,8,6);sc.add(sol);
function M(c){return new T.MeshLambertMaterial({color:c})}
function tex(w,h,fn){var c=document.createElement("canvas");c.width=w;c.height=h;var t=new T.CanvasTexture(c);t.anisotropy=4;t.c=c;t.x=c.getContext("2d");fn(t.x,w,h,0);t.fn=fn;return t}
var raiz=new T.Group();sc.add(raiz);var u=new T.Group();raiz.add(u);
/* corpo */
var corpo=new T.Mesh(new T.BoxGeometry(4.6,.7,3),M(0x9A9AA6));corpo.position.y=.35;u.add(corpo);
var topo=new T.Group();topo.position.set(0,.8,0);topo.rotation.x=.42;u.add(topo);
var painel=new T.Mesh(new T.BoxGeometry(4.6,.12,3.1),M(0xC4C4CC));topo.add(painel);
/* tela */
var tela=tex(512,384,function(x,w,h,k){
  x.fillStyle="#F8FAFC";x.fillRect(0,0,w,h);
  x.fillStyle="#4F46E5";x.fillRect(0,0,w,14);
  /* urna logo */
  var cx=w/2-120,cy=h/2-20;
  x.fillStyle="#4F46E5";x.beginPath();x.roundRect(cx-52,cy-52,104,104,24);x.fill();
  x.fillStyle="#F8FAFC";x.font="800 80px Inter,Arial,sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText("S",cx,cy+4);
  x.fillStyle="#D946EF";x.beginPath();x.arc(cx+34,cy-34,9,0,7);x.fill();
  x.textAlign="left";x.fillStyle="#1E293B";x.font="800 54px Inter,Arial,sans-serif";x.fillText("Sufrágio",cx+78,cy-14);
  x.fillStyle="#D946EF";x.fillText("app",cx+78,cy+42);
  x.fillStyle="#475569";x.font="500 22px Inter,Arial,sans-serif";x.textAlign="center";
  x.fillText(k>0?"Seu voto foi conquistado.":"Resultado do 2º turno",w/2,h-92);
  x.strokeStyle="#CBD5E1";x.lineWidth=2;x.beginPath();x.moveTo(30,h-62);x.lineTo(w-30,h-62);x.stroke();
  x.font="600 16px Inter,Arial,sans-serif";x.fillStyle="#64748B";x.textAlign="left";x.fillText("Aperte a tecla:",30,h-34);
  x.fillStyle=k>0?"#16A34A":"#94A3B8";x.textAlign="right";x.fillText(k>0?"FIM":"CONFIRMA para entrar",w-30,h-34)});
var moldura=new T.Mesh(new T.BoxGeometry(2.7,.1,2.1),M(0x2B2B33));moldura.position.set(-.8,.08,-.05);topo.add(moldura);
var tl=new T.Mesh(new T.PlaneGeometry(2.45,1.84),new T.MeshBasicMaterial({map:tela}));tl.rotation.x=-Math.PI/2;tl.position.set(-.8,.14,-.05);topo.add(tl);
/* teclado */
var cores={B:"#F8FAFC",C:"#F59E0B",K:"#16A34A"};
var tec=tex(256,384,function(x,w,h,k){
  x.fillStyle="#2B2B33";x.fillRect(0,0,w,h);
  var n=[1,2,3,4,5,6,7,8,9,"",0,""];
  for(var i=0;i<12;i++){if(n[i]==="")continue;var c=i%3,rr=(i/3)|0,bx=22+c*76,by=18+rr*62;
    x.fillStyle="#52525B";x.beginPath();x.roundRect(bx,by,64,50,8);x.fill();x.fillStyle="#F4F4F5";x.font="700 26px Inter,Arial";x.textAlign="center";x.textBaseline="middle";x.fillText(n[i],bx+32,by+27)}
  var bt=[["BRANCO","#F8FAFC","#1E293B"],["CORRIGE","#F59E0B","#1E293B"],["CONFIRMA",k>0?"#4ADE80":"#16A34A","#fff"]];
  for(var j=0;j<3;j++){var bx=22+j*76,by=272;x.fillStyle=bt[j][1];x.beginPath();x.roundRect(bx,by,64,70,8);x.fill();x.fillStyle=bt[j][2];x.font="800 11px Inter,Arial";x.textAlign="center";x.fillText(bt[j][0],bx+32,by+35)}});
var tp=new T.Mesh(new T.PlaneGeometry(1.5,2.1),new T.MeshBasicMaterial({map:tec}));tp.rotation.x=-Math.PI/2;tp.position.set(1.55,.07,0);topo.add(tp);
var luz=new T.Mesh(new T.BoxGeometry(.25,.03,.05),new T.MeshBasicMaterial({color:0x3f3f46}));luz.position.set(1.55,.08,1.18);topo.add(luz);
/* palco */
var disco=new T.Mesh(new T.CylinderGeometry(3.6,3.6,.04,64),new T.MeshBasicMaterial({color:0x2E2A7A}));disco.position.y=-.02;sc.add(disco);
var aro=new T.Mesh(new T.TorusGeometry(3.6,.02,8,96),new T.MeshBasicMaterial({color:0xD946EF}));aro.rotation.x=Math.PI/2;aro.position.y=.01;sc.add(aro);
function ease(k){return 1-Math.pow(1-k,3)}
var est=-1;
function quadro(t){
  var e=ease(Math.min(1,t/1.2));
  raiz.position.y=(1-e)*-.6;raiz.scale.setScalar(.7+.3*e);
  raiz.rotation.y=-.7+(1-e)*1.2+Math.sin(t*.7)*.08;
  var k=t>1.7?1:0;
  if(k!==est){est=k;tela.fn(tela.x,512,384,k);tela.needsUpdate=true;tec.fn(tec.x,256,384,k);tec.needsUpdate=true;luz.material.color.set(k?0x4ADE80:0x3f3f46)}
  
}

  function tam(){var w=host.clientWidth||320,h=host.clientHeight||240;r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();var a=w/h;var d=Math.max(7.5,3.7/(Math.tan(Math.PI/12)*a));cam.position.set(0,d*.52,d*.86);cam.lookAt(0,.5,0)}
  window.addEventListener("resize",tam);tam();
  function parar(){vivo=false;window.removeEventListener("resize",tam);r.dispose&&r.dispose()}
  function loop(n){ if(!vivo||!host.isConnected){parar();return} if(!t0)t0=n; var t=(n-t0)/1000; quadro(Math.min(t,6)); r.render(sc,cam); requestAnimationFrame(loop)}
  if(parado){quadro(3);r.render(sc,cam)}else requestAnimationFrame(loop);
  return {parar:parar};
}};
})();
