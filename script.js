(() => {
  "use strict";
  const X = [29,137,245,353,461,569,677,786,893,1001,1109,1217,1325,1432,1540];
  const Y = [24,132,240,347,454,562,669,777,886,992];
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
  const board = document.getElementById("board");
  const status = document.getElementById("status");
  const directionButton = document.getElementById("direction");
  const cells = new Map();
  const words = [];
  let direction = "horizontal", active = null;
  const normalize = text => String(text ?? "").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z]/g, "");
  const key = (r, c) => r + "," + c;
  function storage(action, cell) {
    try {
      const name = "mots-croises-r" + cell.dataset.r + "c" + cell.dataset.c;
      if (action === "read") return localStorage.getItem(name);
      if (cell.value) localStorage.setItem(name, cell.value);
      else localStorage.removeItem(name);
    } catch {
      document.getElementById("save-message").textContent =
        "Sauvegarde indisponible : gardez cette page ouverte pour conserver vos réponses.";
    }
    return "";
  }
  function neighbor(cell, dr, dc) {
    return cells.get(key(Number(cell.dataset.r) + dr, Number(cell.dataset.c) + dc));
  }
  function along(cell, step = 1) {
    return neighbor(cell, direction === "vertical" ? step : 0, direction === "horizontal" ? step : 0);
  }
  // Un mot n'est validé que lorsqu'il est complet et correspond exactement à la solution.
  // Cette vérification est relancée automatiquement après chaque saisie.
  function wordMatchesSolution(word) {
    return word.length > 1 && word.every(cell => {
      const answer = solution[Number(cell.dataset.r)][Number(cell.dataset.c)];
      return cell.value !== "" && cell.value === answer;
    });
  }

  function updateStatus() {
    const count = [...cells.values()].filter(cell => cell.value).length;
    const validated = new Set();
    let correctWords = 0;
    for (const word of words) {
      if (wordMatchesSolution(word)) {
        correctWords++;
        word.forEach(cell => validated.add(cell));
      }
    }
    cells.forEach(cell => cell.classList.toggle("correct", validated.has(cell)));
    const complete = words.length > 0 && correctWords === words.length;
    status.textContent = complete ? "🎉 Bravo ! La grille est entièrement correcte !" :
      count + " / " + cells.size + " cases remplies — " + correctWords + " / " + words.length + " mots validés";
  }
  function highlight() {
    cells.forEach(cell => cell.classList.remove("in-word"));
    if (!active) return;
    active.classList.add("in-word");
    for (const step of [-1, 1]) {
      let cell = along(active, step);
      while (cell) { cell.classList.add("in-word"); cell = along(cell, step); }
    }
  }
  function setDirection(value) {
    direction = value;
    directionButton.textContent = value === "horizontal" ? "Sens : horizontal →" : "Sens : vertical ↓";
    directionButton.setAttribute("aria-pressed", String(value === "vertical"));
    highlight();
  }
  function chooseDirection(cell) {
    if (!along(cell, -1) && !along(cell)) {
      const [dr, dc] = direction === "horizontal" ? [1, 0] : [0, 1];
      if (neighbor(cell, dr, dc) || neighbor(cell, -dr, -dc))
        setDirection(direction === "horizontal" ? "vertical" : "horizontal");
    }
  }
  function focus(cell) {
    if (!cell) return;
    cell.focus();
    cell.select();
  }
  function write(cell, letter) {
    cell.value = letter;
    cell.dataset.savedValue = letter;
    cell.classList.remove("correct", "wrong");
    cell.removeAttribute("aria-invalid");
    storage("write", cell);
    updateStatus();
  }
  function enter(cell, text) {
    const letters = normalize(text);
    if (!letters) return;
    let target = cell;
    for (let i = 0; i < letters.length; i++) {
      write(target, letters[i]);
      const next = along(target);
      if (!next) { focus(target); return; }
      if (i === letters.length - 1) { focus(next); return; }
      target = next;
    }
  }
  function erase(cell, backward) {
    if (cell.value) { write(cell, ""); return; }
    if (backward) {
      const previous = along(cell, -1);
      if (previous) { write(previous, ""); focus(previous); }
    }
  }
  for (let r = 0; r < solution.length; r++) {
    for (let c = 0; c < solution[r].length; c++) {
      if (solution[r][c] === null) continue;
      const cell = document.createElement("input");
      let composing = false, completedComposition = null;
      cell.type = "text";
      cell.className = "cell";
      // No maxlength: beforeinput replaces a filled cell even with mobile keyboards.
      cell.autocomplete = "off";
      cell.spellcheck = false;
      cell.setAttribute("autocapitalize", "characters");
      cell.setAttribute("autocorrect", "off");
      cell.setAttribute("inputmode", "text");
      cell.setAttribute("aria-label", "Ligne " + (r + 1) + ", colonne " + (c + 1));
      cell.dataset.r = r; cell.dataset.c = c;
      // Measured image coordinates; insets exclude grid lines from hit targets.
      cell.style.left = ((X[c] + 1) / 1555 * 100) + "%";
      cell.style.top = ((Y[r] + 1) / 1012 * 100) + "%";
      cell.style.width = ((X[c + 1] - X[c] - 2) / 1555 * 100) + "%";
      cell.style.height = ((Y[r + 1] - Y[r] - 2) / 1012 * 100) + "%";
      cell.value = normalize(storage("read", cell)).slice(0, 1);
      cell.dataset.savedValue = cell.value;
      cells.set(key(r, c), cell);
      cell.addEventListener("focus", () => {
        active = cell;
        cell.select();
        chooseDirection(cell);
        highlight();
      });
      cell.addEventListener("click", () => {
        chooseDirection(cell);
        cell.select();
      });
      cell.addEventListener("keydown", event => {
        if (event.isComposing || composing || event.keyCode === 229) return;
        completedComposition = null;
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        const moves = {ArrowRight: [0,1], ArrowLeft: [0,-1], ArrowDown: [1,0], ArrowUp: [-1,0]};
        if (moves[event.key]) {
          event.preventDefault();
          const [dr, dc] = moves[event.key];
          setDirection(dr ? "vertical" : "horizontal");
          focus(neighbor(cell, dr, dc));
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setDirection(direction === "horizontal" ? "vertical" : "horizontal");
        } else if (event.key === "Backspace" || event.key === "Delete") {
          event.preventDefault();
          erase(cell, event.key === "Backspace");
        }
        // Tab, Shift+Tab and browser shortcuts retain their native behavior.
      });
      cell.addEventListener("beforeinput", event => {
        if (event.isComposing || composing || !event.cancelable) return;
        if (event.inputType === "deleteContentBackward" || event.inputType === "deleteContentForward") {
          event.preventDefault();
          erase(cell, event.inputType === "deleteContentBackward");
        } else if (event.inputType?.startsWith("insert") && typeof event.data === "string") {
          event.preventDefault();
          if (completedComposition !== null && normalize(event.data) === completedComposition) {
            completedComposition = null;
            return;
          }
          enter(cell, event.data);
        }
      });
      cell.addEventListener("input", event => {
        if (event.isComposing || composing) return;
        // Some mobile keyboards send non-cancelable beforeinput events.
        // Deletion must never be interpreted as a new letter or move forward.
        if (event.inputType?.startsWith("delete")) {
          const previousValue = cell.dataset.savedValue;
          write(cell, "");
          if (!previousValue && event.inputType === "deleteContentBackward") erase(cell, true);
          return;
        }
        const letters = normalize(event.data ?? cell.value);
        if (completedComposition !== null && letters === completedComposition) {
          completedComposition = null;
          write(cell, letters.slice(-1));
          return;
        }
        if (letters) enter(cell, letters);
        else cell.value = cell.dataset.savedValue;
      });
      cell.addEventListener("compositionstart", () => { composing = true; completedComposition = null; });
      cell.addEventListener("compositionend", event => {
        composing = false;
        // The committed text may differ from the input's entire value.
        completedComposition = normalize(event.data ?? cell.value).slice(-1);
        if (!completedComposition) {
          cell.value = cell.dataset.savedValue;
          completedComposition = null;
          return;
        }
        write(cell, completedComposition);
        const committedValue = completedComposition;
        const next = along(cell);
        // Wait for the final input event, without stealing a later selection.
        setTimeout(() => {
          if (document.activeElement === cell && cell.value === committedValue) focus(next);
          completedComposition = null;
        }, 0);
      });
      cell.addEventListener("paste", event => {
        if (!event.clipboardData) return;
        event.preventDefault();
        enter(cell, event.clipboardData.getData("text"));
      });
      board.appendChild(cell);
    }
  }
  directionButton.addEventListener("click", () => {
    setDirection(direction === "horizontal" ? "vertical" : "horizontal");
    if (active) focus(active);
  });
  // Validate complete horizontal and vertical words, never individual letters.
  for (const [dr, dc] of [[0, 1], [1, 0]]) {
    cells.forEach(cell => {
      if (neighbor(cell, -dr, -dc)) return;
      const word = [];
      for (let next = cell; next; next = neighbor(next, dr, dc)) word.push(next);
      if (word.length > 1) words.push(word);
    });
  }
  document.getElementById("check")?.remove();
  document.getElementById("help").textContent =
    "Touchez une case pour écrire. Chaque mot complet devient vert lorsqu’il correspond à la solution. " +
    "Changez de sens avec le bouton ou la touche Entrée. Les flèches déplacent la sélection ; la saisie s’arrête à la fin du mot.";
  document.getElementById("clear").addEventListener("click", () => {
    if (!confirm("Effacer toutes les réponses ?")) return;
    cells.forEach(cell => write(cell, ""));
    if (active) focus(active);
  });
  document.getElementById("print").addEventListener("click", () => window.print());
  updateStatus();
})();
