/* Pandal guide engine: filters, trail, in-page map, route planner. Data comes from #guide-data */
(function(){
  "use strict";
  var D=JSON.parse(document.getElementById("guide-data").textContent);
  var P=D.pandals, byId={}; P.forEach(function(p){ byId[p.id]=p; });
  var root=document.documentElement;
  function $(id){ return document.getElementById(id); }
  function isBn(){ return root.dataset.lang==="bn"; }
  function pick(e,b){ return (isBn()&&b)?b:e; }
  function nb(n){ n=String(n); return isBn()?n.replace(/\d/g,function(d){ return "০১২৩৪৫৬৭৮৯"[d]; }):n; }
  function esc(s){ return String(s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  var S={
   en:{add:"Add to my trail",inT:"In my trail",tAdd:"Added to your trail",tRem:"Removed from your trail",
     trailN:function(n){return n+" stop"+(n>1?"s":"")+" in your trail";},plan:"View plan",clear:"Clear",
     selPh:function(n){return n?("Stops selected: "+n+" (tap to change)"):"Select stops from the list…";},
     all:"All",none:"No stops match your search.",auto:"Best order (automatic)",min:function(m){return m+" min";},
     empty:"Select at least two stops and your route will appear here.",one:"Add one more stop to get a route.",
     walk:function(m,k){return "About "+m+" min on foot ("+k+" km)";},ride:function(m,k){return "About "+m+" min by cab, bus or train ("+k+" km)";},
     total:function(n,k,e){return n+" stops · about "+k+" km of travel · finishing around "+e;},
     legs:function(a,b){return "Open stops "+a+" to "+b+" in Maps";},wa:"Share plan on WhatsApp",rm:"Remove",past:"after midnight",
     head:"My Kali Puja plan",noMetro:"No metro close by",mapApp:"Open in Google Maps app",walkM:"Walk from metro",
     wrong:"Wrong spot? Try approximate pin",back:"Back to pin by name",loading:"Loading map…",
     mapNote:"Live Google Map: drag to move, pinch or use + and − to zoom. Temporary pandals may not be marked exactly, so check the spot before you travel.",
     lines:{B:"Blue Line",G:"Green Line",P:"Purple Line",N:"No metro"},far:"Far from central Kolkata: plan it as a separate trip.",sub:"stops"},
   bn:{add:"আমার ট্রেইলে যোগ করুন",inT:"ট্রেইলে আছে",tAdd:"ট্রেইলে যোগ হয়েছে",tRem:"ট্রেইল থেকে সরানো হয়েছে",
     trailN:function(n){return nb(n)+"টি স্টপ আপনার ট্রেইলে";},plan:"প্ল্যান দেখুন",clear:"মুছুন",
     selPh:function(n){return n?("বাছাই করা স্টপ: "+nb(n)+" (বদলাতে ছুঁয়ে দেখুন)"):"তালিকা থেকে স্টপ বেছে নিন…";},
     all:"সব",none:"আপনার খোঁজের সঙ্গে কোনো স্টপ মেলেনি।",auto:"সেরা ক্রম (স্বয়ংক্রিয়)",min:function(m){return nb(m)+" মিনিট";},
     empty:"অন্তত দুটি স্টপ বেছে নিন, এখানে আপনার রুট দেখা যাবে।",one:"রুট পেতে আরও একটি স্টপ যোগ করুন।",
     walk:function(m,k){return "প্রায় "+nb(m)+" মিনিট হাঁটা ("+nb(k)+" কিমি)";},ride:function(m,k){return "ক্যাব, বাস বা ট্রেনে প্রায় "+nb(m)+" মিনিট ("+nb(k)+" কিমি)";},
     total:function(n,k,e){return nb(n)+"টি স্টপ · প্রায় "+nb(k)+" কিমি যাতায়াত · শেষ হবে আনুমানিক "+e;},
     legs:function(a,b){return nb(a)+" থেকে "+nb(b)+" নম্বর স্টপ ম্যাপে খুলুন";},wa:"হোয়াটসঅ্যাপে প্ল্যান শেয়ার করুন",rm:"সরান",past:"মধ্যরাতের পরে",
     head:"আমার কালীপূজার প্ল্যান",noMetro:"কাছে মেট্রো নেই",mapApp:"গুগল ম্যাপ অ্যাপে খুলুন",walkM:"মেট্রো থেকে হাঁটা",
     wrong:"জায়গা ভুল? আনুমানিক পিন দেখুন",back:"নাম ধরে পিনে ফিরুন",loading:"ম্যাপ লোড হচ্ছে…",
     mapNote:"লাইভ গুগল ম্যাপ: টেনে সরান, আঙুল দিয়ে বা + ও − চেপে জুম করুন। অস্থায়ী প্যান্ডেল ঠিক জায়গায় চিহ্নিত নাও থাকতে পারে, তাই যাওয়ার আগে জায়গাটা মিলিয়ে নিন।",
     lines:{B:"নীল লাইন",G:"সবুজ লাইন",P:"বেগুনি লাইন",N:"মেট্রো নেই"},far:"মধ্য কলকাতা থেকে অনেক দূরে: আলাদা যাত্রা হিসেবে ভাবুন।",sub:"স্টপ"}
  };
  function t(k){ return S[isBn()?"bn":"en"][k]; }
  function nameL(p){ return pick(p.n,p.nb); } function areaL(p){ return pick(p.a,p.ab); } function metroL(p){ return pick(p.m,p.mb); }
  function qry(p){ return p.n+", "+p.a+", West Bengal"; }
  function mapUrl(p){ return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(qry(p)); }
  function walkUrl(p){ return "https://www.google.com/maps/dir/?api=1&travelmode=walking&origin="+encodeURIComponent(p.m+" Metro Station, Kolkata")+"&destination="+encodeURIComponent(qry(p)); }
  function bi(en,b){ return '<span class="en">'+esc(en)+'</span><span class="bn">'+esc(b||en)+'</span>'; }

  /* ---- trail ---- */
  var trail=[]; try{ var s=JSON.parse(localStorage.getItem(D.key)||"[]"); if(Array.isArray(s)) trail=s.filter(function(i){ return byId[i]; }); }catch(e){}
  function saveTrail(){ try{ localStorage.setItem(D.key,JSON.stringify(trail)); }catch(e){} }
  function addLabel(on){ return bi(on?S.en.inT:S.en.add,on?S.bn.inT:S.bn.add); }
  function syncButtons(){
    var bs=document.querySelectorAll(".btn.add[data-id]");
    for(var i=0;i<bs.length;i++){ var on=trail.indexOf(bs[i].getAttribute("data-id"))>-1; bs[i].setAttribute("aria-pressed",String(on)); bs[i].innerHTML=addLabel(on); }
  }
  function toggle(id,on){
    var i=trail.indexOf(id); if(on===undefined) on=(i===-1);
    if(on&&i===-1) trail.push(id); if(!on&&i>-1) trail.splice(i,1);
    saveTrail(); syncButtons(); renderTrailBar(); updatePlanner(); syncMsel();
    PHG.toast(on?t("tAdd"):t("tRem"));
    var b=document.querySelector('.btn.add[data-id="'+id+'"]'); if(b){ b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
  }
  document.addEventListener("click",function(e){ var b=e.target.closest(".btn.add[data-id]"); if(b){ e.preventDefault(); toggle(b.getAttribute("data-id")); } });

  /* ---- geometry and route order ---- */
  function rad(x){ return x*Math.PI/180; }
  function hav(a,b){ var R=6371,dl=rad(b[0]-a[0]),dg=rad(b[1]-a[1]); var s=Math.pow(Math.sin(dl/2),2)+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.pow(Math.sin(dg/2),2); return 2*R*Math.asin(Math.sqrt(s)); }
  function dist(a,b){ return hav(a.c,b.c)*1.35; }
  function planOrder(ids,first){
    var pts=ids.map(function(i){return byId[i];}).filter(Boolean), n=pts.length;
    if(n<3){ if(n===2){ if(first!=="auto"&&pts[1].id===first) pts.reverse(); else if(first==="auto"&&pts[1].c[0]>pts[0].c[0]) pts.reverse(); } return pts; }
    var Dm=pts.map(function(a){ return pts.map(function(b){ return dist(a,b); }); });
    function len(o){ var s=0; for(var i=0;i<o.length-1;i++) s+=Dm[o[i]][o[i+1]]; return s; }
    function nn(s){ var o=[s],left={}; for(var i=0;i<n;i++) left[i]=1; delete left[s];
      while(Object.keys(left).length){ var l=o[o.length-1],b=-1,bd=1e9; for(var j in left){ if(Dm[l][j]<bd){ bd=Dm[l][j]; b=+j; } } o.push(b); delete left[b]; } return o; }
    function opt(o,fixed){ var best=o,bl=len(o),imp=true,st=fixed?1:0;
      while(imp){ imp=false; for(var i=st;i<best.length-1;i++) for(var k=i+1;k<best.length;k++){
        var c=best.slice(0,i).concat(best.slice(i,k+1).reverse(),best.slice(k+1)), l=len(c); if(l<bl-1e-9){ best=c; bl=l; imp=true; } } }
      return best; }
    var fixed=first==="auto"?-1:pts.findIndex(function(p){return p.id===first;});
    var starts=fixed>=0?[fixed]:pts.map(function(_,i){return i;}), bestO=null,bestL=1e9;
    starts.forEach(function(s){ var o=opt(nn(s),fixed>=0),l=len(o); if(l<bestL-1e-9){ bestL=l; bestO=o; } });
    if(fixed<0){ var a=pts[bestO[0]],b=pts[bestO[bestO.length-1]]; if(b.c[0]>a.c[0]) bestO=bestO.slice().reverse(); }
    return bestO.map(function(i){return pts[i];});
  }
  function legUrl(stops){
    var q=function(p){return qry(p);}, w=stops.slice(1,-1).map(q).join("|");
    return "https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(q(stops[0]))+"&destination="+encodeURIComponent(q(stops[stops.length-1]))+(w?"&waypoints="+encodeURIComponent(w):"")+"&travelmode=driving";
  }
  function fmtTime(m){
    var past=m>=1440, x=m%1440, h=Math.floor(x/60), mm=x%60, h12=((h+11)%12)+1, ms=(mm<10?"0":"")+mm, s;
    if(isBn()){ var per=h<4?"রাত":h<6?"ভোর":h<12?"সকাল":h<16?"দুপুর":h<18?"বিকেল":h<20?"সন্ধ্যা":"রাত"; s=per+" "+nb(h12+":"+ms); }
    else s=h12+":"+ms+" "+(h<12?"am":"pm");
    return s+(past?" ("+t("past")+")":"");
  }

  /* ---- trail bar ---- */
  function renderTrailBar(){
    var el=$("trail"); if(!el) return;
    document.body.classList.toggle("has-trail",trail.length>0);
    if(!trail.length){ el.classList.remove("show"); return; }
    el.classList.add("show");
    var c=$("trail-count"), nt=t("trailN")(trail.length);
    if(c.textContent!==nt){ c.textContent=nt; c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }
    $("trail-plan").textContent=t("plan"); $("trail-clear").textContent=t("clear"); trailRoute();
  }

  /* ---- filters ---- */
  var region="all", query="";
  function renderChips(){
    var box=$("chips"); if(!box) return;
    var base=P.filter(function(p){ return !query||hay(p).indexOf(query)>-1; });
    var h='<button type="button" class="chip" data-r="all" aria-pressed="'+(region==="all")+'">'+esc(t("all"))+'<small>'+nb(base.length)+'</small></button>';
    D.regions.forEach(function(R){ var n=base.filter(function(p){return p.r===R.id;}).length; if(!n&&query) return;
      h+='<button type="button" class="chip" data-r="'+R.id+'" aria-pressed="'+(region===R.id)+'">'+esc(pick(R.en,R.bn))+'<small>'+nb(n)+'</small></button>'; });
    box.innerHTML=h;
  }
  function hay(p){ return (p.n+" "+(p.nb||"")+" "+p.a+" "+(p.ab||"")+" "+p.m+" "+(p.mb||"")+" "+(p.note||"")+" "+(p.noteb||"")).toLowerCase(); }
  function applyFilters(){
    var items=document.querySelectorAll("#v-list .item"), shown=0;
    for(var i=0;i<items.length;i++){ var p=byId[items[i].getAttribute("data-id")]; var ok=(region==="all"||p.r===region)&&(!query||hay(p).indexOf(query)>-1); items[i].hidden=!ok; if(ok) shown++; }
    var secs=document.querySelectorAll("#v-list .region-sec");
    for(var j=0;j<secs.length;j++){ var any=secs[j].querySelector(".item:not([hidden])"); secs[j].hidden=!any; }
    var nr=$("no-results"); if(nr){ nr.hidden=shown>0; nr.textContent=t("none"); }
    renderChips();
  }
  var chips=$("chips"); if(chips) chips.addEventListener("click",function(e){ var b=e.target.closest("[data-r]"); if(!b) return; region=b.getAttribute("data-r"); applyFilters(); });
  var qi=$("q"); if(qi) qi.addEventListener("input",function(){ query=qi.value.trim().toLowerCase(); applyFilters(); });

  /* ---- map window ---- */
  var mapP=null, mapMode="name";
  function embedUrl(p,mode){
    var hl=isBn()?"bn":"en", q=qry(p);
    if(D.mapsKey){ var k=encodeURIComponent(D.mapsKey);
      if(mode==="area") return "https://www.google.com/maps/embed/v1/view?key="+k+"&center="+p.c[0]+","+p.c[1]+"&zoom=15&language="+hl;
      return "https://www.google.com/maps/embed/v1/place?key="+k+"&q="+encodeURIComponent(q)+"&zoom=15&language="+hl; }
    if(mode==="area") return "https://maps.google.com/maps?q="+p.c[0]+","+p.c[1]+"&z=15&hl="+hl+"&output=embed";
    return "https://maps.google.com/maps?q="+encodeURIComponent(q)+"&z=15&hl="+hl+"&output=embed";
  }
  function renderMap(){
    var p=mapP; if(!p) return;
    $("mp-h").textContent=nameL(p);
    var metro=p.l==="N"?t("noMetro"):(metroL(p)+(p.ap?" ~":"")+" · "+t("lines")[p.l]);
    $("mp-sub").textContent=areaL(p)+" · "+metro;
    $("mp-load").textContent=t("loading"); $("mp-iframe").title=nameL(p); $("mp-iframe").src=embedUrl(p,mapMode);
    $("mp-note").textContent=t("mapNote");
    $("mp-app").textContent=t("mapApp"); $("mp-app").href=mapUrl(p);
    var w=$("mp-walk"); if(p.l==="N"){ w.hidden=true; } else { w.hidden=false; w.textContent=t("walkM"); w.href=walkUrl(p); }
    $("mp-mode").textContent=t(mapMode==="name"?"wrong":"back");
    var tb=$("mp-trail"), on=trail.indexOf(p.id)>-1; tb.setAttribute("data-id",p.id); tb.setAttribute("aria-pressed",String(on)); tb.innerHTML=addLabel(on);
  }
  function openMap(id){ var p=byId[id]; if(!p) return; mapP=p; mapMode="name"; renderMap(); var d=$("mapview"); if(!d.open){ if(d.showModal) d.showModal(); else d.setAttribute("open",""); } }
  document.addEventListener("click",function(e){
    var a=e.target.closest("a.mapbtn[data-map]"); if(!a) return;
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.button===1) return;
    e.preventDefault(); openMap(a.getAttribute("data-map"));
  });
  $("mp-x").addEventListener("click",function(){ $("mapview").close(); });
  $("mapview").addEventListener("click",function(e){ if(e.target===$("mapview")) $("mapview").close(); });
  $("mapview").addEventListener("close",function(){ $("mp-iframe").src="about:blank"; });
  $("mp-mode").addEventListener("click",function(){ mapMode=mapMode==="name"?"area":"name"; $("mp-iframe").src=embedUrl(mapP,mapMode); $("mp-mode").textContent=t(mapMode==="name"?"wrong":"back"); });

  /* ---- planner ---- */
  var plan={dwell:45,first:"auto"}, lastKey="";
  function selectedList(){ return trail.slice(); }
  function buildMsel(){
    var q=($("msel-q").value||"").trim().toLowerCase(), h="";
    D.regions.forEach(function(R){
      var items=P.filter(function(p){ return p.r===R.id&&(!q||hay(p).indexOf(q)>-1); }); if(!items.length) return;
      h+='<h4>'+esc(pick(R.en,R.bn))+'</h4>'+items.map(function(p){
        return '<label><input type="checkbox" data-id="'+p.id+'"'+(trail.indexOf(p.id)>-1?" checked":"")+'><span>'+esc(nameL(p))+'<small>'+esc(areaL(p))+'</small></span></label>'; }).join("");
    });
    $("msel-list").innerHTML=h||"<p class=\"meta\">—</p>";
  }
  function syncMsel(){ var cs=$("msel-list").querySelectorAll("input[type=checkbox]"); for(var i=0;i<cs.length;i++) cs[i].checked=trail.indexOf(cs[i].getAttribute("data-id"))>-1; }
  function setMsel(open){ $("msel-panel").hidden=!open; $("msel-btn").setAttribute("aria-expanded",String(open)); if(open) setTimeout(function(){ $("msel-q").focus({preventScroll:true}); },30); }
  function planTexts(){
    $("msel-btn").textContent=t("selPh")(trail.length);
    $("pl-dwell").innerHTML=[20,30,45,60,90].map(function(m){ return '<option value="'+m+'"'+(plan.dwell===m?" selected":"")+'>'+esc(t("min")(m))+'</option>'; }).join("");
  }
  function updatePlanner(){
    planTexts();
    $("pl-chips").innerHTML=trail.map(function(id){ var p=byId[id]; return '<span class="pchip">'+esc(nameL(p))+'<button type="button" data-rm="'+id+'" aria-label="'+esc(t("rm")+": "+nameL(p))+'">×</button></span>'; }).join("");
    if(plan.first!=="auto"&&trail.indexOf(plan.first)===-1) plan.first="auto";
    var fs=$("pl-first"); fs.innerHTML='<option value="auto">'+esc(t("auto"))+'</option>'+trail.map(function(id){ return '<option value="'+id+'"'+(plan.first===id?" selected":"")+'>'+esc(nameL(byId[id]))+'</option>'; }).join(""); fs.value=plan.first;
    var out=$("pl-out"), sum=$("pl-sum"), act=$("pl-actions");
    if(trail.length<2){ lastKey=""; out.innerHTML=""; act.innerHTML=""; sum.innerHTML='<div class="pl-empty">'+esc(t(trail.length===1?"one":"empty"))+'</div>'; return; }
    var order=planOrder(trail,plan.first), tp=($("pl-start").value||"19:00").split(":").map(Number), tm=tp[0]*60+tp[1], total=0, rows=[];
    order.forEach(function(p,i){ var leg=null; if(i>0){ var km=dist(order[i-1],p), walk=km<1.2, sp=walk?4.5:(km>12?26:14), mins=Math.max(3,Math.round(km/sp*60)); tm+=mins; total+=km; leg={km:km,mins:mins,walk:walk}; }
      var arr=tm; tm+=plan.dwell; rows.push({p:p,leg:leg,arr:arr,lv:tm}); });
    sum.innerHTML='<div class="pl-sum">'+esc(t("total")(order.length,nb(total.toFixed(1)),fmtTime(tm)))+'</div>';
    var key=order.map(function(p){return p.id;}).join("|"); if(key!==lastKey){ lastKey=key; out.classList.remove("anim"); void out.offsetWidth; out.classList.add("anim"); }
    out.innerHTML=rows.map(function(r,i){ var p=r.p;
      var leg=r.leg?'<div class="leg">'+esc(r.leg.walk?t("walk")(r.leg.mins,r.leg.km.toFixed(1)):t("ride")(r.leg.mins,r.leg.km.toFixed(1)))+'</div>':"";
      var metro=p.l==="N"?esc(t("noMetro")):'<i class="dot '+p.l+'" style="display:inline-block;vertical-align:middle;margin-right:5px"></i>'+esc(metroL(p))+(p.ap?" ~":"");
      return '<li style="--i:'+i+'">'+leg+'<div class="stop"><span class="num">'+nb(i+1)+'</span><div><h3>'+esc(nameL(p))+' <a class="mapbtn" data-map="'+p.id+'" target="_blank" rel="noopener" href="'+mapUrl(p)+'">'+D.pin+bi("Map","ম্যাপ")+'</a></h3><div class="meta">'+esc(areaL(p))+' · '+metro+'</div></div><div class="times">'+esc(fmtTime(r.arr))+'<span>→ '+esc(fmtTime(r.lv))+'</span></div></div></li>'; }).join("");
    var btns=[]; for(var i=0;i<order.length-1;i+=8){ var lg=order.slice(i,i+9); btns.push('<a class="btn map" target="_blank" rel="noopener" href="'+legUrl(lg)+'">'+esc(t("legs")(i+1,i+lg.length))+'</a>'); }
    var lines=rows.map(function(r,i){ return (i+1)+". "+fmtTime(r.arr)+"  "+nameL(r.p)+" ("+areaL(r.p)+")"; });
    var share=t("head")+"\n"+lines.join("\n")+"\n"+(location.href.indexOf("http")===0?location.href:"");
    btns.push('<a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(share)+'">'+esc(t("wa"))+'</a>');
    act.innerHTML=btns.join("");
  }
  $("msel-btn").addEventListener("click",function(){ setMsel($("msel-panel").hidden); });
  $("msel-done").addEventListener("click",function(){ setMsel(false); $("msel-btn").focus(); });
  $("msel-clear").addEventListener("click",function(){ trail=[]; saveTrail(); syncButtons(); renderTrailBar(); updatePlanner(); syncMsel(); });
  $("msel-q").addEventListener("input",buildMsel);
  $("msel-list").addEventListener("change",function(e){ var c=e.target.closest("input[type=checkbox]"); if(c) toggle(c.getAttribute("data-id"),c.checked); });
  $("pl-chips").addEventListener("click",function(e){ var b=e.target.closest("[data-rm]"); if(b) toggle(b.getAttribute("data-rm"),false); });
  $("pl-start").addEventListener("input",updatePlanner);
  $("pl-dwell").addEventListener("change",function(e){ plan.dwell=Number(e.target.value); updatePlanner(); });
  $("pl-first").addEventListener("change",function(e){ plan.first=e.target.value; updatePlanner(); });
  document.addEventListener("click",function(e){ if(!$("msel-panel").hidden&&!e.target.closest("#msel")) setMsel(false); });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&!$("msel-panel").hidden){ setMsel(false); $("msel-btn").focus(); } });
  $("trail-clear").addEventListener("click",function(){ trail=[]; saveTrail(); syncButtons(); renderTrailBar(); updatePlanner(); syncMsel(); });
  $("trail-plan").addEventListener("click",function(e){
    e.preventDefault(); var el=trail.length>=2?$("pl-sum"):$("msel-btn"); el.scrollIntoView({behavior:"smooth",block:"start"});
    var box=trail.length>=2?(el.firstElementChild||el):el; box.classList.remove("flash"); void box.offsetWidth; box.classList.add("flash"); setTimeout(function(){ box.classList.remove("flash"); },1200);
  });

  function trailRoute(){ var o=planOrder(trail,"auto"); var a=$("trail-go"); if(!a) return; if(o.length>1) a.href=legUrl(o.slice(0,9)); else if(o[0]) a.href=mapUrl(o[0]); }
  function renderAll(){ renderChips(); applyFilters(); syncButtons(); renderTrailBar(); trailRoute(); buildMsel(); updatePlanner(); if(mapP&&$("mapview").open) renderMap(); }
  document.addEventListener("langchange",renderAll);
  renderAll(); syncButtons();
})();
