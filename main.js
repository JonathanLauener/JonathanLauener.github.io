document.addEventListener("DOMContentLoaded", function () {
  const term = new Terminal({
    cursorBlink: true,
    fontFamily: "JetBrains Mono, monospace",
    fontSize: 15,
    scrollback: 0,
    theme: {
      background: "#1a1b26",
      foreground: "#c0caf5",
      cursor: "#c0caf5",
      selectionBackground: "#33467C"
    }
  });

  term.open(document.getElementById("terminal"));

  let mode = "file";       // file | netrw | command
  let currentFile = "home.md";
  let files = [];
  let cursorIndex = 0;
  let commandBuffer = "";

  // --- Hardcoded file list (for GitHub Pages)
  async function loadFileList() {
    files = [
      "home.md",
      "projects.md",
      "contact.md",
      "projects/project1.md",
      "projects/project2.md"
    ];
  }

  // --- Open a markdown file
  async function openFile(filename) {
    try {
      const response = await fetch(filename);
      const text = await response.text();

      currentFile = filename;
      mode = "file";
      renderFile(text);
    } catch (err) {
      term.clear();
      term.writeln(`Error opening file: ${filename}`);
    }
  }

  // --- Color helpers for TokyoNight
  function writeColor(text, hex) {
    const rgb = hexToRgb(hex);
    term.write(`\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m${text}\x1b[0m`);
  }

  function writeLineHighlight(text) {
    // Reverse highlight for selected line
    term.writeln(`\x1b[48;2;51;70;124m\x1b[38;2;192;202;245m  ${text}\x1b[0m`);
  }

  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  // --- Render file content
  function renderFile(content) {
    term.clear();
    term.scrollToTop();
    term.writeln(`"${currentFile}"`);
    term.writeln("");

    content.split("\n").forEach(line => {
      term.writeln(line);
    });

    renderStatus("-- NORMAL --");
  }

  // --- Render netrw-style explorer
  function renderExplorer() {
    term.clear();
    term.scrollToTop();

    // Header
    writeColor(`"~/portfolio"`, "#7aa2f7"); // Blue
    term.writeln(" [netrw v1.0]");
    term.writeln("");
    writeColor("  Sorted by      name", "#565f89"); // Comment color
    term.writeln("");
    writeColor("  Quick Help: j/k:move  <Enter>:open  :q:quit", "#565f89");
    term.writeln("");
    term.writeln("");

    // File list
    files.forEach((file, index) => {
      if (index === cursorIndex) {
        writeLineHighlight(file);
      } else {
        term.writeln("  " + file);
      }
    });

    renderStatus("-- NORMAL --");
  }

  // --- Status bar at bottom
  function renderStatus(text) {
    term.writeln("");
    term.write(text);
  }

  // --- Enter command mode (:)
  function enterCommandMode() {
    mode = "command";
    commandBuffer = "";
    term.write("\r\n:");
  }

  // --- Execute colon commands
  function executeCommand(cmd) {
    if (cmd === "Ex") {
      mode = "netrw";
      cursorIndex = 0;
      renderExplorer();
      return;
    }

    if (cmd === "q") {
      openFile("home.md");
      return;
    }

    if (cmd.startsWith("e ")) {
      const filename = cmd.slice(2).trim();
      if (files.includes(filename)) {
        openFile(filename);
      } else {
        term.writeln("\r\nFile not found");
      }
      return;
    }
  }

  // --- Keyboard handling
  term.onData((key) => {
    if (mode === "file") {
      if (key === ":") {
        enterCommandMode();
      }
    } else if (mode === "netrw") {
      if (key === "j" && cursorIndex < files.length - 1) {
        cursorIndex++;
        renderExplorer();
      }

      if (key === "k" && cursorIndex > 0) {
        cursorIndex--;
        renderExplorer();
      }

      if (key === "\r") {
        openFile(files[cursorIndex]);
      }

      if (key === ":") {
        enterCommandMode();
      }
    } else if (mode === "command") {
      if (key === "\r") {
        executeCommand(commandBuffer.trim());
      } else if (key.charCodeAt(0) === 127) {
        commandBuffer = commandBuffer.slice(0, -1);
        term.write("\b \b");
      } else {
        commandBuffer += key;
        term.write(key);
      }
    }
  });

  // --- Initialize
  loadFileList().then(() => openFile("home.md"));
});
