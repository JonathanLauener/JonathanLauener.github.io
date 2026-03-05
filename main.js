import { Terminal } from '@xterm/xterm';

const term = new Terminal();

term.open(document.getElementById('xterm-container'));

const files = {
  "about.md": `
# About Me
I am a developer...
`,
  "projects.md": `
# Projects
- Project 1
- Project 2
`,
  "contact.md": `
# Contact
email@example.com
`
};

const view = new EditorView({
  state: EditorState.create({
    doc: files["about.md"],
    extensions: [basicSetup, vim()]
  }),
  parent: document.getElementById("terminal")
});
