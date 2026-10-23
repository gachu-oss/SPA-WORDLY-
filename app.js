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