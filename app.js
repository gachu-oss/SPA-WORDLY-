// HTML elements
const form = document.getElementById("search-form");
const wordInput = document.getElementById("word-input");
const message = document.getElementById("message");
const resultBox = document.getElementById("result-box");
const wordTitle = document.getElementById("word-title");
const phonetic = document.getElementById("phonetic");
const playBtn = document.getElementById("play-btn");
const saveBtn = document.getElementById("save-btn");
const definitionsDiv = document.getElementById("definitions");
const savedList = document.getElementById("saved-list");

// Variables
let currentWord = "";
let audioUrl = "";
let savedWords = JSON.parse(localStorage.getItem("savedWords")) || [];

// Load saved words from localStorage on start
displaySavedWords();

// 1. Search form submit event
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const word = wordInput.value.trim();

  if (word === "") {
    message.textContent = "Please enter a word!";
    return;
  }

  searchWord(word);
});

// 2. Fetch word definition from API
async function searchWord(word) {
  message.textContent = "Searching...";
  resultBox.style.display = "none";

  // 1. Try primary Free Dictionary API
  try {
    let res = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + word);
    if (res.ok) {
      let data = await res.json();
      displayResults(data[0]);
      return;
    }
  } catch (e) {
    // Primary API down or network issue, proceed to backup
  }

  // 2. Backup API lookup (Wiktionary)
  try {
    let wikRes = await fetch("https://en.wiktionary.org/api/rest_v1/page/definition/" + word);
    if (wikRes.ok) {
      let wikData = await wikRes.json();
      displayWiktionary(word, wikData);
      return;
    }
    message.textContent = "Word not found!";
  } catch (err) {
    message.textContent = "Error fetching word. Please try again.";
  }
}

// 3. Display results on the page
function displayResults(data) {
  message.textContent = "";
  resultBox.style.display = "block";

  currentWord = data.word;
  wordTitle.textContent = data.word;
  phonetic.textContent = data.phonetic || (data.phonetics && data.phonetics[0] && data.phonetics[0].text) || "No pronunciation available";

  // Find audio pronunciation
  audioUrl = "";
  if (data.phonetics) {
    for (let p of data.phonetics) {
      if (p.audio) {
        audioUrl = p.audio;
        break;
      }
    }
  }

  // Display definitions using innerHTML
  definitionsDiv.innerHTML = "";
  for (let meaning of data.meanings) {
    let defsHtml = "";
    for (let d of meaning.definitions.slice(0, 3)) {
      defsHtml += "<li>" + d.definition + (d.example ? "<br><em>\"" + d.example + "\"</em>" : "") + "</li>";
    }

    let syns = (meaning.synonyms && meaning.synonyms.length > 0) ? meaning.synonyms.join(", ") : "No synonyms available";

    definitionsDiv.innerHTML += 
      "<div class=\"meaning\">" +
        "<p class=\"part-of-speech\">" + meaning.partOfSpeech + "</p>" +
        "<ol>" + defsHtml + "</ol>" +
        "<p><strong>Synonyms:</strong> " + syns + "</p>" +
      "</div>";
  }

  updateSaveButton();
}

// Simple backup display in case Wiktionary is used
function displayWiktionary(word, data) {
  message.textContent = "";
  resultBox.style.display = "block";
  currentWord = word;
  wordTitle.textContent = word;
  phonetic.textContent = "/" + word + "/";
  audioUrl = "";

  definitionsDiv.innerHTML = "";
  let entries = data.en || [];
  for (let entry of entries) {
    let defsHtml = "";
    for (let d of (entry.definitions || []).slice(0, 2)) {
      defsHtml += "<li>" + d.definition.replace(/<[^>]*>/g, "") + "</li>";
    }

    definitionsDiv.innerHTML += 
      "<div class=\"meaning\">" +
        "<p class=\"part-of-speech\">" + entry.partOfSpeech + "</p>" +
        "<ol>" + defsHtml + "</ol>" +
        "<p><strong>Synonyms:</strong> No synonyms available</p>" +
      "</div>";
  }

  updateSaveButton();
}

// 4. Play audio button event
playBtn.addEventListener("click", function () {
  if (audioUrl) {
    let audio = new Audio(audioUrl);
    audio.play();
  } else if ("speechSynthesis" in window) {
    let utterance = new SpeechSynthesisUtterance(currentWord);
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Sorry, no audio available for this word.");
  }
});

// 5. Save to favorites button event
saveBtn.addEventListener("click", function () {
  if (!currentWord) return;

  if (savedWords.includes(currentWord)) {
    // Remove if already in saved list
    savedWords = savedWords.filter(w => w !== currentWord);
  } else {
    // Add to saved list
    savedWords.push(currentWord);
  }

  // Save to localStorage
  localStorage.setItem("savedWords", JSON.stringify(savedWords));

  updateSaveButton();
  displaySavedWords();
});

// Update save button and word title styling (highlighting saved words)
function updateSaveButton() {
  if (savedWords.includes(currentWord)) {
    saveBtn.textContent = "Saved ✓";
    saveBtn.classList.add("saved-btn-active");
    wordTitle.classList.add("saved-highlight");
  } else {
    saveBtn.textContent = "Save to Favorites";
    saveBtn.classList.remove("saved-btn-active");
    wordTitle.classList.remove("saved-highlight");
  }
}

// 6. Display saved words list
function displaySavedWords() {
  savedList.innerHTML = "";

  for (let w of savedWords) {
    let li = document.createElement("li");
    li.textContent = w + " ";

    let delBtn = document.createElement("button");
    delBtn.textContent = "Remove";
    delBtn.className = "delete-btn";
    delBtn.onclick = function () {
      savedWords = savedWords.filter(item => item !== w);
      localStorage.setItem("savedWords", JSON.stringify(savedWords));
      displaySavedWords();
      updateSaveButton();
    };

    li.appendChild(delBtn);
    savedList.appendChild(li);
  }
}

