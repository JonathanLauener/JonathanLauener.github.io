document.addEventListener("DOMContentLoaded", function () {
  const term = new Terminal({
    cursorBlink: false,
    fontFamily: "monospace",
    fontSize: 16,
    theme: {
      background: "#000000",
      foreground: "#ffffff"
    }
  });

  term.open(document.getElementById("terminal"));

  let mode = "file";       // file | netrw | command
  let currentFile = "home.md";
  let files = [];
  let cursorIndex = 0;
  let commandBuffer = "";

  // --- Fetch file list manually (for now hardcoded list)
  async function loadFileList() {
    // Since GitHub Pages can't list directories dynamically,
    // we define the index manually here.
    files = [
      "home.md",
      "projects.md",
      "contact.md",
      "projects/project1.md",
      "projects/project2.md"
    ];
  }

  async function openFile(filename) {
    try {
      const response = await fetch(filename);
      const text = await response.text();

      currentFile = filename;
      mode = "file";
      renderFile(text);
    } catch (err) {
      term.writeln("Error opening file.");
    }
  }

  function renderFile(content) {
    term.clear();
    term.writeln(`"${currentFile}"`);
    term.writeln("");

    content.split("\n").forEach(line => {
      term.writeln(line);
    });

    renderStatus("-- NORMAL --");
    term.scrollToTop();
  }

  function renderExplorer() {
    term.clear();
    term.writeln('"~/portfolio" [netrw]');
    term.writeln("");

    files.forEach((file, index) => {
      const prefix = index === cursorIndex ? "> " : "  ";
      term.writeln(prefix + file);
    });

    renderStatus("-- NORMAL --");
    term.scrollToTop();
  }

  function renderStatus(text) {
    term.writeln("");
    term.write(text);
  }

  function enterCommandMode() {
    mode = "command";
    commandBuffer = "";
    term.write("\r\n:");
  }

  function executeCommand(cmd) {
    if (cmd === "Ex") {
      mode = "netrw";
      cursorIndex = 0;
      renderExplorer();
    }

    else if (cmd === "q") {
      mode = "file";
      openFile("home.md");
    }

    else if (cmd.startsWith("e ")) {
      const filename = cmd.slice(2).trim();
      if (files.includes(filename)) {
        openFile(filename);
      } else {
        term.writeln("\r\nFile not found");
      }
    }

  }

  term.onData((key) => {
    if (mode === "file") {
      if (key === ":") {
        enterCommandMode();
      }
    }

    else if (mode === "netrw") {
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
    }

    else if (mode === "command") {
      if (key === "\r") {
        executeCommand(commandBuffer.trim());
      }

      else if (key.charCodeAt(0) === 127) {
        commandBuffer = commandBuffer.slice(0, -1);
        term.write("\b \b");
      }

      else {
        commandBuffer += key;
        term.write(key);
      }
    }
  });

  // Initialize
  loadFileList().then(() => openFile("home.md"));
});
