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
