document.addEventListener("DOMContentLoaded", function () {
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

  term.open(document.getElementById("terminal"));

  // --- Viewport settings ---
  const screenHeight = 24; // number of visible lines
  let fileBuffer = [];     // all lines of current file/explorer
  let topLineIndex = 0;    // first visible line in viewport
  let cursorIndex = 0;     // selected line in viewport
  let mode = "file";       // file | netrw | command
  let commandBuffer = "";
  let currentFile = "home.md";

  // --- Hardcoded file list ---
  let files = [
    "home.md",
    "projects.md",
    "contact.md",
    "projects/project1.md",
    "projects/project2.md"
  ];

  // --- Helpers for TokyoNight colors ---
  function writeColor(text, hex) {
    const rgb = hexToRgb(hex);
    term.write(`\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m${text}\x1b[0m`);
  }

  function writeLineHighlight(text) {
    term.writeln(`\x1b[48;2;51;70;124m\x1b[38;2;192;202;245m${text}\x1b[0m`);
  }

  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  }

  // --- Render viewport ---
  function renderViewport() {
    term.clear();
    const visibleLines = fileBuffer.slice(topLineIndex, topLineIndex + screenHeight);
    visibleLines.forEach((line, i) => {
      const globalIndex = topLineIndex + i;
      if (mode === "netrw" && globalIndex === cursorIndex) {
        writeLineHighlight(line);
      } else {
        term.writeln(line);
      }
    });
    renderStatus("-- NORMAL --");
  }

  function renderStatus(text) {
    term.writeln("");
    term.write(text);
  }

  // --- Load a file ---
  async function openFile(filename) {
    try {
      const response = await fetch(filename);
      const text = await response.text();
      currentFile = filename;
      mode = "file";
      fileBuffer = text.split("\n");
      topLineIndex = 0;
      renderViewport();
    } catch (err) {
      fileBuffer = [`Error opening file: ${filename}`];
      topLineIndex = 0;
      renderViewport();
    }
  }

  // --- Load netrw explorer ---
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

  // --- Command mode ---
  function enterCommandMode() {
    mode = "command";
    commandBuffer = "";
    term.write("\r\n:");
  }

  function executeCommand(cmd) {
    if (cmd === "Ex") {
      openExplorer();
      return;
    }
    if (cmd === "q") {
      openFile("home.md");
      return;
    }
    if (cmd.startsWith("e ")) {
      const filename = cmd.slice(2).trim();
      if (files.includes(filename)) openFile(filename);
      else {
        fileBuffer = [`File not found: ${filename}`];
        topLineIndex = 0;
        renderViewport();
      }
      return;
    }
  }

  // --- Scroll functions for j/k ---
  function moveDown() {
    if (mode === "netrw") {
      if (cursorIndex < fileBuffer.length - 1) cursorIndex++;
      // Scroll viewport if cursor goes past bottom
      if (cursorIndex >= topLineIndex + screenHeight) topLineIndex++;
      renderViewport();
    } else if (mode === "file") {
      if (topLineIndex + screenHeight < fileBuffer.length) topLineIndex++;
      renderViewport();
    }
  }

  function moveUp() {
    if (mode === "netrw") {
      if (cursorIndex > 4) cursorIndex--; // first 4 lines are header
      if (cursorIndex < topLineIndex) topLineIndex--;
      renderViewport();
    } else if (mode === "file") {
      if (topLineIndex > 0) topLineIndex--;
      renderViewport();
    }
  }

  // --- Keyboard handling ---
  term.onData((key) => {
    if (mode === "file") {
      if (key === ":") enterCommandMode();
      if (key === "j") moveDown();
      if (key === "k") moveUp();
    } else if (mode === "netrw") {
      if (key === "j") moveDown();
      if (key === "k") moveUp();
      if (key === "\r") {
        const filename = fileBuffer[cursorIndex];
        if (files.includes(filename)) openFile(filename);
      }
      if (key === ":") enterCommandMode();
    } else if (mode === "command") {
      if (key === "\r") executeCommand(commandBuffer.trim());
      else if (key.charCodeAt(0) === 127) { // backspace
        commandBuffer = commandBuffer.slice(0, -1);
        term.write("\b \b");
      } else {
        commandBuffer += key;
        term.write(key);
      }
    }
  });

  // --- Initialize ---
  openFile("home.md");
});
