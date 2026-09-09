const ROWS = 9;
const COLS = 14;

const board = document.getElementById("board");
const status = document.getElementById("status");

let direction = "horizontal";

/* Positions de la grille */
const X = [
  28, 135, 244, 353, 461, 567, 675,
  786, 893, 1001, 1107, 1216, 1323, 1432, 1538
];

const Y = [
  22, 132, 240, 347, 454,
  561, 667, 774, 885, 990
];

/* Cases contenant les indices */
const blocked = new Set([
  "0,0", "0,2", "0,4", "0,6", "0,8", "0,10", "0,12",
  "1,10",
  "2,0", "2,7",
  "3,6", "3,13",
  "4,0", "4,8", "4,12",
  "5,4", "5,11",
  "6,0", "6,1", "6,9",
  "7,5", "7,11",
  "8,0", "8,7"
]);

/* Solution */
const solution = [
  [null,"S",null,"P",null,"E",null,"K",null,"B",null,"G",null,"G"],
  ["D","E","T","R","A","C","T","E","U","R",null,"R","A","I"],
  [null,"C","R","O","I","R","E",null,"R","I","R","A","I","S"],
  ["C","H","A","N","G","E",null,"B","E","S","A","C","E",null],
  [null,"E","C","O","U","T","A","I",null,"E","S","E",null,"C"],
  ["A","R","T","S",null,"E","I","D","E","R","S",null,"T","A"],
  [null,null,"E","T","E","R","N","E","L",null,"I","R","A","N"],
  ["C","A","R","I","S",null,"E","T","U","V","E",null,"P","O"],
  [null,"C","A","C","T","U","S",null,"S","E","D","U","I","T"]
];

/* Création des cases */
for (let row = 0; row < ROWS; row++) {

  for (let col = 0; col < COLS; col++) {

    if (blocked.has(`${row},${col}`)) {
      continue;
    }

    const input = document.createElement("input");

    input.type = "text";
    input.className = "cell";

    input.maxLength = 1;
    input.autocomplete = "off";
    input.spellcheck = false;

    input.dataset.r = row;
    input.dataset.c = col;

    input.style.left = `${X[col] / 1555 * 100}%`;
    input.style.top = `${Y[row] / 1012 * 100}%`;

    input.style.width =
      `${(X[col + 1] - X[col]) / 1555 * 100}%`;

    input.style.height =
      `${(Y[row + 1] - Y[row]) / 1012 * 100}%`;

    input.value =
      localStorage.getItem(storageKey(row, col)) || "";

    /* Écriture */
    input.addEventListener("input", function () {

      this.value = this.value
        .replace(/[^a-zA-ZÀ-ÿ]/g, "")
        .slice(-1)
        .toUpperCase();

      localStorage.setItem(
        storageKey(row, col),
        this.value
      );

      this.classList.remove("correct", "wrong");

      updateStatus();

      if (this.value !== "") {
        goNext(row, col);
      }
    });

    /* Double-clic : changer de direction */
    input.addEventListener("dblclick", function(event) {

      event.preventDefault();

      if (direction === "horizontal") {
        direction = "vertical";
      } else {
        direction = "horizontal";
      }

      this.focus();
    });

    /* Navigation clavier */
    input.addEventListener("keydown", function(event) {

      if (event.key === "ArrowRight") {
        event.preventDefault();
        direction = "horizontal";
        focusCell(row, col + 1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        direction = "horizontal";
        focusCell(row, col - 1);
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        direction = "vertical";
        focusCell(row + 1, col);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        direction = "vertical";
        focusCell(row - 1, col);
      }

      if (event.key === "Backspace" && this.value === "") {
        goPrevious(row, col);
      }
    });

    board.appendChild(input);
  }
}

/* Clé de sauvegarde */
function storageKey(row, col) {
  return `mots-croises-r${row}c${col}`;
}

/* Sélectionner une case */
function focusCell(row, col) {

  if (
    row < 0 ||
    row >= ROWS ||
    col < 0 ||
    col >= COLS
  ) {
    return;
  }

  if (blocked.has(`${row},${col}`)) {
    return;
  }

  const cell = document.querySelector(
    `[data-r="${row}"][data-c="${col}"]`
  );

  if (cell) {
    cell.focus();
  }
}

/* Case suivante */
function goNext(row, col) {

  if (direction === "vertical") {

    for (let r = row + 1; r < ROWS; r++) {

      if (!blocked.has(`${r},${col}`)) {
        focusCell(r, col);
        return;
      }
    }

  } else {

    for (let c = col + 1; c < COLS; c++) {

      if (!blocked.has(`${row},${c}`)) {
        focusCell(row, c);
        return;
      }
    }
  }
}

/* Case précédente */
function goPrevious(row, col) {

  if (direction === "vertical") {

    for (let r = row - 1; r >= 0; r--) {

      if (!blocked.has(`${r},${col}`)) {
        focusCell(r, col);
        return;
      }
    }

  } else {

    for (let c = col - 1; c >= 0; c--) {

      if (!blocked.has(`${row},${c}`)) {
        focusCell(row, c);
        return;
      }
    }
  }
}

/* Compteur */
function updateStatus() {

  const cells = document.querySelectorAll(".cell");

  const filled = [...cells].filter(
    cell => cell.value !== ""
  ).length;

  status.textContent =
    `${filled} case${filled > 1 ? "s" : ""} remplie${filled > 1 ? "s" : ""}`;
}

/* Vérification */
function check() {

  let correct = 0;
  let total = 0;

  document.querySelectorAll(".cell").forEach(cell => {

    const row = Number(cell.dataset.r);
    const col = Number(cell.dataset.c);

    const expected = solution[row][col];

    if (!expected) {
      return;
    }

    total++;

    cell.classList.remove("correct", "wrong");

    if (cell.value === expected) {

      cell.classList.add("correct");
      correct++;

    } else if (cell.value !== "") {

      cell.classList.add("wrong");
    }
  });

  if (correct === total) {

    alert(
      "🎉 BRAVO !\n\n" +
      "La grille est entièrement correcte !"
    );

  } else {

    alert(
      `Résultat : ${correct} bonne(s) réponse(s) sur ${total}.\n\n` +
      "🟩 Les cases vertes sont correctes.\n" +
      "🟥 Les cases rouges sont à corriger."
    );
  }
}

/* Effacer */
function clearGrid() {

  if (!confirm("Effacer toutes les réponses ?")) {
    return;
  }

  document.querySelectorAll(".cell").forEach(cell => {

    cell.value = "";

    cell.classList.remove("correct", "wrong");

    localStorage.removeItem(
      storageKey(
        cell.dataset.r,
        cell.dataset.c
      )
    );
  });

  updateStatus();
}

updateStatus();
