(function(){
  'use strict';
	console.log('running js');

  var BACK4APP_APP_ID     = "sH7kuCDwd9njmbHOkUry2ZaBtZXi7D9iqEovV0q0";
  var BACK4APP_JS_KEY     = "QjlerUQrPdVUMOTHTXcIVsCAFFKC6DXxjwKpR36x";
  var BACK4APP_SERVER_URL = "https://parseapi.back4app.com";

  var EMOJIS = [
    // Original Favorites
    "🌟","🎨","🌈","🌸","🦋","🌻","🍀","🎶",
    "✨","💫","🎉","🌺","🐝","🌙","🦄","🎀",
    
    // Fun Faces & Monsters
    "🤪","😎","🤠","🥳","🥸","🤡","👻","💀",
    "👽","👾","🤖","🎃","👹","👺","🧜‍♀️","🧚",
    "🧙‍♂️","🧛","🧟","🦸‍♀️","🦹","🧞‍♂️","👼","🕵️",
    
    // Magical & Space
    "🔮","🪄","🧿","🪐","☄️","🚀","🛸","🌌",
    "⚡","🔥","💧","❄️","🌪️","🌈","☀️","🌕",
    
    // Cute & Wild Animals
    "🦥","🦦","🦇","🦩","🦖","🦕","🐙","🦑",
    "🐡","🦈","🦭","🦧","🦍","🦣","🐅","🦓",
    "🦒","🦘","🦔","🐿️","🐉","🐲","🐛",
    
    // Yummy & Fun Food
    "🥑","🌮","🌯","🥨","🧀","🥞","🧇","🥓",
    "🍔","🍟","🍕","🌭","🍿","🍩","🍪","🎂",
    "🧁","🍫","🍬","🍭","🍡","🍧","🍦","🧋",
    
    // Hobbies, Objects & Vibes
    "🎮","🕹️","🎲","🧩","🎳","🎸","🥁","🎷",
    "🛹","🛼","🚲","🛵","🏎️","🚁","⛵","⛺",
    "🎡","🎢","🎠","💎","👑","🧸","🪀","🪁",
    "💣","🧨","🎉","🎊","🎈","💌","💖","💝"
  ];

var selectedEmoji = "🌟";
var selectedTheme = 1;

var THEME_COLORS = {
  1:  { border: "#e8008a", shadow: "#ffe135" },
  2:  { border: "#00c2d1", shadow: "#8b2fc9" },
  3:  { border: "#ff6b1a", shadow: "#00c2d1" },
  4:  { border: "#8b2fc9", shadow: "#e8008a" },
  5:  { border: "#3ddc84", shadow: "#ffe135" },
  6:  { border: "#d1b400", shadow: "#3ddc84" },
  7:  { border: "#e8008a", shadow: "#00c2d1" },
  8:  { border: "#00c2d1", shadow: "#ffe135" },
  9:  { border: "#ff6b1a", shadow: "#8b2fc9" },
  10: { border: "#8b2fc9", shadow: "#3ddc84" }
};

function updateEmojiChosen() {
  var el = document.querySelector("#emoji-chosen");
  if (!el) return;
  var colors = THEME_COLORS[selectedTheme] || THEME_COLORS[1];
  el.style.borderColor = colors.border;
  el.style.boxShadow   = "3px 3px 0 " + colors.shadow;
}

function buildThemePicker() {
  var container = document.querySelector("#theme-grid");
  if (!container) return;
  container.innerHTML = "";
  
  for (var i = 1; i <= 10; i++) {
    (function(themeIndex) {
      var btn = document.createElement("button");
      btn.className = "theme-opt note-theme-" + themeIndex + (themeIndex === selectedTheme ? " selected" : "");
      btn.type = "button"; 
      
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        selectedTheme = themeIndex;
        document.querySelectorAll(".theme-opt").forEach(function(el) { el.classList.remove("selected"); });
        btn.classList.add("selected");
        updateEmojiChosen();
      });
      container.appendChild(btn);
    })(i);
  }
}

  function initParse() {
    Parse.initialize(BACK4APP_APP_ID, BACK4APP_JS_KEY);
    Parse.serverURL = BACK4APP_SERVER_URL;
    setupUI();
  }

  function buildEmojiPicker() {
    var container = document.querySelector("#emoji-grid");
    if (!container) return;
    container.innerHTML = "";
    EMOJIS.forEach(function(em) {
      var btn = document.createElement("button");
      btn.className = "emoji-opt" + (em === selectedEmoji ? " selected" : "");
      btn.textContent = em;
      btn.setAttribute("aria-label", em);
      btn.addEventListener("click", function() {
        selectedEmoji = em;
        document.querySelectorAll(".emoji-opt").forEach(function(b) { b.classList.remove("selected"); });
        btn.classList.add("selected");
        document.querySelector("#emoji-chosen").textContent = em;
      });
      container.appendChild(btn);
    });
  }

  function getStringHash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }

  // Fisher-Yates shuffle (mutates a copy)
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  var cachedResults = [];

  function renderMessages(results) {
    var list = document.querySelector("#notes-list");
    if (!list) return;
    list.innerHTML = "";

    if (results.length === 0) {
      list.innerHTML = '<div class="empty-message">oh no looks like its empty</div>';
      return;
    }

    results.forEach(function(obj) {
      var emoji      = obj.get("emoji")   || "🌟";
      var author     = obj.get("author")  || "Anonymous";
      var msg        = obj.get("message") || "";
      var themeIndex = obj.get("theme")   || (getStringHash(author) % 10) + 1;

      var div = document.createElement("div");
      div.className = "note-item note-theme-" + themeIndex;
      div.innerHTML =
        '<div class="note-top">' +
          '<div class="note-avatar">' + emoji + '</div>' +
          '<div class="note-name">' + author + '</div>' +
        '</div>' +
        '<div class="note-msg">' + msg + '</div>';
      list.appendChild(div);
    });
  }

  function fetchMessages() {
    var list = document.querySelector("#notes-list");
    if (!list) return;

    var ThankYouNotes = Parse.Object.extend("ThankYouNotes");
    var query = new Parse.Query(ThankYouNotes);
    query.find().then(function(results) {
      cachedResults = results;
      renderMessages(shuffle(results));
    }).catch(function(err) {
      console.error("Parse fetch error:", err);
    });
  }

  // Mobile shake to reshuffle
  function setupShake() {
    if (!window.DeviceMotionEvent) return;

    var lastShake = 0;
    var threshold = 18;
    var lastX = null, lastY = null, lastZ = null;

    function onMotion(e) {
      var acc = e.accelerationIncludingGravity;
      if (!acc) return;

      if (lastX === null) {
        lastX = acc.x; lastY = acc.y; lastZ = acc.z;
        return;
      }

      var delta = Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ);
      lastX = acc.x; lastY = acc.y; lastZ = acc.z;

      var now = Date.now();
      if (delta > threshold && now - lastShake > 1200) {
        lastShake = now;
        var notesSection = document.querySelector("#notes-section");
        if (cachedResults.length > 0 && notesSection && notesSection.classList.contains("visible")) {
          notesSection.classList.add("shake-anim");
          setTimeout(function() { notesSection.classList.remove("shake-anim"); }, 500);
          renderMessages(shuffle(cachedResults));
          var hint = document.querySelector("#shake-hint");
          if (hint) hint.style.display = "none";
        }
      }
    }

    // iOS 13+ requires permission
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      // Attach a one-time tap listener to request permission on first interaction
      document.addEventListener("click", function grantMotion() {
        DeviceMotionEvent.requestPermission().then(function(state) {
          if (state === "granted") window.addEventListener("devicemotion", onMotion);
        }).catch(function(){});
        document.removeEventListener("click", grantMotion);
      }, { once: true });
    } else {
      window.addEventListener("devicemotion", onMotion);
    }
  }

  function setupUI() {
    buildEmojiPicker();
    buildThemePicker();
    setupShake();

    var openBtn      = document.querySelector("#open-btn");
    var closeBtn     = document.querySelector("#close-btn");
    var notesSection = document.querySelector("#notes-section");
    var modal        = document.querySelector("#modal-overlay");

    // Mobile shake hint
    var shakeHint = document.createElement("div");
    shakeHint.id = "shake-hint";
    shakeHint.textContent = "📱 shake to reshuffle!";
    shakeHint.style.cssText = "display:none;text-align:center;font-family:var(--font-mono);font-size:13px;color:var(--text-muted);letter-spacing:0.08em;margin-bottom:16px;animation:pulse-stars 2s ease-in-out infinite;";
    notesSection.querySelector(".notes-header").appendChild(shakeHint);

    openBtn.addEventListener("click", function() {
      notesSection.style.display = "block";
      setTimeout(function() { notesSection.classList.add("visible"); }, 10);
      openBtn.style.display  = "none";
      closeBtn.style.display = "inline-block";
      // Show shake hint on touch devices
      if (window.DeviceMotionEvent && "ontouchstart" in window) {
        shakeHint.style.display = "block";
      }
      fetchMessages();
    });

    closeBtn.addEventListener("click", function() {
      notesSection.classList.remove("visible");
      setTimeout(function() { notesSection.style.display = "none"; }, 500);
      closeBtn.style.display = "none";
      openBtn.style.display  = "inline-block";
    });

    document.querySelector("#student-link").onclick = function() { modal.classList.add("visible"); };
    document.querySelector("#modal-close").onclick  = function() { modal.classList.remove("visible"); };

    document.querySelector("#send-btn").onclick = function() {
      var author = document.querySelector("#author-input").value.trim();
      var msg    = document.querySelector("#message-input").value.trim();
      if (!author || !msg) return alert("Please fill both fields!");

      var ThankYouNotes = Parse.Object.extend("ThankYouNotes");
      var note = new ThankYouNotes();
      note.save({ author: author, message: msg, emoji: selectedEmoji, theme: selectedTheme }).then(function(savedNote) {
        document.querySelector("#author-input").value  = "";
        document.querySelector("#message-input").value = "";
        modal.classList.remove("visible");

        // Always show notes section with new note at top
        notesSection.style.display = "block";
        setTimeout(function() { notesSection.classList.add("visible"); }, 10);
        openBtn.style.display  = "none";
        closeBtn.style.display = "inline-block";

        // Put new note first, shuffle the rest behind it
        // Remove savedNote if already in cachedResults to avoid duplicates
        cachedResults = cachedResults.filter(function(r) { return r.id !== savedNote.id; });
        cachedResults.unshift(savedNote);
        renderMessages([savedNote].concat(shuffle(cachedResults.slice(1))));
      }).catch(function(err) {
        console.error("Parse save error:", err);
        alert("Something went wrong saving your note. Please try again.");
      });
    };
  }

  (function() {
    var s = document.createElement("script");
    s.src = "https://npmcdn.com/parse/dist/parse.min.js";
    s.onload = initParse;
    document.head.appendChild(s);
  })();

})();