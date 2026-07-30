"use strict";
/* Game Control Section */
const gameControl = document.querySelector(".game-control");
const input = document.getElementById("player-name");
const inputHint = gameControl.querySelector(".input-hint");
const levelsElements = document.querySelectorAll(".levels .level-btn");
/* Game Section */
const gameSection = document.querySelector(".game");
const timerBox = document.querySelector(".timer");
const levelRuleElement = document.querySelector(".level-rules");
const nameBox = document.querySelector(".name span");
const triesElement = document.querySelector(".tries span");
const blocksContainer = document.querySelector(".memory-blocks");
/* popups */
const readyWrapper = document.querySelector(".ready-wrapper");
const newScorePopup = document.querySelector(".new-score-popup");
const endLevelMessage = document.querySelector(".end-level-message");
const endGameMessage = document.querySelector(".end-game-message");
/* congrats Section */
const congratsSection = document.querySelector(".congrats-section");
const congratsActions = document.querySelector(".congrats-actions");
/* Scores Section */
const scoresBoard = document.querySelector(".scoresboard");
const scoresBoardContent = scoresBoard.querySelector(".main-content");
const tableWrapper = scoresBoard.querySelector(".table-wrapper");
const levelsTabsBox = document.querySelector(".level-tabs");
const levelsTabs = document.querySelectorAll(".tab-btn");
const tableBody = document.querySelector(".table-wrapper tbody");
const noScoresBox = document.querySelector(".scoresboard .no-scores");
// Listeners
gameControl.addEventListener("click", (e) => {
  if (e.target.classList.contains("level-btn")) {
    levelsElements.forEach((levelElement) =>
      levelElement.classList.remove("active"),
    );
    e.target.classList.add("active");
    gameState.currLevel = e.target.dataset.level;
  } else if (e.target.classList.contains("start")) {
    if (innerCheckInputFunc(input)) {
      setupLevel();
      gameControl.classList.add("hidden");
    }
  } else if (e.target.closest(".scores-btn")) {
    showScoresBoard();
  }
});
input.addEventListener("focus", (e) => {
  e.target.addEventListener("blur", outerCheckInput);
});
levelsTabsBox.addEventListener("click", (e) => {
  if (e.target.classList.contains("tab-btn")) {
    levelsTabs.forEach((tab) => tab.classList.remove("active"));
    e.target.classList.add("active");
    showScores(e.target.dataset.level);
  }
});
scoresBoardContent.addEventListener("click", (e) => {
  if (e.target.classList.contains("play-again")) {
    location.reload();
  }
  if (e.target.classList.contains("clear")) {
    if (confirm("Are you sure you want to clear all high scores?")) {
      bestScores = {
        easy: [],
        normal: [],
        hard: [],
      };
      try {
        localStorage.removeItem("memoryGameScores");
      } catch (error) {
        console.warn("Unable to clear results:", error);
      }
      showScores(gameState.currLevel);
    }
  }
});
noScoresBox.addEventListener("click", (e) => {
  if (e.target.classList.contains("start")) {
    location.reload();
  }
});
endLevelMessage.addEventListener("click", (e) => {
  if (e.target.closest(".again")) {
    setupLevel();
  } else if (e.target.closest(".next")) {
    setupLevel(true);
  }
});
endLevelMessage.addEventListener("cancel", (e) => {
  e.preventDefault();
});
endGameMessage.addEventListener("click", (e) => {
  if (e.target.classList.contains("close")) {
    e.currentTarget.close();
    transitionToCongrats();
  } else if (e.target.closest(".again")) {
    gameState.skipCongratsRedirect = true;
    e.currentTarget.close();
    setupLevel();
  } else if (e.target.closest(".scores")) {
    gameState.skipCongratsRedirect = true;
    e.currentTarget.close();
    showScoresBoard();
  }
});
endGameMessage.addEventListener("close", () => {
  if (gameState.skipCongratsRedirect) {
    gameState.skipCongratsRedirect = false;
    return;
  }
  transitionToCongrats();
});
congratsActions.addEventListener("click", (e) => {
  if (e.target.closest(".actions-again")) {
    location.reload();
  } else if (e.target.closest(".actions-scores")) {
    congratsSection.classList.add("hidden");
    showScoresBoard();
  }
});
let cards;
let baseTechnologies = [
  "angular",
  "css",
  "github",
  "gulpjs",
  "html",
  "jest",
  "mongodb",
  "python",
  "react",
  "vuejs",
];
let technologies = [...baseTechnologies, ...baseTechnologies];
const gameConfig = {
  levelsNames: ["easy", "normal", "hard"],
  levelsObjs: {
    easy: {
      timer: 120,
      tries: 20,
      duration: 1000,
      rules:
        "Relax and train your memory! You have 120 seconds and up to 20 mistakes. Unmatched cards remain visible for 1 second.",
    },
    normal: {
      timer: 90,
      tries: 15,
      duration: 800,
      rules:
        "A balanced challenge! You have 90 seconds to finish with a maximum of 15 mistakes. Unmatched cards remain visible for 0.8 seconds.",
    },
    hard: {
      timer: 60,
      tries: 12,
      duration: 600,
      rules:
        "A real challenge! You only have 60 seconds and a strict limit of 12 mistakes. Unmatched cards disappear quickly after 0.5 seconds.",
    },
  },
};
const gameState = {
  playerTries: 0,
  matchedCards: 0,
  countDown: 0,
  counter: null,
  clickingTimeout: null,
  currLevel: "easy",
  newScore: false,
  skipCongratsRedirect: false,
};
const sounds = {
  background: new Audio(`sounds/background.MP3`),
  match: new Audio(`sounds/match.MP3`),
  wrong: new Audio(`sounds/wrong.MP3`),
  win: new Audio(`sounds/win.MP3`),
  lose: new Audio(`sounds/lose.MP3`),
  finish: new Audio(`sounds/finish.MP3`),
};
setupSounds();
preloadImage(baseTechnologies);
let bestScores = JSON.parse(localStorage.getItem("memoryGameScores")) || {
  easy: [],
  normal: [],
  hard: [],
};
function preloadImage(imagesArray) {
  imagesArray.forEach((technology) => {
    const img = new Image();
    img.src = `imgs/${technology}.webp`;
  });
}
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const random = Math.floor(Math.random() * (i + 1));
    [array[random], array[i]] = [array[i], array[random]];
  }
  return array;
}
function generateBlocks() {
  let fragment = document.createDocumentFragment();
  for (const technology of technologies) {
    let cardBlock = document.createElement("div");
    let innerWrapper = document.createElement("div");
    let frontFace = document.createElement("div");
    let backFace = document.createElement("div");
    let img = document.createElement("img");
    cardBlock.classList.add("game-block");
    innerWrapper.classList.add("inner");
    cardBlock.dataset.technology = technology;
    frontFace.className = "face front";
    backFace.className = "face back";
    img.src = `imgs/${technology}.webp`;
    img.alt = technology;
    backFace.append(img);
    cardBlock.addEventListener("click", (e) => flipBlock(e.currentTarget));
    innerWrapper.append(frontFace, backFace);
    cardBlock.append(innerWrapper);
    fragment.append(cardBlock);
  }
  blocksContainer.append(fragment);
  cards = Array.from(blocksContainer.children);
}
function flipBlock(selectedCard) {
  selectedCard.classList.add("is-flipped");
  let allFlippedCards = cards.filter((flippedCard) =>
    flippedCard.classList.contains("is-flipped"),
  );
  if (allFlippedCards.length === 2) {
    checkCurrentBlocks(allFlippedCards[0], allFlippedCards[1]);
  }
}
function stopClicking() {
  blocksContainer.classList.add("no-clicking");
  gameState.clickingTimeout = setTimeout(() => {
    blocksContainer.classList.remove("no-clicking");
  }, gameConfig.levelsObjs[gameState.currLevel].duration);
}
function checkCurrentBlocks(firstBlock, secondBlock) {
  if (firstBlock.dataset.technology === secondBlock.dataset.technology) {
    playSound(sounds.match);
    firstBlock.classList.remove("is-flipped");
    secondBlock.classList.remove("is-flipped");
    firstBlock.classList.add("has-match");
    secondBlock.classList.add("has-match");
    gameState.matchedCards += 2;
    if (gameState.matchedCards === cards.length)
      gameState.currLevel !== "hard" ? endlevel() : endlevel(true);
  } else {
    playSound(sounds.wrong);
    stopClicking();
    gameState.playerTries++;
    triesElement.textContent = gameState.playerTries;
    if (
      gameState.playerTries >= gameConfig.levelsObjs[gameState.currLevel].tries
    ) {
      gameOver(false);
      return;
    }
    setTimeout(() => {
      firstBlock.classList.remove("is-flipped");
      secondBlock.classList.remove("is-flipped");
    }, gameConfig.levelsObjs[gameState.currLevel].duration);
  }
}
function outerCheckInput(e) {
  innerCheckInputFunc(e.target);
}
function innerCheckInputFunc(inputField) {
  let regex =
    /^[a-zA-Z\u0621-\u064A][a-zA-Z0-9\u0621-\u064A]*( [a-zA-Z0-9\u0621-\u064A]+)*$/;
  let isItValid = regex.test(inputField.value);
  let isFound = bestScores.easy.some(
    (score) => score.name.toLowerCase() === inputField.value.toLowerCase(),
  );
  if (inputField.value === "" || !isItValid || isFound) {
    inputField.classList.add("wrong");
    inputHint.textContent =
      inputField.value === ""
        ? "Enter your name"
        : !isItValid
          ? "Enter a valid name"
          : "This name is already taken";
    inputHint.classList.add("show");
    inputField.removeEventListener("blur", outerCheckInput);
    return false;
  }
  nameBox.textContent = inputField.value;
  inputHint.textContent = "";
  inputField.classList.remove("wrong");
  inputHint.classList.remove("show");
  inputField.removeEventListener("blur", outerCheckInput);
  return true;
}
function showLevelrules() {
  levelRuleElement.textContent =
    gameConfig.levelsObjs[gameState.currLevel].rules;
  levelRuleElement.show();
  levelRuleElement.classList.add("show");
  setTimeout(() => {
    levelRuleElement.addEventListener(
      "transitionend",
      (e) => {
        e.currentTarget.close();
      },
      { once: true },
    );
    levelRuleElement.classList.remove("show");
    readyFunc();
  }, 3000);
}
function readyFunc() {
  let ready = readyWrapper.querySelector(".ready");
  readyWrapper.classList.remove("hidden");
  playSound(sounds.background);
  ready.textContent = "3";
  let readyCounter = setInterval(() => {
    ready.textContent--;
    if (ready.textContent === "0") {
      clearInterval(readyCounter);
      ready.textContent = "Start";
      setTimeout(() => {
        readyWrapper.classList.add("hidden");
        blocksContainer.classList.remove("no-clicking");
        startGame();
      }, 900);
    }
  }, 1000);
}
function startGame() {
  gameState.countDown = gameConfig.levelsObjs[gameState.currLevel].timer;
  showTimer(gameState.countDown);
  gameState.counter = setInterval(() => {
    if (gameState.countDown <= 0) {
      gameOver(true);
      return;
    }
    gameState.countDown--;
    showTimer(gameState.countDown);
  }, 1000);
}
function formatTimer(countDown) {
  let min = Math.floor(countDown / 60);
  let second = countDown % 60;
  min = min.toString().padStart(2, "0");
  second = second.toString().padStart(2, "0");
  return `${min}:${second}`;
}
function showTimer(countDown) {
  timerBox.textContent = formatTimer(countDown);
  timerBox.classList.add("show");
}
function hideTimer(isTimeOut) {
  if (isTimeOut) timerBox.classList.add("end");
  setTimeout(() => {
    timerBox.classList.remove("show");
    timerBox.classList.remove("end");
  }, 700);
}
function showWinMessage() {
  let popupBox = endLevelMessage.querySelector(".popup-box");
  let statusText = endLevelMessage.querySelector(".status-text");
  let nextBtn = endLevelMessage.querySelector(".next");
  popupBox.className = "popup-box good";
  statusText.textContent = "😍Congrats🥳";
  nextBtn.classList.remove("hidden");
  endLevelMessage.showModal();
  setTimeout(() => {
    popupBox.classList.add("show");
    if (gameState.newScore) showNewScorePopup(endLevelMessage);
  }, 100);
}
function showLoseMessage(isTimeOut) {
  let popupBox = endLevelMessage.querySelector(".popup-box");
  let statusText = endLevelMessage.querySelector(".status-text");
  let nextBtn = endLevelMessage.querySelector(".next");
  popupBox.className = "popup-box bad";
  statusText.textContent = isTimeOut ? "🫠 Time's Up! 😢" : "😅 Game Over 😜";
  nextBtn.classList.add("hidden");
  endLevelMessage.showModal();
  setTimeout(() => {
    popupBox.classList.add("show");
  }, 300);
}
function gameOver(isTimeOut) {
  stopBackground();
  playSound(sounds.lose);
  clearInterval(gameState.counter);
  hideTimer(isTimeOut);
  clearTimeout(gameState.clickingTimeout);
  blocksContainer.classList.add("no-clicking");
  setTimeout(() => {
    cards.forEach((block) => {
      block.classList.remove("has-match");
      block.classList.remove("is-flipped");
    });
    showLoseMessage(isTimeOut);
  }, 200);
}
function endlevel(isLastLevel = false) {
  stopBackground();
  saveScore();
  clearInterval(gameState.counter);
  hideTimer(false);
  clearTimeout(gameState.clickingTimeout);
  if (isLastLevel) {
    playSound(sounds.finish);
    setTimeout(() => {
      endGameMessage.showModal();
      setTimeout(() => {
        endGameMessage.querySelector(".content").classList.add("show");
        if (gameState.newScore) showNewScorePopup(endGameMessage);
      }, 200);
    }, 200);
    return;
  }
  playSound(sounds.win);
  setTimeout(() => {
    showWinMessage();
  }, 200);
}
function setupLevel(isNextLevel = false) {
  if (isNextLevel) {
    gameState.currLevel =
      gameConfig.levelsNames[
        gameConfig.levelsNames.indexOf(gameState.currLevel) + 1
      ];
  }
  gameState.playerTries = 0;
  gameState.matchedCards = 0;
  endLevelMessage.close();
  blocksContainer.innerHTML = "";
  triesElement.textContent = gameState.playerTries;
  blocksContainer.classList.add("no-clicking");
  shuffle(technologies);
  generateBlocks();
  showLevelrules();
}
function transitionToCongrats() {
  gameSection.classList.add("hidden");
  congratsSection.classList.remove("hidden");
}
function getFormattedDate() {
  let date = new Date();
  let dateFormat;
  let timeFormat;
  let hours = date.getHours();
  let min = date.getMinutes();
  let pm = false;
  hours === 0 ? (hours = 12) : hours;
  min = min.toString().padStart(2, "0");
  if (hours > 12) {
    hours -= 12;
    pm = true;
  }
  hours = hours.toString().padStart(2, "0");
  dateFormat = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  timeFormat = `${hours}:${min} ${pm ? "PM" : "AM"}`;
  return [dateFormat, timeFormat];
}
function createScoreObj() {
  let currentDate = getFormattedDate();
  let playerTimer =
    gameConfig.levelsObjs[gameState.currLevel].timer - gameState.countDown;
  let score = {
    name: nameBox.textContent,
    wrongTries: gameState.playerTries,
    rawTimer: playerTimer,
    timer: formatTimer(playerTimer),
    date: currentDate[0],
    time: currentDate[1],
  };
  return score;
}
function saveScore() {
  const scoreObj = createScoreObj();
  const scores = bestScores[gameState.currLevel];
  gameState.newScore = false;
  let improvedScore = false;
  // Existing player
  const playerIndex = scores.findIndex(
    (score) => score.name.toLowerCase() === scoreObj.name.toLowerCase(),
  );
  if (playerIndex !== -1) {
    const oldScores = scores[playerIndex];
    const isBetter =
      scoreObj.wrongTries < oldScores.wrongTries ||
      (scoreObj.wrongTries === oldScores.wrongTries &&
        scoreObj.rawTimer < oldScores.rawTimer);
    if (!isBetter) return;
    scores[playerIndex] = scoreObj;
    improvedScore = true;
  }
  // New player
  else {
    scores.push(scoreObj);
    improvedScore = true;
  }
  scores.sort((a, b) => a.wrongTries - b.wrongTries || a.rawTimer - b.rawTimer);
  scores.length = Math.min(scores.length, 10);
  try {
    localStorage.setItem("memoryGameScores", JSON.stringify(bestScores));
  } catch (error) {
    console.warn("Unable to save the results:", error);
  }
  if (
    improvedScore &&
    scores[0].name.toLowerCase() === scoreObj.name.toLowerCase()
  )
    gameState.newScore = true;
}
function showNewScorePopup(parentScorePopup) {
  parentScorePopup.append(newScorePopup);
  newScorePopup.innerHTML = `New High Score on <span style = "font-weight:bold">"${gameState.currLevel}"</span>!`;
  newScorePopup.show();
  newScorePopup.classList.add("show");
  setTimeout(() => {
    newScorePopup.classList.remove("show");
    newScorePopup.addEventListener(
      "transitionend",
      (e) => {
        if (e.propertyName === "transform") newScorePopup.close();
      },
      { once: true },
    );
  }, 3000);
}
function showScores(currLevel) {
  let isCompletelyEmpty =
    bestScores.easy.length === 0 &&
    bestScores.normal.length === 0 &&
    bestScores.hard.length === 0;
  if (isCompletelyEmpty) {
    scoresBoard.querySelector(".main-content").classList.add("hidden");
    noScoresBox.classList.remove("hidden");
    return;
  }
  levelsTabs.forEach((tab) =>
    tab.classList.toggle("active", tab.dataset.level === currLevel),
  );
  tableWrapper.classList.remove("hidden");
  noScoresBox.classList.add("hidden");
  levelsTabsBox.classList.remove("no-clicking");
  let fragment = document.createDocumentFragment();
  let currentLevelScores = bestScores[currLevel];
  currentLevelScores.forEach((score, i) => {
    let tableRow = document.createElement("tr");
    let basicData = [i + 1, score.name, score.wrongTries, score.timer];
    basicData.forEach((text) => {
      let td = document.createElement("td");
      td.textContent = text;
      tableRow.append(td);
    });
    let dateBox = document.createElement("td");
    let date = document.createElement("div");
    let time = document.createElement("div");
    date.textContent = score.date;
    time.textContent = score.time;
    time.classList.add("time");
    dateBox.append(date, time);
    if (nameBox.textContent.toLowerCase() === score.name.toLowerCase()) {
      tableRow.classList.add("current-player");
    }
    tableRow.append(dateBox);
    fragment.append(tableRow);
  });
  if (fragment.children.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td>???</td>
        <td>No Info Yet</td>
        <td>No Info Yet</td>
        <td>No Info Yet</td>
        <td>No Info Yet</td>
      </tr>`;
    return;
  }
  tableBody.innerHTML = "";
  tableBody.append(fragment);
}
function showScoresBoard() {
  gameSection.classList.add("hidden");
  levelRuleElement.close();
  gameControl.classList.add("hidden");
  scoresBoard.classList.remove("hidden");
  showScores(gameState.currLevel);
}
function setupSounds() {
  sounds.background.loop = true;
  sounds.background.volume = 0.05;
  sounds.match.volume = 0.1;
  sounds.wrong.volume = 0.1;
  sounds.win.volume = 0.3;
  sounds.lose.volume = 0.05;
  sounds.finish.volume = 0.05;
}
function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}
function stopBackground() {
  sounds.background.pause();
  sounds.background.currentTime = 0;
}
