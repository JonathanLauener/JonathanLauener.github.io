document.addEventListener("DOMContentLoaded", function () {
  // --- Terminal Setup ---
  const term = new Terminal({
    cursorBlink: true,
    fontFamily: "JetBrains Mono, monospace",
    fontSize: 15,
    convertEol: true,
    scrollback: 0,
    theme: {
      background: "#1a1b26",
      foreground: "#c0caf5",
      cursor: "#c0caf5",
      selectionBackground: "#33467C"
    }
  });

  const terminalContainer = document.getElementById("terminal");
  term.open(terminalContainer);

  // --- Responsive viewport ---
  let screenHeight = Math.floor(window.innerHeight / 20); // Approx lines
  window.addEventListener("resize", () => {
    screenHeight = Math.floor(window.innerHeight / 20);
    renderViewport();
  });

  // --- State ---
  let fileBuffer = [];        // all lines of current file/explorer
  let topLineIndex = 0;       // first visible line in viewport
  let cursorIndex = 0;        // selected line in viewport
  let mode = "file";          // "file" | "netrw" | "command"
  let commandBuffer = "";
  let currentFile = "home.md";

  // --- Files ---
  const files = [
    "home.md",
    "projects.md",
    "contact.md",
    "projects/project1.md",
    "projects/project2.md"
  ];

  // --- Helpers ---
  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  }

  function writeLineHighlight(text) {
    term.writeln(`\x1b[48;2;51;70;124m\x1b[38;2;192;202;245m${text}\x1b[0m`);
  }

  function renderStatus(text) {
    term.write(`\r\n${text}`);
  }

  // --- Render viewport ---
  function renderViewport() {
    term.clear();
    const visibleLines = fileBuffer.slice(topLineIndex, topLineIndex + screenHeight);

    visibleLines.forEach((line, i) => {
      const globalIndex = topLineIndex + i;
      if ((mode === "netrw" || mode === "file") && globalIndex === cursorIndex) {
        writeLineHighlight(line);
      } else {
        term.writeln(line);
      }
    });

    if (mode === "file") renderStatus(`-- NORMAL -- | ${currentFile}`);
    else if (mode === "netrw") renderStatus("-- Netrw --");
    else if (mode === "command") renderStatus(`:${commandBuffer}`);
  }

  // --- File Operations ---
  async function openFile(filename) {
    try {
      const res = await fetch(filename);
      const text = await res.text();
      currentFile = filename;
      mode = "file";
      fileBuffer = text.split("\n");
      topLineIndex = 0;
      cursorIndex = 0;
      renderViewport();
    } catch (err) {
      fileBuffer = [`Error opening file: ${filename}`];
      topLineIndex = 0;
      cursorIndex = 0;
      renderViewport();
    }
  }

  function openExplorer() {
    mode = "netrw";
    topLineIndex = 0;
    cursorIndex = 4; // first file line selected
    fileBuffer = [
      `"~/portfolio" [netrw v1.0]`,
      "  Sorted by      name",
      "  Quick Help: j/k:move <Enter>:open :q:quit",
      "",
      ...files
    ];
    renderViewport();
  }

  function enterCommandMode() {
    mode = "command";
    commandBuffer = "";
    renderViewport();
    term.write("\r\n:");
  }

  function executeCommand(cmd) {
    cmd = cmd.trim();
    if (cmd === "Ex") openExplorer();
    else if (cmd === "q") openFile("home.md");
    else if (cmd.startsWith("e ")) {
      const fname = cmd.slice(2).trim();
      if (files.includes(fname)) openFile(fname);
      else {
        fileBuffer = [`File not found: ${fname}`];
        topLineIndex = 0;
        cursorIndex = 0;
        renderViewport();
      }
    }
  }

  // --- Movement ---
  function moveDown() {
    if (mode === "netrw") {
      if (cursorIndex < fileBuffer.length - 1) cursorIndex++;
      if (cursorIndex >= topLineIndex + screenHeight) topLineIndex++;
    } else if (mode === "file") {
      if (cursorIndex < fileBuffer.length - 1) cursorIndex++;
      if (cursorIndex >= topLineIndex + screenHeight) topLineIndex++;
    }
    renderViewport();
  }

  function moveUp() {
    if (mode === "netrw") {
      if (cursorIndex > 4) cursorIndex--;
      if (cursorIndex < topLineIndex) topLineIndex--;
    } else if (mode === "file") {
      if (cursorIndex > 0) cursorIndex--;
      if (cursorIndex < topLineIndex) topLineIndex--;
    }
    renderViewport();
  }

  // --- Keyboard ---
  term.onData((key) => {
    if (mode === "file" || mode === "netrw") {
      if (key === "j") moveDown();
      else if (key === "k") moveUp();
      else if (key === "h") {} // placeholder for future left movement
      else if (key === "l") {} // placeholder for future right movement
      else if (key === ":") enterCommandMode();
      else if (key === "\r" && mode === "netrw") {
        const fname = fileBuffer[cursorIndex];
        if (files.includes(fname)) openFile(fname);
      }
    } else if (mode === "command") {
      if (key === "\r") executeCommand(commandBuffer);
      else if (key.charCodeAt(0) === 127) { // backspace
        commandBuffer = commandBuffer.slice(0, -1);
        renderViewport();
        term.write(`\b \b`);
      } else {
        commandBuffer += key;
        term.write(key);
      }
    }
  });

  // --- Initialize ---
  openFile("home.md");
});
