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

  const files = [
    "../",
    "about.md",
    "projects.md",
    "contact.md"
  ];

  const fileContents = {
    "about.md": "Hi, I'm a developer.\nWelcome to my portfolio.",
    "projects.md": "Project 1\nProject 2\nProject 3",
    "contact.md": "email@example.com"
  };

  let mode = "netrw";
  let cursorIndex = 0;

  function renderExplorer() {
    term.clear();
    term.writeln('"~/portfolio" [netrw]');
    term.writeln("");

    files.forEach((file, index) => {
      if (index === cursorIndex) {
        term.writeln("> " + file);
      } else {
        term.writeln("  " + file);
      }
    });

    term.writeln("");
    term.write("-- NORMAL --");
  }

  function renderFile(filename) {
    term.clear();
    term.writeln(`"${filename}"`);
    term.writeln("");

    const lines = fileContents[filename].split("\n");
    lines.forEach(line => term.writeln(line));

    term.writeln("");
    term.write("-- NORMAL -- (press q to go back)");
  }

  renderExplorer();

  term.onData((key) => {
    if (mode === "netrw") {
      handleExplorerKeys(key);
    } else if (mode === "file") {
      handleFileKeys(key);
    }
  });

  function handleExplorerKeys(key) {
    if (key === "j") {
      if (cursorIndex < files.length - 1) {
        cursorIndex++;
        renderExplorer();
      }
    }

    if (key === "k") {
      if (cursorIndex > 0) {
        cursorIndex--;
        renderExplorer();
      }
    }

    if (key === "\r") { // Enter
      const selected = files[cursorIndex];

      if (selected === "../") return;

      mode = "file";
      renderFile(selected);
    }
  }

  function handleFileKeys(key) {
    if (key === "q") {
      mode = "netrw";
      renderExplorer();
    }
  }
});
