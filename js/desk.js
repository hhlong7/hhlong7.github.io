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

  /* ---------- procedural bits of the scene ---------- */
  var posts=$('#posts');
  [60,180,295,410,515,1160,1270].forEach(function(x){mk('rect',{x:x,y:421,width:9,height:394,'class':'c-rail'},posts)});

  var dock=$('#dockicons');
  for(var i=0;i<12;i++){mk('rect',{x:700+i*19,y:743,width:13,height:13,rx:3,style:'fill:var(--ink)',opacity:.28},dock)}

  var mr=$('#mailrows');
  [[596,86],[604,60]].forEach(function(r,idx){var y=592+idx*38;
    mk('circle',{cx:1022,cy:y+16,r:8,style:'fill:var(--mail-line)'},mr);
    mk('rect',{x:1036,y:y+8,width:r[1]+30,height:4,rx:2,style:'fill:var(--mail-line)'},mr);
    mk('rect',{x:1036,y:y+17,width:r[1],height:4,rx:2,style:'fill:var(--mail-line)'},mr)});

  var st=$('#stickies');
  [['Computer|architecture','--note-1',500,120,-3],['RTL +|verification','--note-2',665,118,2],['GPU|design','--note-3',830,122,-2],
   ['Digital|hardware','--note-4',502,222,2],['Applied|AI','--note-5',668,224,-2],['AI ethics|+ fairness','--note-6',832,220,3]].forEach(function(n){
    var g=mk('g',{transform:'rotate('+n[4]+' '+(n[2]+68)+' '+(n[3]+44)+')'},st);
    mk('rect',{x:n[2]+3,y:n[3]+4,width:136,height:92,style:'fill:rgba(0,0,0,.28)'},g);
    mk('rect',{x:n[2],y:n[3],width:136,height:92,style:'fill:var('+n[1]+')'},g);
    mk('circle',{cx:n[2]+68,cy:n[3]+8,r:4.5,style:'fill:var(--seal)'},g);
    var t=mk('text',{x:n[2]+14,y:n[3]+44,'class':'t-hand','font-size':26,style:'fill:var(--note-ink)'},g);
    n[0].split('|').forEach(function(line,li){var ts=mk('tspan',{x:n[2]+14,dy:li?26:0},t);ts.textContent=line})});

  var bk=$('#books');
  /* one spine per Past projects card; data-card is the card id it jumps to */
  [[1350,'RISC-V MCPU','--note-4',34,104,'bk-mcpu'],[1386,'Memory Agent','--note-3',34,96,'bk-agent'],[1422,'Seq. FPGA','--note-2',30,100,'bk-seq'],[1454,'PCBA','--note-5',28,92,'bk-pcba'],[1484,'Audio DAC','--note-6',32,98,'bk-dac'],[1518,'FPT C++','--leaf-2',30,94,'bk-fpt']].forEach(function(b){
    var y=690-b[4], g=mk('g',{'class':'book','data-card':b[5]},bk);
    mk('rect',{x:b[0],y:y,width:b[3],height:b[4],rx:2,style:'fill:var('+b[2]+')'},g);
    mk('rect',{x:b[0],y:y+10,width:b[3],height:3,style:'fill:var(--note-ink)',opacity:.35},g);
    var t=mk('text',{transform:'translate('+(b[0]+b[3]/2+4)+' '+(y+b[4]-8)+') rotate(-90)','class':'t-disp','font-size':12,'font-weight':700,style:'fill:var(--note-ink)'},g);t.textContent=b[1]});
  [[1552,'--screen-2',20,94]].forEach(function(b){mk('rect',{x:b[0],y:690-b[3],width:b[2],height:b[3],rx:2,style:'fill:var('+b[1]+')',opacity:.8},bk)});
  [[1350,'--wood-hi',44,90],[1396,'--screen-2',36,96],[1436,'--seal',30,84]].forEach(function(b){mk('rect',{x:b[0],y:818-b[3],width:b[2],height:b[3],rx:2,style:'fill:var('+b[1]+')',opacity:.75},bk)});

  function bez(p0,p1,p2,t){var u=1-t;return[u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0],u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1]]}
  function stem(g,p0,p1,p2,n,rx,ry){
    mk('path',{d:'M'+p0+' Q'+p1+' '+p2,'class':'stem',fill:'none'},g);
    for(var i=0;i<n;i++){
      var t=.28+i*(.72/(n-1)), a=bez(p0,p1,p2,t), b=bez(p0,p1,p2,Math.min(1,t+.02));
      var ang=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI, side=i%2?1:-1;
      mk('ellipse',{cx:rx*.9,cy:0,rx:rx,ry:ry,'class':'l'+(1+i%3),transform:'translate('+a[0]+' '+a[1]+') rotate('+(ang+side*52)+')'},g)}
    var e=bez(p0,p1,p2,1);
    mk('ellipse',{cx:rx*.9,cy:0,rx:rx,ry:ry,'class':'l2',transform:'translate('+e[0]+' '+e[1]+') rotate('+(Math.atan2(e[1]-bez(p0,p1,p2,.96)[1],e[0]-bez(p0,p1,p2,.96)[0])*180/Math.PI)+')'},g)}
  var euc=$('#euc'), base=[232,658];
  [[[150,560],[105,470]],[[185,540],[170,440]],[[240,520],[235,425]],[[290,540],[300,450]],[[312,600],[338,545]],[[160,642],[92,602]]].forEach(function(s){stem(euc,base,s[0],s[1],6,20,13)});
  var succ=$('#succ');
  function rosette(cx,cy,n,len,wid){for(var k=0;k<n;k++){var a=-70+k*(140/(n-1));mk('ellipse',{cx:0,cy:-len*.55,rx:wid,ry:len*.55,'class':'l'+(1+k%3),transform:'translate('+cx+' '+cy+') rotate('+a+')'},succ)}}
  rosette(228,766,7,30,8); rosette(300,774,9,40,10);

  /* ---------- live LED clock ---------- */
  function tick(){var d=new Date(),h=('0'+d.getHours()).slice(-2),m=('0'+d.getMinutes()).slice(-2);
    $('#clk').textContent=h+':'+m;$('#clkGlow').textContent=h+':'+m}
  tick();setInterval(tick,5000);

  /* ---------- hotspots: ring, pulse hint, tooltip, keyboard ---------- */
  var hots=$$('.hot');
  hots.forEach(function(g){
    var b=g.getBBox();
    var ring=mk('rect',{x:b.x-8,y:b.y-8,width:b.width+16,height:b.height+16,rx:12,'class':'ring'},g);
    mk('circle',{cx:b.x+b.width-4,cy:b.y+6,r:6,'class':'pulse-dot'},g);
    mk('circle',{cx:b.x+b.width-4,cy:b.y+6,r:6,'class':'pulse-halo'},g);
    g.addEventListener('pointerenter',function(){showTip(g)});
    g.addEventListener('pointerleave',hideTip);
    g.addEventListener('focus',function(){showTip(g)});
    g.addEventListener('blur',hideTip);
    if(g.dataset.view){
      g.addEventListener('click',function(){open(g.dataset.view)});
      g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(g.dataset.view)}});
    }
  });
  function showTip(g){
    if(current)return;
    var r=g.getBoundingClientRect(),s=stage.getBoundingClientRect();
    tip.textContent=g.dataset.label||'';
    tip.style.left=clamp(r.left+r.width/2-s.left,70,s.width-70)+'px';
    tip.style.top=Math.max(34,r.top-s.top-8)+'px';
    tip.classList.add('on');
  }
  function hideTip(){tip.classList.remove('on')}

  /* ---------- camera (animated viewBox) ---------- */
  var vb={x:0,y:0,w:1600,h:1200}, raf=0;
  function aspect(){return stage.clientWidth/Math.max(1,stage.clientHeight)}
  function sheet(){return window.matchMedia('(max-width:820px),(max-aspect-ratio:1/1)').matches}
  function home(){var a=aspect(),h=1200,w=h*a;if(w<1600){w=1600;h=w/a}return{x:800-w/2,y:600-h/2,w:w,h:h}}
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
    var v=VIEWS[id], b=document.getElementById(v.obj).getBBox(), a=aspect(), W, fx, fy;
    if(v.pop){W=clamp(Math.max(b.width/.3,b.height*a/.24),900,1700);fx=.5;fy=.84}
    else if(sheet()){W=clamp(Math.max(b.width/.8,b.height*a/.3),380,1700);fx=.5;fy=.21}
    else{W=clamp(Math.max(b.width/.44,b.height*a/.6),380,1700);fx=.27;fy=.5}
    var H=W/a;
    return{x:b.x+b.width/2-fx*W,y:b.y+b.height/2-fy*H,w:W,h:H};
  }

  /* ---------- open / close ---------- */
  var current=null, lastFocus=null, showTimer=0;
  function setHash(v){try{if(location.hash.slice(1)!==v)location.hash=v}catch(e){}}
  function open(id,opts){
    if(!VIEWS[id])return;
    opts=opts||{};
    if(current===id)return;
    var v=VIEWS[id], panel=document.getElementById('view-'+id), obj=document.getElementById(v.obj);
    if(!current)lastFocus=document.activeElement;
    document.body.classList.add('touched');
    hideTip();
    if(current){document.getElementById('view-'+current).classList.remove('on')}
    clearTimeout(showTimer);
    hots.forEach(function(h){h.classList.toggle('active',h===obj)});
    svg.classList.add('zoomed');
    veil.classList.add('on');
    current=id;
    $$('.dock button').forEach(function(b){b.setAttribute('aria-current',b.dataset.open===id?'true':'false')});
    var dur=opts.instant?0:950;
    go(target(id),dur);
    showTimer=setTimeout(function(){
      panel.classList.add('on');
      var back=$('.back',panel);if(back)back.focus({preventScroll:true});
      panel.scrollTop=0;
    },(opts.instant||reduce.matches)?0:560);
    setHash(id);
  }
  function close(){
    if(!current)return;
    var panel=document.getElementById('view-'+current);
    clearTimeout(showTimer);
    panel.classList.remove('on');
    veil.classList.remove('on');
    $$('.dock button').forEach(function(b){b.removeAttribute('aria-current')});
    var was=current;current=null;
    setTimeout(function(){svg.classList.remove('zoomed');hots.forEach(function(h){h.classList.remove('active')})},reduce.matches?0:220);
    go(home(),850);
    try{if(location.hash)location.hash=''}catch(e){}
    var back=document.getElementById(VIEWS[was].obj);
    if(lastFocus&&lastFocus.focus){lastFocus.focus({preventScroll:true})}else if(back&&back.focus){back.focus({preventScroll:true})}
  }

  $$('[data-close]').forEach(function(b){b.addEventListener('click',close)});
  veil.addEventListener('click',close);
  $$('.dock [data-open]').forEach(function(b){b.addEventListener('click',function(){open(b.dataset.open)})});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape')close();
    else if((e.key==='h'||e.key==='H')&&!current&&!/input|textarea/i.test((e.target||{}).tagName||''))svg.classList.toggle('debug');
  });
  window.addEventListener('hashchange',function(){
    var h=location.hash.slice(1);
    if(VIEWS[h]&&h!==current)open(h);else if(!h&&current)close();
  });
  window.addEventListener('resize',function(){apply(current?target(current):home())});

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
  $$('#books .book').forEach(function(b){b.addEventListener('click',function(e){
    e.stopPropagation();
    var already=current==='done';
    open('done');
    setTimeout(function(){showCard(b.dataset.card)},(already||reduce.matches)?0:620);
  })});

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
  if(rl&&window.fetch){
    fetch(rl.getAttribute('href'),{method:'HEAD'}).then(function(r){if(!r.ok)throw 0}).catch(function(){
      var v=rl.parentNode;v.textContent='';var s=document.createElement('span');s.textContent='Resume coming soon. Email me and I\'ll send it over.';v.appendChild(s);
    });
  }

  /* ---------- copy email ---------- */
  var cb=$('#copy-mail');
  cb.addEventListener('click',function(){
    var addr=$('#mail-addr').textContent;
    function fallback(){var r=document.createRange();r.selectNodeContents($('#mail-addr'));var s=window.getSelection();s.removeAllRanges();s.addRange(r);cb.textContent='Press Ctrl or Cmd + C';setTimeout(function(){cb.textContent='Copy email'},2200)}
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(addr).then(function(){cb.textContent='Copied';setTimeout(function(){cb.textContent='Copy email'},1600)},fallback);
    }else fallback();
  });

  /* ---------- start ---------- */
  var h0=home();
  var hash0=location.hash.slice(1);
  if(VIEWS[hash0]){apply(h0);open(hash0,{instant:true})}
  else if(reduce.matches){apply(h0)}
  else{ // gentle push-in on load
    var cx=h0.x+h0.w/2,cy=h0.y+h0.h/2,w=h0.w*1.18,h=h0.h*1.18;
    apply({x:cx-w/2,y:cy-h/2,w:w,h:h});go(h0,1600);
  }
})();
