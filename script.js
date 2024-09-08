let words = [];
let currentWord = "";
let guessedLetters = [];
let mistakes = 0;
let score = 0;

const wordContainer = document.getElementById("word-container");
const definitionElement = document.getElementById("definition");
const partOfSpeechElement = document.getElementById("part-of-speech");
const alphabetContainer = document.getElementById("alphabet-container");
const scoreElement = document.getElementById("score");
const mistakesElement = document.getElementById("mistakes");
const messageElement = document.getElementById("message");
const buttonContainer = document.getElementById("button-container");
const wordsLeftElement = document.getElementById("words-left");
const skipWordButton = document.getElementById("skip-word");
const giveUpButton = document.getElementById("give-up");

fetch("words.json")
  .then((response) => response.json())
  .then((data) => {
    words = Object.entries(data);
    document.getElementById("loading").style.display = "none"; // Hide loading indicator
    initializeGame();
  })
  .catch((error) => {
    console.error("Error loading words:", error);
    showMessage("Failed to load words. Please try again later.", "danger");
  });

function initializeGame() {
  score = 0;
  scoreElement.textContent = score;
  nextWord();
}

function nextWord() {
  if (words.length === 0) {
    showMessage("Congratulations! You've completed all words!", "success");
    disableAlphabetButtons();
    buttonContainer.innerHTML =
      '<button id="new-game" class="btn btn-primary mx-2">New Game</button>';
    document
      .getElementById("new-game")
      .addEventListener("click", initializeGame);
    return;
  }
  const randomIndex = Math.floor(Math.random() * words.length);
  const [word, [definition, partOfSpeech]] = words[randomIndex];
  currentWord = word.toUpperCase();
  guessedLetters = [];
  mistakes = 0;
  updateWordDisplay();
  updateMistakesDisplay();
  definitionElement.textContent = definition;
  partOfSpeechElement.textContent = `(${partOfSpeech})`;
  messageElement.classList.add("d-none");
  createAlphabetButtons();
  updateWordsLeftDisplay();
  updateButtonContainer();
}

function updateWordDisplay() {
  wordContainer.innerHTML = "";
  for (const letter of currentWord) {
    const letterBox = document.createElement("span");
    letterBox.classList.add("letter-box");
    letterBox.textContent = guessedLetters.includes(letter) ? letter : "";
    wordContainer.appendChild(letterBox);
  }
}

function createAlphabetButtons() {
  alphabetContainer.innerHTML = "";
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const button = document.createElement("button");
    button.classList.add("btn", "btn-outline-primary", "alphabet-btn");
    button.textContent = letter;
    button.setAttribute("aria-label", `Guess the letter ${letter}`);
    button.addEventListener("click", () => handleGuess(letter));
    alphabetContainer.appendChild(button);
  }
}

function handleGuess(letter) {
  if (guessedLetters.includes(letter)) return;
  guessedLetters.push(letter);
  updateWordDisplay();

  if (currentWord.includes(letter)) {
    if (isWordGuessed()) {
      endGame(true);
    }
  } else {
    mistakes++;
    updateMistakesDisplay();
    if (mistakes >= 6) {
      endGame(false);
    }
  }

  const buttonElement = [...alphabetContainer.children].find(
    (btn) => btn.textContent === letter
  );
  buttonElement.disabled = true;
  buttonElement.classList.remove("btn-outline-primary");
  buttonElement.classList.add(
    currentWord.includes(letter) ? "btn-success" : "btn-danger"
  );
}

function isWordGuessed() {
  return [...currentWord].every((letter) => guessedLetters.includes(letter));
}

function updateMistakesDisplay() {
  mistakesElement.textContent = mistakes;
}

function endGame(isWin) {
  if (isWin) {
    score += 10;
    scoreElement.textContent = score;
    showMessage("Congratulations! You guessed the word!", "success");
  } else {
    showMessage(`Game over! The word was "${currentWord}"`, "danger");
  }
  disableAlphabetButtons();
  removeCurrentWord();
  updateButtonContainer("next");
}

function showMessage(text, type) {
  messageElement.textContent = text;
  messageElement.classList.remove(
    "d-none",
    "alert-success",
    "alert-danger",
    "alert-info"
  );
  messageElement.classList.add(`alert-${type}`);
}

function disableAlphabetButtons() {
  [...alphabetContainer.children].forEach((btn) => (btn.disabled = true));
}

function removeCurrentWord() {
  words = words.filter((entry) => entry[0].toUpperCase() !== currentWord);
  updateWordsLeftDisplay();
}

function updateWordsLeftDisplay() {
  wordsLeftElement.textContent = words.length;
}

function handleSkip() {
  removeCurrentWord();
  nextWord();
}

function handleGiveUp() {
  guessedLetters = [...currentWord];
  updateWordDisplay();
  disableAlphabetButtons();
  showMessage(`The word was "${currentWord}"`, "info");
  removeCurrentWord();
  updateButtonContainer("next");
}

function updateButtonContainer(state = "default") {
  if (state === "default") {
    buttonContainer.innerHTML = `
                    <button id="skip-word" class="btn btn-secondary mx-2">Skip</button>
                    <button id="give-up" class="btn btn-danger mx-2">Give Up</button>
                `;
    document.getElementById("skip-word").addEventListener("click", handleSkip);
    document.getElementById("give-up").addEventListener("click", handleGiveUp);
  } else if (state === "next") {
    buttonContainer.innerHTML =
      '<button id="next-word" class="btn btn-primary mx-2">Next Word</button>';
    document.getElementById("next-word").addEventListener("click", nextWord);
  }
}
