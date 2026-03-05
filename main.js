import { EditorView, basicSetup } from "https://esm.sh/@codemirror/basic-setup";
import { EditorState } from "https://esm.sh/@codemirror/state";
import { vim } from "https://esm.sh/@replit/codemirror-vim";

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
