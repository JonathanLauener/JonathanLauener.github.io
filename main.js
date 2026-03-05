
const term = new Terminal({
  cursorBlink: true,
  fontFamily: "monospace",
  fontSize: 16,
  theme: {
    background: "#000000",
    foreground: "#00ff00"
  }
});

term.open(document.getElementById("terminal"));

term.write("Welcome to my portfolio terminal\r\n");
term.write("Type 'help' to begin.\r\n\r\n");

prompt();

let currentLine = "";

function prompt() {
  term.write("\r\n$ ");
}

term.onData((key) => {
  const charCode = key.charCodeAt(0);

  // Enter
  if (charCode === 13) {
    handleCommand(currentLine.trim());
    currentLine = "";
    prompt();
  }

  // Backspace
  else if (charCode === 127) {
    if (currentLine.length > 0) {
      currentLine = currentLine.slice(0, -1);
      term.write("\b \b");
    }
  }

  // Regular character
  else {
    currentLine += key;
    term.write(key);
  }
});

function handleCommand(command) {
  switch (command) {
    case "help":
      term.write("\r\nAvailable commands:");
      term.write("\r\nls - list files");
      term.write("\r\ncat <file> - open file");
      term.write("\r\nclear - clear screen");
      break;

    case "ls":
      term.write("\r\nabout.txt");
      term.write("\r\nprojects.txt");
      term.write("\r\ncontact.txt");
      break;

    case "clear":
      term.clear();
      break;

    default:
      if (command.startsWith("cat ")) {
        const file = command.split(" ")[1];
        openFile(file);
      } else if (command !== "") {
        term.write(`\r\nCommand not found: ${command}`);
      }
  }
}

function openFile(file) {
  const files = {
    "about.txt": "Hi, I'm a developer...",
    "projects.txt": "Project 1\nProject 2",
    "contact.txt": "email@example.com"
  };

  if (files[file]) {
    term.write(`\r\n${files[file]}`);
  } else {
    term.write(`\r\nFile not found: ${file}`);
  }
}
