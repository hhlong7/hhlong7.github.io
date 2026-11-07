(function(){
  var NS='http://www.w3.org/2000/svg';
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function mk(tag,attrs,parent){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

  var stage=$('#stage'), svg=$('#scene'), veil=$('#veil'), tip=$('#tip');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  var VIEWS={
    about:{obj:'obj-about'}, experience:{obj:'obj-experience'}, now:{obj:'obj-code'}, done:{obj:'obj-done'},
    volunteer:{obj:'obj-volunteer'}, interests:{obj:'obj-interests'}, contact:{obj:'obj-mail'}, courses:{obj:'obj-courses',pop:true}
  };
  document.documentElement.classList.add('js');

  /* ---------- the photo: blurred preview, then a size that fits the screen, then full res after the first zoom ---------- */
  var photo=$('#photo'), loadedFull=false;
  function loadPhoto(src){
    var img=new Image();
    img.onload=function(){photo.setAttribute('href',src);stage.classList.add('photo-ready')};
    img.onerror=function(){if(!stage.classList.contains('photo-ready'))stage.classList.add('photo-failed')};
    img.src=src;
  }
  var px=Math.max(screen.width,screen.height)*(window.devicePixelRatio||1);
  loadPhoto(px<=1400?'assets/art/desk-1200.webp':'assets/art/desk-2400.webp');
  function upgradePhoto(){if(loadedFull)return;loadedFull=true;loadPhoto('assets/art/desk-4032.webp')}

  /* ---------- monitor details ---------- */
  var mr=$('#mailrows');
  if(mr)[[596,86],[604,60]].forEach(function(r,idx){var y=592+idx*38;
    mk('circle',{cx:1022,cy:y+16,r:8,style:'fill:var(--mail-line)'},mr);
    mk('rect',{x:1036,y:y+8,width:r[1]+30,height:4,rx:2,style:'fill:var(--mail-line)'},mr);
    mk('rect',{x:1036,y:y+17,width:r[1],height:4,rx:2,style:'fill:var(--mail-line)'},mr)});

  /* ---------- book spines on the shelf: one per Past projects card ---------- */
  var bk=$('#books');
  [[1331,1369,'RISC-V CPU','bk-mcpu'],[1374,1406,'Memory agent','bk-agent'],[1409,1444,'Sequence FPGA','bk-seq'],
   [1451,1489,'PCBA','bk-pcba'],[1492,1527,'Audio DAC','bk-dac'],[1531,1561,'FPT C++','bk-fpt']].forEach(function(b){
    var g=mk('g',{'class':'book','data-card':b[3],'data-label':b[2]},bk);
    mk('rect',{x:b[0],y:612,width:b[1]-b[0],height:178,rx:2,'class':'spine'},g);
  });

  /* ---------- live LED clock: seven-segment digits over the photo's switched-off ones ---------- */
  var clock=$('#clock');
  var SEG={0:'abcdef',1:'bc',2:'abged',3:'abgcd',4:'fgbc',5:'afgcd',6:'afgedc',7:'abc',8:'abcdefg',9:'abcfgd'};
  var DIG=[[697,791],[733.5,791],[796,791],[833,791]], W=30, H=62, T=5.6, SK=5;
  function pt(x0,y0,u,v){return (x0+u+(1-v/H)*SK).toFixed(1)+','+(y0+v).toFixed(1)}
  function segPoly(x0,y0,s){
    var t=T, h2=H/2, m=1.2;
    var q={
      a:[[t*.6+m,0],[W-t*.6-m,0],[W-t-m,t],[t+m,t]],
      d:[[t+m,H-t],[W-t-m,H-t],[W-t*.6-m,H],[t*.6+m,H]],
      g:[[t+m,h2-t/2],[W-t-m,h2-t/2],[W-t*.6-m,h2],[W-t-m,h2+t/2],[t+m,h2+t/2],[t*.6+m,h2]],
      f:[[0,t*.6+m],[t,t+m],[t,h2-t/2-m],[0,h2-m]],
      e:[[0,h2+m],[t,h2+t/2+m],[t,H-t-m],[0,H-t*.6-m]],
      b:[[W-t,t+m],[W,t*.6+m],[W,h2-m],[W-t,h2-t/2-m]],
      c:[[W-t,h2+t/2+m],[W,h2+m],[W,H-t*.6-m],[W-t,H-t-m]]
    }[s];
    return q.map(function(p){return pt(x0,y0,p[0],p[1])}).join(' ');
  }
  var segEls=DIG.map(function(d){var o={};'abcdefg'.split('').forEach(function(s){o[s]=mk('polygon',{points:segPoly(d[0],d[1],s),'class':'seg'},clock)});return o});
  var colon=mk('g',{'class':'colon'},clock);
  mk('circle',{cx:782.5,cy:809.5,r:2.6,'class':'seg on'},colon);mk('circle',{cx:779.5,cy:832,r:2.6,'class':'seg on'},colon);
  var menuClock=$('#menuClock');
  function tick(){
    var d=new Date(), hh=('0'+d.getHours()).slice(-2), mm=('0'+d.getMinutes()).slice(-2), s=hh+mm;
    for(var k=0;k<4;k++){var on=SEG[s[k]];for(var sg in segEls[k])segEls[k][sg].classList.toggle('on',on.indexOf(sg)>=0)}
    if(menuClock)menuClock.textContent=d.toLocaleDateString(undefined,{weekday:'short'})+' '+hh+':'+mm;
  }
  tick();setInterval(tick,5000);

  /* ---------- idle life: rare, faint monitor flicker ---------- */
  var flick=$('#flicker');
  (function flickLoop(){
    setTimeout(function(){
      if(!reduce.matches&&!document.hidden&&flick){flick.style.opacity='.025';setTimeout(function(){flick.style.opacity='0'},90)}
      flickLoop();
    },7000+Math.random()*6000);
  })();

  /* ---------- hotspots: spotlight hover, pulse hint, tooltip, keyboard ---------- */
  var hots=$$('.hot'), hole=$('#dimHole');
  hots.forEach(function(g){
    var sh=$('.shape',g), b=(sh||g).getBBox();
    mk('circle',{cx:b.x+b.width-6,cy:b.y+8,r:6,'class':'pulse-dot'},g);
    mk('circle',{cx:b.x+b.width-6,cy:b.y+8,r:6,'class':'pulse-halo'},g);
    g.addEventListener('pointerenter',function(){spot(g)});
    g.addEventListener('pointerleave',unspot);
    g.addEventListener('focus',function(){panTo(g);spot(g)});
    g.addEventListener('blur',unspot);
    if(g.dataset.view){
      g.addEventListener('click',function(){open(g.dataset.view)});
      g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(g.dataset.view)}});
    }
  });
  function spot(g){
    if(current)return;
    var sh=$('.shape',g);
    if(sh&&hole){hole.setAttribute('href','#'+sh.id);svg.classList.add('spot')}
    showTip(g);
  }
  function unspot(){svg.classList.remove('spot');hideTip()}
  function showTip(el,label){
    if(current)return;
    var r=el.getBoundingClientRect(),s=stage.getBoundingClientRect();
    tip.textContent=label||el.dataset.label||'';
    tip.style.left=clamp(r.left+r.width/2-s.left,70,s.width-70)+'px';
    tip.style.top=Math.max(34,r.top-s.top-8)+'px';
    tip.classList.add('on');
  }
  function hideTip(){tip.classList.remove('on')}

  /* ---------- camera (animated viewBox) ---------- */
  var vb={x:0,y:0,w:1600,h:1200}, raf=0;
  function aspect(){return stage.clientWidth/Math.max(1,stage.clientHeight)}
  function sheet(){return window.matchMedia('(max-width:820px),(max-aspect-ratio:1/1)').matches}
  /* home framing: fit the band of the photo that holds every object; spare room shows the blurred backdrop */
  var panX=null;
  function home(){
    var a=aspect(), bw=1600, bh=1130, w, h, cx=800, cy=50+bh/2;
    if(bw/bh>a){w=bw;h=w/a}else{h=bh;w=h*a}
    if(a<1){ /* tall phone screens: frame the middle of the desk and let people drag sideways */
      w=Math.max(1000,Math.min(1600,1130*a*1.9));h=w/a;
      if(panX===null)panX=800;
      panX=clamp(panX,w/2,1600-w/2);cx=panX;
    }
    if(h<=1200)cy=clamp(cy,h/2,1200-h/2);
    return{x:cx-w/2,y:cy-h/2,w:w,h:h};
  }
  function canPan(){return !current&&home().w<1600}
  /* bring an object into view on narrow screens (keyboard focus, or before a tap lands) */
  function panTo(g){
    if(!canPan())return;
    var b=($('.shape',g)||g).getBBox(), h=home(), cx=b.x+b.width/2;
    if(b.x>=h.x+20&&b.x+b.width<=h.x+h.w-20)return;
    panX=cx;var to=home();go(to,reduce.matches?0:420);
  }
  function apply(b){vb=b;svg.setAttribute('viewBox',b.x+' '+b.y+' '+b.w+' '+b.h)}
  function go(to,dur){
    cancelAnimationFrame(raf);
    if(!dur||reduce.matches){apply(to);return}
    var from={x:vb.x,y:vb.y,w:vb.w,h:vb.h}, t0=performance.now();
    var fcx=from.x+from.w/2,fcy=from.y+from.h/2,tcx=to.x+to.w/2,tcy=to.y+to.h/2,ar=to.w/to.h;
    (function step(now){
      var t=Math.min(1,(now-t0)/dur), e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
      var w=from.w*Math.pow(to.w/from.w,e), cx=fcx+(tcx-fcx)*e, cy=fcy+(tcy-fcy)*e, h=w/ar;
      apply({x:cx-w/2,y:cy-h/2,w:w,h:h});
      if(t<1)raf=requestAnimationFrame(step);
    })(t0);
  }
  function target(id){
    var v=VIEWS[id], o=document.getElementById(v.obj), b=($('.shape',o)||o).getBBox(), a=aspect(), W, fx, fy;
    if(v.pop){W=clamp(Math.max(b.width/.3,b.height*a/.24),900,1700);fx=.5;fy=.84}
    else if(sheet()){W=clamp(Math.max(b.width/.8,b.height*a/.3),380,1700);fx=.5;fy=.2}
    else{W=clamp(Math.max(b.width/.44,b.height*a/.6),380,1700);fx=.27;fy=.5}
    var H=W/a;
    return{x:b.x+b.width/2-fx*W,y:b.y+b.height/2-fy*H,w:W,h:H};
  }

  /* ---------- open / close ---------- */
  var current=null, lastFocus=null, showTimer=0;
  function setHash(v){try{if(location.hash.slice(1)!==v)history.pushState(null,'','#'+v)}catch(e){}}
  function open(id,opts){
    if(!VIEWS[id])return;
    opts=opts||{};
    if(current===id)return;
    var v=VIEWS[id], panel=document.getElementById('view-'+id), obj=document.getElementById(v.obj);
    if(!current)lastFocus=document.activeElement;
    document.body.classList.add('touched');
    unspot();
    if(current){document.getElementById('view-'+current).classList.remove('on')}
    clearTimeout(showTimer);
    hots.forEach(function(h){h.classList.toggle('active',h===obj)});
    svg.classList.add('zoomed');
    veil.classList.add('on');
    current=id;
    $$('.dock button').forEach(function(b){b.setAttribute('aria-current',b.dataset.open===id?'true':'false')});
    go(target(id),opts.instant?0:950);
    upgradePhoto();
    showTimer=setTimeout(function(){
      panel.classList.add('on');
      panel.scrollTop=0;
      var back=$('.back',panel);if(back)back.focus({preventScroll:true});
    },(opts.instant||reduce.matches)?0:560);
    if(!opts.fromHash)setHash(id);
  }
  function close(opts){
    if(!current)return;
    opts=opts||{};
    var panel=document.getElementById('view-'+current);
    clearTimeout(showTimer);
    panel.classList.remove('on');
    panel.style.transform='';
    veil.classList.remove('on');
    $$('.dock button').forEach(function(b){b.removeAttribute('aria-current')});
    var was=current;current=null;
    setTimeout(function(){svg.classList.remove('zoomed');hots.forEach(function(h){h.classList.remove('active')})},reduce.matches?0:220);
    go(home(),850);
    if(!opts.fromHash){try{if(location.hash)history.pushState(null,'',location.pathname+location.search)}catch(e){}}
    var back=document.getElementById(VIEWS[was].obj);
    if(lastFocus&&lastFocus.focus&&lastFocus!==document.body&&document.contains(lastFocus)){lastFocus.focus({preventScroll:true})}else if(back&&back.focus){back.focus({preventScroll:true})}
  }

  $$('[data-close]').forEach(function(b){b.addEventListener('click',function(){close()})});
  veil.addEventListener('click',function(){close()});
  $$('.dock [data-open]').forEach(function(b){b.addEventListener('click',function(){open(b.dataset.open)})});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape')close();
    else if(e.key==='Tab'&&current)trap(e);
    else if((e.key==='h'||e.key==='H')&&!current&&!/input|textarea/i.test((e.target||{}).tagName||''))svg.classList.toggle('debug');
  });
  /* keep Tab inside the open panel */
  function trap(e){
    var panel=document.getElementById('view-'+current);if(!panel.classList.contains('on'))return;
    var f=$$('a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])',panel).filter(function(el){return el.getClientRects().length&&!el.closest('[hidden]')});
    if(!f.length)return;
    var first=f[0], last=f[f.length-1];
    if(!panel.contains(document.activeElement)){e.preventDefault();first.focus();return}
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
  function fromHash(){
    var h=location.hash.slice(1);
    if(VIEWS[h]&&h!==current)open(h,{fromHash:true});else if(!VIEWS[h]&&current)close({fromHash:true});
  }
  window.addEventListener('popstate',fromHash);
  window.addEventListener('hashchange',fromHash);
  function panFlag(){document.body.classList.toggle('can-pan',home().w<1600)}
  window.addEventListener('resize',function(){apply(current?target(current):home());panFlag()});
  panFlag();

  /* ---------- drag to look around (phones, when the desk is wider than the screen) ---------- */
  var drag=null, dragged=false;
  svg.addEventListener('pointerdown',function(e){if(!canPan())return;drag={x:e.clientX,p:panX,w:vb.w};dragged=false});
  window.addEventListener('pointermove',function(e){
    if(!drag)return;
    var dx=e.clientX-drag.x;
    if(!dragged&&Math.abs(dx)<8)return;
    if(!dragged){dragged=true;unspot();document.body.classList.add('panned')}
    panX=drag.p-dx*drag.w/stage.clientWidth;cancelAnimationFrame(raf);apply(home());
  });
  window.addEventListener('pointerup',function(){drag=null});
  window.addEventListener('pointercancel',function(){drag=null});
  svg.addEventListener('click',function(e){if(dragged){e.stopPropagation();e.preventDefault();dragged=false}},true);

  /* ---------- phone bottom sheet: drag the bar down to close ---------- */
  $$('.view:not(.pop) .bar').forEach(function(bar){
    var panel=bar.parentNode, y0=null, dy=0;
    bar.addEventListener('touchstart',function(e){if(!sheet())return;y0=e.touches[0].clientY;dy=0;panel.style.transition='none'},{passive:true});
    bar.addEventListener('touchmove',function(e){if(y0===null)return;dy=Math.max(0,e.touches[0].clientY-y0);panel.style.transform='translateY('+dy+'px)'},{passive:true});
    bar.addEventListener('touchend',function(){if(y0===null)return;panel.style.transition='';y0=null;if(dy>90){close()}else{panel.style.transform=''}});
  });

  /* ---------- VS Code tabs ---------- */
  var tabs=$$('.vsc-tab');
  tabs.forEach(function(t){t.addEventListener('click',function(){
    tabs.forEach(function(o){o.setAttribute('aria-selected',o===t?'true':'false');document.getElementById(o.dataset.pane).hidden=(o!==t)});
  })});

  /* ---------- shelf books jump to their Past projects card ---------- */
  function showCard(id){
    var card=document.getElementById(id);if(!card)return;
    card.scrollIntoView({block:'center',behavior:reduce.matches?'auto':'smooth'});
    card.focus({preventScroll:true});
    card.classList.remove('flash');void card.offsetWidth;card.classList.add('flash');
  }
  $$('#books .book').forEach(function(b){
    b.addEventListener('pointerenter',function(){showTip(b,b.dataset.label+' · Past projects')});
    b.addEventListener('pointerleave',function(){showTip($('#sh-done'),'Past projects')});
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var already=current==='done';
      open('done');
      setTimeout(function(){showCard(b.dataset.card)},(already||reduce.matches)?0:620);
    });
  });

  /* ---------- sticky notes expand ---------- */
  $$('.note').forEach(function(n){n.addEventListener('click',function(){
    n.setAttribute('aria-expanded',n.getAttribute('aria-expanded')==='true'?'false':'true');
  })});

  /* ---------- optional files: photo and resume degrade if missing ---------- */
  var me=$('#me-photo img');
  if(me){
    me.addEventListener('load',function(){$('#me-photo').hidden=false});
    if(me.complete&&me.naturalWidth)$('#me-photo').hidden=false;
  }
  var rl=$('#resume-link');
  function noResume(){var v=rl.parentNode;v.textContent='';var s=document.createElement('span');s.textContent='Resume coming soon. Email me and I\'ll send it over.';v.appendChild(s)}
  if(rl){
    if(location.protocol==='file:'||!window.fetch)noResume();
    else fetch(rl.getAttribute('href'),{method:'HEAD'}).then(function(r){if(!r.ok)throw 0}).catch(noResume);
  }

  /* ---------- copy email ---------- */
  var cb=$('#copy-mail');
  if(cb)cb.addEventListener('click',function(){
    var addr=$('#mail-addr').textContent;
    function fallback(){var r=document.createRange();r.selectNodeContents($('#mail-addr'));var s=window.getSelection();s.removeAllRanges();s.addRange(r);cb.textContent='Press Ctrl or Cmd + C';setTimeout(function(){cb.textContent='Copy email'},2200)}
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(addr).then(function(){cb.textContent='Copied';setTimeout(function(){cb.textContent='Copy email'},1600)},fallback);
    }else fallback();
  });

  /* ---------- start ---------- */
  var h0=home();
  var hash0=location.hash.slice(1);
  if(VIEWS[hash0]){apply(h0);open(hash0,{instant:true,fromHash:true})}
  else if(reduce.matches){apply(h0)}
  else{ // gentle push-in on load
    var cx=h0.x+h0.w/2,cy=h0.y+h0.h/2,w=h0.w*.9,h=h0.h*.9;
    apply({x:cx-w/2,y:cy-h/2,w:w,h:h});go(h0,1600);
  }
})();
