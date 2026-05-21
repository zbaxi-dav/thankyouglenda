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
    "🦒","🦘","🦔","🐿️","🐉","🐲","🦋","🐛",
    
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

// NEW: Function to build the theme swatches
function buildThemePicker() {
  var container = document.querySelector("#theme-grid");
  if (!container) return;
  container.innerHTML = "";
  
  for (var i = 1; i <= 10; i++) {
    (function(themeIndex) {
      var btn = document.createElement("button");
      // Add the specific theme class so it inherits the colors!
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

  function fetchMessages() {
    var list = document.querySelector("#notes-list");
    if (!list) return;

    var ThankYouNotes = Parse.Object.extend("ThankYouNotes");
    var query = new Parse.Query(ThankYouNotes);
    query.descending("createdAt").find().then(function(results) {
      list.innerHTML = "";
      
      if (results.length === 0) {
        list.innerHTML = '<div class="empty-message">oh no looks like its empty</div>';
        return;
      }

      results.forEach(function(obj) {
        var emoji = obj.get("emoji") || "🌟";
        var author = obj.get("author") || "Anonymous";
        var msg = obj.get("message") || "";
        
        var themeIndex = obj.get("theme") || (getStringHash(author) % 10) + 1;
        
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
    }).catch(function(err) {
      console.error("Parse fetch error:", err);
    });
  }

  function setupUI() {
    buildEmojiPicker();
    buildThemePicker();

    var openBtn      = document.querySelector("#open-btn");
    var closeBtn     = document.querySelector("#close-btn");
    var notesSection = document.querySelector("#notes-section");
    var modal        = document.querySelector("#modal-overlay");

    openBtn.addEventListener("click", function() {
      notesSection.style.display = "block";
      setTimeout(function() { notesSection.classList.add("visible"); }, 10);
      openBtn.style.display  = "none";
      closeBtn.style.display = "inline-block";
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
      note.save({ author: author, message: msg, emoji: selectedEmoji, theme: selectedTheme }).then(function() {
        document.querySelector("#author-input").value  = "";
        document.querySelector("#message-input").value = "";
        modal.classList.remove("visible");
        if (notesSection.classList.contains("visible")) fetchMessages();
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
