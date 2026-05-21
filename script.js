var BACK4APP_APP_ID     = "sH7kuCDwd9njmbHOkUry2ZaBtZXi7D9iqEovV0q0";
var BACK4APP_JS_KEY     = "QjlerUQrPdVUMOTHTXcIVsCAFFKC6DXxjwKpR36x";
var BACK4APP_SERVER_URL = "https://parseapi.back4app.com";

var EMOJIS = [
  "🌟","🎨","🌈","🌸","🦋","🌻","🍀","🎶",
  "✨","💫","🎉","🌺","🐝","🌙","🦄","🎀",
  "🌴","🍉","🐠","🦚","🌊","🎸","🍄","🐢",
  "🌷","🦩","🎯","🍋","🐙","🌮","🪐","🦊",
  "🍎","🍓","🍒","🍕","🍔","🍟","🍩","🍦",
  "⚽","🏀","🏈","🎾","🎮","🧩","🎲","🥁",
  "🚗","🚀","🛸","🚢","🏝️","🌋","🏕️","🎡",
  "🐶","🐱","🐭","🐹","🐰","🐻","🐼","🐨",
  "🐯","🦁","🐮","🐷","🐸","🐒","🐔","🐧",
  "🐦","🐤","🦉","🦇","🐺","🐗","🐴","🪱",
  "🐛","🐌","🐞","🐜","💻","📱","⌚","📷",
  "🎥","📞","💎","🔮","❤️","🧡","💛","💚",
  "💙","💜","🖤","🤍","💯","🔥","💡","🎈"
];

var selectedEmoji = "🌟";

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

function fetchMessages() {
  var list = document.querySelector("#notes-list");
  if (!list) return;

  var ThankYouNotes = Parse.Object.extend("ThankYouNotes");
  var query = new Parse.Query(ThankYouNotes);
  query.descending("createdAt").find().then(function(results) {
    list.innerHTML = "";
    
    // NEW: Check if there are no messages
    if (results.length === 0) {
      list.innerHTML = '<div class="empty-message">oh no looks like its empty!</div>';
      return;
    }

    results.forEach(function(obj) {
      var emoji = obj.get("emoji") || "🌟";
      var div = document.createElement("div");
      div.className = "note-item";
      div.innerHTML =
        '<div class="note-top">' +
          '<div class="note-avatar">' + emoji + '</div>' +
          '<div class="note-name">' + (obj.get("author") || "Anonymous") + '</div>' +
        '</div>' +
        '<div class="note-msg">' + (obj.get("message") || "") + '</div>';
      list.appendChild(div);
    });
  }).catch(function(err) {
    console.error("Parse fetch error:", err);
  });
}

function setupUI() {
  buildEmojiPicker();

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
    note.save({ author: author, message: msg, emoji: selectedEmoji }).then(function() {
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
