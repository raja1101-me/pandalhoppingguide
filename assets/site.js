/* Shared behaviour for every page: language, toast, copy buttons, countdowns */
(function(){
  "use strict";
  var root=document.documentElement;
  function setLang(l,silent){
    root.dataset.lang=l; root.lang=(l==="bn"?"bn":"en");
    try{ localStorage.setItem("pujo-lang",l); }catch(e){}
    var bs=document.querySelectorAll("[data-lang-btn]");
    for(var i=0;i<bs.length;i++) bs[i].setAttribute("aria-pressed",String(bs[i].getAttribute("data-lang-btn")===l));
    var ph=document.querySelectorAll("[data-ph-en]");
    for(var j=0;j<ph.length;j++) ph[j].placeholder=(l==="bn"&&ph[j].getAttribute("data-ph-bn"))||ph[j].getAttribute("data-ph-en");
    if(!silent) document.dispatchEvent(new Event("langchange"));
    countdowns();
  }
  var toastTimer;
  function toast(msg){
    var t=document.getElementById("toast"); if(!t) return;
    t.textContent=msg; t.classList.add("show"); clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){ t.classList.remove("show"); },2100);
  }
  function copyText(text){
    function done(){ toast(root.dataset.lang==="bn"?"কপি হয়েছে":"Copied"); }
    function fallback(){
      var ta=document.createElement("textarea"); ta.value=text; ta.style.position="fixed"; ta.style.opacity="0";
      document.body.appendChild(ta); ta.select(); var ok=false; try{ ok=document.execCommand("copy"); }catch(e){}
      ta.remove(); if(ok) done(); else toast(root.dataset.lang==="bn"?"নির্বাচন করে কপি করুন":"Select the text and copy it");
    }
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done,fallback); else fallback();
  }
  function countdowns(){
    var els=document.querySelectorAll("[data-countdown]"), now=Date.now();
    for(var i=0;i<els.length;i++){
      var el=els[i], d=el.getAttribute("data-countdown").split("-").map(Number);
      var start=Date.UTC(d[0],d[1]-1,d[2])-5.5*3600*1000, n=Math.ceil((start-now)/86400000), en,bn;
      var digits=function(x){return String(x).replace(/\d/g,function(c){return "০১২৩৪৫৬৭৮৯"[c];});};
      if(now>=start&&now<start+86400000){ en="Today"; bn="আজ"; }
      else if(now>=start+86400000){ en="Done for this year"; bn="এ বছরের মতো শেষ"; }
      else if(n===1){ en="Tomorrow"; bn="আগামীকাল"; }
      else { en=n+" days to go"; bn=digits(n)+" দিন বাকি"; }
      el.innerHTML='<span class="en">'+en+'</span><span class="bn">'+bn+'</span>';
    }
  }
  function lights(){
    var box=document.getElementById("lights"); if(!box||box.querySelector(".bulb")) return;
    var N=26, cols=["#FFD24D","#FFAE1A","#FFF3C4","#FF8A3D","#FF5A4D"];
    for(var i=0;i<N;i++){ var x=(i+.5)/N*1200, t=(x%300)/300, y=(1-t)*(1-t)*4+2*(1-t)*t*40+t*t*4;
      var s=document.createElement("span"); s.className="bulb"; s.style.left=(x/12)+"%"; s.style.top=(y-3)+"px";
      s.style.setProperty("--c",cols[i%cols.length]); s.style.setProperty("--d",(Math.random()*2.6).toFixed(2)+"s"); box.appendChild(s); }
    var hb=document.getElementById("hero-band"); if(hb){ hb.classList.add("intro"); setTimeout(function(){ hb.classList.remove("intro"); },2000); }
  }
  window.PHG={toast:toast,copy:copyText,setLang:setLang};
  document.addEventListener("click",function(e){
    var lb=e.target.closest("[data-lang-btn]"); if(lb){ setLang(lb.getAttribute("data-lang-btn")); return; }
    var cb=e.target.closest("[data-copy]"); if(cb){ e.preventDefault(); copyText(cb.getAttribute("data-copy")); }
  });
  var tabs=document.querySelector(".tabs"); if(tabs){ var a=tabs.querySelector('[aria-current="page"]'); if(a&&tabs.scrollWidth>tabs.clientWidth) tabs.scrollLeft=Math.max(0,a.offsetLeft-24); }
  setLang(root.dataset.lang==="bn"?"bn":"en",true);
  countdowns(); setInterval(countdowns,60000); lights();
})();
