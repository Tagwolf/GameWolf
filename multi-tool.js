// Multi-Tool Brawl Stars Style Game: Shop & Pass erweitert
(function() {
  function create(tag, props = {}, parent) {
    const el = document.createElement(tag);
    Object.assign(el, props);
    if (parent) parent.appendChild(el);
    return el;
  }
  function saveProfile(profile) {
    localStorage.setItem('mtg_profile_' + profile.name, JSON.stringify(profile));
  }
  function loadProfile(name) {
    try { return JSON.parse(localStorage.getItem('mtg_profile_' + name)); } catch { return null; }
  }
  function deleteProfile(name) {
    localStorage.removeItem('mtg_profile_' + name);
  }
  function getAllProfiles() {
    let arr = [];
    for (let key in localStorage) {
      if (key.startsWith('mtg_profile_')) {
        try { arr.push(JSON.parse(localStorage.getItem(key))); } catch {}
      }
    }
    return arr;
  }
  const skins = [
    { name: "Blauer Held", primary: "#2196f3", accent: "#fff", face: "#fbc02d", price: 0 },
    { name: "Roter Held", primary: "#e53935", accent: "#fff", face: "#ffecb3", price: 10 },
    { name: "Grüner Held", primary: "#43a047", accent: "#fff", face: "#ffe082", price: 15 },
    { name: "Lila Held", primary: "#8e24aa", accent: "#fff", face: "#ffecb3", price: 18 }
  ];
  // Pass-Stufen (Belohnungen)
  const passTiers = [
    { lvl: 1, pts: 20, reward: {coins: 5} },
    { lvl: 2, pts: 60, reward: {coins: 10, skin: 1} },
    { lvl: 3, pts: 120, reward: {coins: 15, skin: 2} },
    { lvl: 4, pts: 200, reward: {coins: 25, skin: 3} }
  ];

  const app = document.getElementById("app");
  let state = { page: "menu", profile: null, game: null };

  function render() {
    app.innerHTML = "";
    if (state.page === "menu") renderMenu();
    if (state.page === "login") renderLogin();
    if (state.page === "profile") renderProfile();
    if (state.page === "shop") renderShop();
    if (state.page === "pass") renderPass();
    if (state.page === "news") renderNews();
    if (state.page === "play") renderGame();
  }

  function ensureProfileDefaults(p) {
    if(p.coins === undefined) p.coins = 0;
    if(!p.ownedSkins) p.ownedSkins = [0];
    if(p.passPoints === undefined) p.passPoints = 0;
    if(!p.passRewards) p.passRewards = {};
    return p;
  }

  function renderMenu() {
    create('h1', { textContent: 'Multi-Tool Game', style:"margin-top:36px;" }, app);
    const profs = getAllProfiles();
    let curProf = state.profile;
    let selProf = create('select', { style: "margin:0 12px 0 0;" }, app);
    create('option', { value: '', textContent: '-- Profil wählen --' }, selProf);
    profs.forEach(p => create('option', {
      value: p.name,
      textContent: `${p.name} (Best: ${p.highscore||0})`,
      selected: curProf && curProf.name===p.name
    }, selProf));
    let loadBtn = create('button', {textContent:"Profil laden"}, app);
    let newBtn = create('button', {textContent:"Neues Profil", style:"margin-left:14px;"}, app);
    loadBtn.onclick = ()=>{
      const p = ensureProfileDefaults(loadProfile(selProf.value));
      if (p) { state.profile=p; render(); }
    };
    newBtn.onclick = ()=>{ state.page="login"; render(); };
    selProf.onchange = ()=>{ loadBtn.disabled = !selProf.value; };
    loadBtn.disabled = !selProf.value;
    const hsDiv = create('div', { style: "margin:30px 0 18px 0;" }, app);
    create('h2', { textContent: '🏆 Highscores' }, hsDiv);
    const hsList = create('ol', { style: "font-size:18px;padding-left:24px;" }, hsDiv);
    profs.sort((a,b)=>(b.highscore||0)-(a.highscore||0)).slice(0,8).forEach(p=>{
      create('li',{textContent:`${p.name}: ${p.highscore||0}`},hsList);
    });
    if(profs.length===0) create('li',{textContent:"Noch keine Scores!"},hsList);

    const bar = create('div', { className: "menu-bar" }, app);
    const btns = [
      { name: "Shop", icon: "🛒", accent: "#fbc531", page:"shop" },
      { name: "Pass", icon: "🎫", accent: "#00b894", page:"pass" },
      { name: "News", icon: "📰", accent: "#00a8ff", page:"news" },
      { name: "Spielen", icon: "🎮", accent: "#e17055", page:"play" },
      { name: "Profil", icon: "👤", accent: "#a29bfe", page:"profile" }
    ];
    btns.forEach(btn=>{
      let b = create('button', {
        className: "menu-btn" + (state.page===btn.page?" selected":""),
        innerHTML: `<span class="icon">${btn.icon}</span>${btn.name}`,
        style: `background:linear-gradient(180deg,${btn.accent},#243b55 80%);`,
        disabled: (btn.page!=="profile"&&btn.page!=="login"&&!state.profile)
      }, bar);
      b.onclick = ()=>{
        if(btn.page==="profile" && !state.profile) return;
        if(btn.page==="play" && !state.profile) return;
        state.page=btn.page; render();
      };
    });
    const cont = create('div', { className: "menu-content" }, app);
    cont.innerHTML = `
      <div class="headline" style="text-align:center;">Willkommen${state.profile?`, ${state.profile.name}!`: "!"}</div>
      <div class="desc" style="text-align:center;">
        Wähle oben ein Menü. Zum Spielen bitte erst ein Profil wählen oder anlegen.<br>
        <span style="color:#ffe49c;font-size:15px;">Tipp: Klicke auf <b>Profil</b> um Skin und Daten zu sehen!</span>
      </div>
    `;
    // Coins anzeigen wenn eingeloggt
    if(state.profile) {
      let coins = create('div', { style:"text-align:center;font-size:18px;color:#fbc531;font-weight:bold;" }, cont);
      coins.innerHTML = `💰 Münzen: <span id="coinVal">${state.profile.coins}</span>`;
    }
  }

  function renderProfile() {
    if(!state.profile) { state.page="menu"; render(); return; }
    ensureProfileDefaults(state.profile);
    create('h2', { textContent: "Profil" }, app);
    let summ = create('div', { className:"profile-summary" }, app);
    let skinOptions = skins.map((skin,i)=>`<option value="${i}" ${state.profile.skin==i?'selected':''}>${skin.name}${state.profile.ownedSkins.includes(i)?'':' (gesperrt)'}</option>`).join('');
    summ.innerHTML = `
      <b>Name:</b> ${state.profile.name}<br>
      <b>Skin:</b>
      <select id="skinSel">${skinOptions}</select><br>
      <b>Highscore:</b> ${state.profile.highscore||0}<br>
      <b>Letzte Runde:</b> ${state.profile.lastscore||0}<br>
      <b>Münzen:</b> <span id="coinVal">${state.profile.coins}</span><br>
      <b>Pass-Punkte:</b> ${state.profile.passPoints||0}
    `;
    // Skinwechsel
    summ.querySelector("#skinSel").onchange = function() {
      let val = parseInt(this.value);
      if (!state.profile.ownedSkins.includes(val)) {
        alert("Skin gesperrt! Im Shop oder Pass freischalten.");
        this.value = state.profile.skin;
        return;
      }
      state.profile.skin = val; saveProfile(state.profile); render();
    };
    let pwBtn = create('button', {textContent:"Passwort ändern"}, app);
    let logoutBtn = create('button', {textContent:"Abmelden", style:"margin-left:12px;"}, app);
    let deleteBtn = create('button', {textContent:"Profil löschen", className:"delete-btn"}, app);
    let toMenuBtn = create('button', {textContent:"Zurück zum Menü", style:"margin-left:12px;"}, app);
    pwBtn.onclick = ()=>{
      let n = prompt("Neues Passwort:");
      if(n&&n.length>0) { state.profile.password=n; saveProfile(state.profile); alert("Geändert!"); }
    };
    logoutBtn.onclick = ()=>{ state.profile=null; state.page="menu"; render(); };
    toMenuBtn.onclick = ()=>{ state.page="menu"; render(); };
    deleteBtn.onclick = ()=>{
      if(confirm("Profil wirklich löschen? Dies kann NICHT rückgängig gemacht werden!")) {
        deleteProfile(state.profile.name);
        state.profile=null; state.page="menu"; render();
      }
    };
  }

  // SHOP: Kaufe Skins, Punkte, Powerup (Effekt: Skin freischalten, Punkte gutschreiben, Powerup im nächsten Game)
  function renderShop() {
    if(!state.profile) { state.page="menu"; render(); return; }
    ensureProfileDefaults(state.profile);
    create('h2', { textContent: "Shop" }, app);
    let shop = create('div', { className:"menu-content" }, app);
    let coinShow = create('div', { style:"text-align:center;font-size:18px;color:#fbc531;font-weight:bold;margin-bottom:12px;" }, shop);
    coinShow.innerHTML = `💰 Münzen: <span id="coinVal">${state.profile.coins}</span>`;
    // Skins kaufen
    create('div',{className:"headline",textContent:"Skins kaufen"},shop);
    let skList = create('div',{style:"margin-bottom:18px;"},shop);
    skins.slice(1).forEach((skin,i)=>{
      let unlocked = state.profile.ownedSkins.includes(i+1);
      let btn = create('button',{textContent: unlocked?"Gehört":"Kaufen ("+skin.price+"💰)",style:"margin:7px 8px;"},skList);
      if(unlocked) btn.disabled = true;
      btn.onclick = ()=>{
        if(state.profile.coins < skin.price) { alert("Nicht genug Münzen!"); return; }
        state.profile.coins -= skin.price;
        state.profile.ownedSkins.push(i+1);
        saveProfile(state.profile);
        render();
      };
      let prev = create('span',{innerHTML:`<span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:${skin.primary};border:1px solid #fff;margin-right:7px;vertical-align:middle;"></span> ${skin.name}`},skList);
      skList.appendChild(btn);
      skList.appendChild(create('br'));
    });
    // Punkte kaufen
    create('div',{className:"headline",textContent:"Punkte kaufen"},shop);
    let pBtn = create('button',{textContent:"+50 Punkte (5💰)",style:"margin:7px 8px;"},shop);
    pBtn.onclick = ()=>{
      if(state.profile.coins < 5) { alert("Nicht genug Münzen!"); return; }
      state.profile.coins -= 5; state.profile.passPoints += 50; saveProfile(state.profile); alert("+50 Pass-Punkte!"); render();
    };
    // Powerup kaufen (nächstes Spiel unbesiegbar)
    create('div',{className:"headline",textContent:"Power-Up"},shop);
    let powBtn = create('button',{textContent:"Unbesiegbar im nächsten Spiel (7💰)",style:"margin:7px 8px;"},shop);
    powBtn.onclick = ()=>{
      if(state.profile.coins < 7) { alert("Nicht genug Münzen!"); return; }
      state.profile.coins -= 7; state.profile.nextGameInvincible = true; saveProfile(state.profile); alert("Du bist im nächsten Spiel unbesiegbar!"); render();
    };
    create('div', { style:"margin-top:22px;text-align:center;" }, shop).innerHTML = `<button onclick="window.location.reload()">Zurück</button>`;
  }

  // BRAWL PASS: Stufen, Belohnungen, abholen
  function renderPass() {
    if(!state.profile) { state.page="menu"; render(); return; }
    ensureProfileDefaults(state.profile);
    create('h2', { textContent: "Brawl Pass" }, app);
    let pass = create('div', { className:"menu-content" }, app);
    let pts = state.profile.passPoints||0;
    pass.innerHTML = `<div class="headline">🎫 Brawl Pass Saison 1</div>
    <div style="font-size:18px;">Fortschritt: <b>${pts} Punkte</b></div>
    <div style="margin:12px 0 24px 0;">
      <progress value="${pts}" max="${passTiers[passTiers.length-1].pts}" style="width:90%;height:18px;border-radius:10px;"></progress>
    </div>`;
    passTiers.forEach(tier=>{
      let reached = pts>=tier.pts;
      let taken = state.profile.passRewards && state.profile.passRewards[tier.lvl];
      let desc = [];
      if(tier.reward.coins) desc.push(`💰 ${tier.reward.coins} Münzen`);
      if(tier.reward.skin!==undefined) desc.push(`Skin: ${skins[tier.reward.skin].name}`);
      let row = create('div', { style:"margin-bottom:12px;padding:8px 0 8px 0;border-bottom:1px solid #fff1;" }, pass);
      row.innerHTML = `<b>Stufe ${tier.lvl}:</b> bei <b>${tier.pts}</b> Punkten<br>${desc.join(", ")}`;
      let btn = create('button', {
        textContent: taken?"Abgeholt!":reached?"Abholen":"Nicht erreicht",
        disabled: !reached || taken,
        style:"margin-left:18px;" + (taken?"background:#ccc;color:#8e8e8e;":"")
      }, row);
      btn.onclick = ()=>{
        if(!reached || taken) return;
        if(tier.reward.coins) state.profile.coins += tier.reward.coins;
        if(tier.reward.skin!==undefined && !state.profile.ownedSkins.includes(tier.reward.skin)) state.profile.ownedSkins.push(tier.reward.skin);
        state.profile.passRewards[tier.lvl] = true;
        saveProfile(state.profile); render();
      };
    });
    create('div', { style:"margin-top:22px;text-align:center;" }, pass).innerHTML = `<button onclick="window.location.reload()">Zurück</button>`;
  }

  function renderNews() {
    create('h2', { textContent: "News" }, app);
    let news = create('div', { className:"menu-content" }, app);
    news.innerHTML = `
      <div class="headline">📰 Aktuelles</div>
      <ul>
        <li>Shop und Brawl Pass jetzt mit Belohnungen!</li>
        <li>Neue Skins freischaltbar im Shop & Pass!</li>
        <li>Mehr Features folgen bald!</li>
      </ul>
      <div style="margin-top:12px;color:#bbb;">(News sind Demo!)</div>
      <button style="margin-top:22px;" onclick="window.location.reload()">Zurück</button>
    `;
  }

  function renderLogin() {
    create('h2', { textContent: 'Profil Anmelden/Erstellen' }, app);
    let form = create('div', { className:"menu-content", style:"max-width:340px;margin:0 auto;" }, app);
    let nameLab = create('label', { textContent: "Name:" }, form);
    let nameInput = create('input', { type:"text", value: state.profile?state.profile.name:"" }, form);
    let pwLab = create('label', { textContent: "Passwort:" }, form);
    let pwInput = create('input', { type:"password", value: state.profile?state.profile.password:"" }, form);
    let skinLab = create('label', { textContent: "Skin:" }, form);
    let skinSel = create('select', {}, form);
    skins.forEach((skin,i)=>create('option',{value:i,textContent:skin.name},skinSel));
    if(state.profile) skinSel.value = state.profile.skin;
    let msg = create('div', { style:"color:#ffb300;font-size:15px;margin-bottom:10px;" }, form);
    let submitBtn = create('button', {textContent:"Speichern & Weiter"}, form);
    let backBtn = create('button', {textContent:"Abbrechen", style:"margin-left:18px;"}, form);
    submitBtn.onclick = ()=>{
      let name = nameInput.value.trim();
      let pw = pwInput.value;
      if(!name) { msg.textContent="Bitte Name eingeben!"; return; }
      if(!pw) { msg.textContent="Bitte Passwort eingeben!"; return; }
      let prof = loadProfile(name);
      if(prof && (!state.profile || name!==state.profile.name) ) { msg.textContent="Name schon vergeben!"; return; }
      if(!prof) prof = { name, password: pw, skin: parseInt(skinSel.value), highscore: 0, lastscore: 0 };
      prof.password = pw;
      prof.skin = parseInt(skinSel.value);
      ensureProfileDefaults(prof);
      saveProfile(prof);
      state.profile = prof;
      state.page="profile";
      render();
    };
    backBtn.onclick = ()=>{ state.page=state.profile?"profile":"menu"; render(); };
  }

  function renderGame() {
    if(!state.profile) { state.page="menu"; render(); return; }
    ensureProfileDefaults(state.profile);
    create('h2', { textContent: "2D-Spiel: Mario-Style" }, app);
    let scoreDiv = create('div', { className:"scoreboard" }, app);
    let sbUser = create('span', { textContent: `Spieler: ${state.profile.name}` }, scoreDiv);
    let sbScore = create('span', { className:"score", textContent: `Score: 0` }, scoreDiv);
    let sbEffect = create('span', { className:"effect", textContent: "" }, scoreDiv);
    let coinShow = create('span', { style:"margin-left:15px;color:#fbc531;font-weight:bold;" }, scoreDiv);
    coinShow.innerHTML = `💰 ${state.profile.coins}`;
    let resetBtn = create('button', { className:"reset-btn", textContent: "Reset" }, scoreDiv);
    let menuBtn = create('button', { className:"reset-btn", textContent: "Menü", style:"background:#ffe49c;color:#222;" }, scoreDiv);
    let inf = create('div', { className: "menu-content", style:"text-align:center;" }, app);
    inf.innerHTML = `Benutze die Pfeiltasten (links/rechts/oben) zum Steuern. <br>Springe über oder auf Gegner! Sammle Power-Ups!`;
    let canvas = create('canvas', { width: 500, height: 300, style:"margin-top:18px;" }, app);

    // --- Game Logic ---
    let ctx = canvas.getContext('2d');
    let skin = skins[state.profile.skin];
    let player = { x:60, y:210, w:34, h:44, skin:skin, vy:0, onGround:true, invincible:false, invinceTimer:0 };
    let gravity = 0.8, jumpPower = -10, moveSpeed = 4, keys = {}, score = 0, gameOver = false;
    let enemies = [], powerups = [], powerupTypes = ['invincible', 'highjump', 'bonus'];
    let highJumpActive = false, highJumpTimer = 0, message = '';
    let enemyInterval, powerupInterval, animationFrame;
    // Powerup aus Shop
    if(state.profile.nextGameInvincible) { player.invincible = true; player.invinceTimer = 400; message = "Shop-Powerup!"; state.profile.nextGameInvincible = false; saveProfile(state.profile);}
    function stop() {
      clearInterval(enemyInterval);
      clearInterval(powerupInterval);
      cancelAnimationFrame(animationFrame);
      window.onkeydown = null;
      window.onkeyup = null;
    }
    state.game = { stop };
    function spawnEnemy() {
      const h = 30 + Math.floor(Math.random()*15);
      enemies.push({ x: canvas.width, y: 250-h, w:30, h:h, color:'#e53935', speed:2+Math.random()*2, alive:true });
    }
    function spawnPowerup() {
      const type = powerupTypes[Math.floor(Math.random()*powerupTypes.length)];
      const yLevel = Math.random()>0.5?170:210;
      powerups.push({ x:canvas.width, y:yLevel, w:24, h:24, type:type, color:type==='invincible'?'#ffd600':(type==='highjump'?'#43a047':'#ff6f00'), active:true });
    }
    enemyInterval = setInterval(spawnEnemy, 1200);
    powerupInterval = setInterval(spawnPowerup, 5000);

    function loop() {
      if (gameOver) return;
      if (keys['ArrowLeft'] && player.x > 0) player.x -= moveSpeed;
      if (keys['ArrowRight'] && player.x < canvas.width - player.w) player.x += moveSpeed;
      if (keys['ArrowUp'] && player.onGround) { player.vy = highJumpActive ? jumpPower*1.5 : jumpPower; player.onGround = false; }
      player.y += player.vy; player.vy += gravity;
      if (player.y >= 210) { player.y = 210; player.vy = 0; player.onGround = true; }
      if (player.invincible) { player.invinceTimer--; if(player.invinceTimer<=0) { player.invincible=false; message=''; } }
      if (highJumpActive) { highJumpTimer--; if(highJumpTimer<=0) { highJumpActive=false; message=''; } }
      for (let en of enemies) if(en.alive) en.x -= en.speed;
      enemies = enemies.filter(en=>{if(en.x+en.w<0){score++;return false;}return true;});
      for (let pu of powerups) pu.x -= 2.2;
      powerups = powerups.filter(pu=>pu.x+pu.w>0&&pu.active);
      for (let pu of powerups) {
        if (pu.active && rectsCollide(player, pu)) {
          if (pu.type==='invincible') { player.invincible=true; player.invinceTimer=300; message='Unbesiegbar!'; }
          else if (pu.type==='highjump') { highJumpActive=true; highJumpTimer=360; message='Super-Sprung!'; }
          else if (pu.type==='bonus') { score+=10; message='+10 Punkte!'; }
          pu.active=false;
        }
      }
      for (let en of enemies) {
        if (!en.alive) continue;
        if (rectsCollide(player, en)) {
          if (player.vy > 0 && player.y+player.h-en.y<18) { en.alive=false; player.vy=jumpPower*0.7; score+=5; message='Gegner besiegt! +5 Punkte'; }
          else if (!player.invincible) {
            gameOver=true; stop();
            inf.innerHTML = `Game Over! Dein Score: ${score}<br><span style="color:#ffe49c">Drücke Reset für Neustart.</span>`;
            // Coins & Passpunkte
            let coinsGain = Math.max(1, Math.floor(score/10));
            let passPtGain = score;
            state.profile.coins += coinsGain;
            state.profile.passPoints += passPtGain;
            state.profile.lastscore = score;
            if (!state.profile.highscore || score > state.profile.highscore) state.profile.highscore = score;
            saveProfile(state.profile);
            coinShow.innerHTML = `💰 ${state.profile.coins}`;
          }
        }
      }
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle="#bdbdbd"; ctx.fillRect(0,250,canvas.width,50);
      for (let pu of powerups) {
        if(!pu.active) continue;
        ctx.fillStyle=pu.color; ctx.strokeStyle='#333'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(pu.x+pu.w/2,pu.y+pu.h/2,pu.w/2,0,2*Math.PI); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#333'; ctx.font="bold 16px Arial"; ctx.textAlign="center"; ctx.textBaseline="middle";
        if(pu.type==='invincible') ctx.fillText('★',pu.x+pu.w/2,pu.y+pu.h/2+1);
        if(pu.type==='highjump') ctx.fillText('↑',pu.x+pu.w/2,pu.y+pu.h/2+1);
        if(pu.type==='bonus') ctx.fillText('+',pu.x+pu.w/2,pu.y+pu.h/2+1);
      }
      ctx.textAlign="start";
      for(let en of enemies) {
        if(!en.alive) continue;
        ctx.fillStyle=en.color; ctx.fillRect(en.x,en.y,en.w,en.h);
        ctx.fillStyle="#fff"; ctx.fillRect(en.x+7,en.y+8,7,7); ctx.fillRect(en.x+16,en.y+8,7,7);
        ctx.fillStyle="#222"; ctx.fillRect(en.x+9,en.y+12,3,3); ctx.fillRect(en.x+18,en.y+12,3,3); ctx.fillRect(en.x+11,en.y+21,8,3);
      }
      drawPlayerSkin(ctx,player);
      sbScore.textContent = `Score: ${score}`; sbEffect.textContent = message;
      coinShow.innerHTML = `💰 ${state.profile.coins}`;
      if (!gameOver) animationFrame = requestAnimationFrame(loop);
    }
    keys={};
    window.onkeydown = e=>{ keys[e.key]=true; };
    window.onkeyup = e=>{ keys[e.key]=false; };
    function rectsCollide(a,b) { return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y; }
    function drawPlayerSkin(ctx,player) {
      const {x,y,w,h,skin,invincible}=player;
      if(invincible){ctx.save();ctx.shadowColor="#ffd600";ctx.shadowBlur=16;}
      ctx.fillStyle=skin.primary;ctx.fillRect(x,y+10,w,h-10);
      ctx.beginPath();ctx.arc(x+w/2,y+12,w/2.1,0,2*Math.PI);ctx.fillStyle=skin.face;ctx.fill();
      ctx.strokeStyle="#222";ctx.lineWidth=1.5;ctx.stroke();
      ctx.beginPath();ctx.arc(x+w/2-7,y+12,3,0,2*Math.PI);ctx.arc(x+w/2+7,y+12,3,0,2*Math.PI);ctx.fillStyle="#222";ctx.fill();
      ctx.beginPath();ctx.arc(x+w/2,y+18,6,0,Math.PI);ctx.lineWidth=2;ctx.strokeStyle="#a0522d";ctx.stroke();
      ctx.beginPath();ctx.moveTo(x+5,y+18);ctx.lineTo(x-4,y+28);ctx.moveTo(x+w-5,y+18);ctx.lineTo(x+w+4,y+28);
      ctx.strokeStyle=skin.primary;ctx.lineWidth=5;ctx.stroke();
      ctx.beginPath();ctx.arc(x-4,y+28,3,0,2*Math.PI);ctx.arc(x+w+4,y+28,3,0,2*Math.PI);ctx.fillStyle=skin.accent;ctx.fill();
      ctx.beginPath();ctx.arc(x+10,y+h-2,4,0,2*Math.PI);ctx.arc(x+w-10,y+h-2,4,0,2*Math.PI);ctx.fillStyle="#333";ctx.fill();
      if(invincible) ctx.restore();
    }
    spawnEnemy(); loop();
    resetBtn.onclick = ()=>{ if(state.game&&state.game.stop)state.game.stop(); setTimeout(()=>{ render(); },150);}
    menuBtn.onclick = ()=>{ if(state.game&&state.game.stop)state.game.stop(); state.page="menu"; render(); };
  }

  render();
})();
