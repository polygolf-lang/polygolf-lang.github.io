import { EditorView, highlightActiveLineGutter, lineNumbers, highlightSpecialChars, drawSelection, highlightActiveLine, keymap } from '@codemirror/view';
import { highlightSelectionMatches } from '@codemirror/search';
import { foldGutter, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap } from '@codemirror/language';
import { history, defaultKeymap, historyKeymap, indentWithTab } from '@codemirror/commands';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { Compartment } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { polygolf } from 'codemirror-lang-polygolf';

function getThemeExtension(theme) {
  return theme === 'light' ? [] : oneDark;
}

export function initEditor(parent, initialValue, theme, onChange) {
  const themeConfig = new Compartment();
  const editor = new EditorView({
    doc: initialValue,
    extensions: [
      lineNumbers(),
      highlightSpecialChars(),
      history(),
      foldGutter({
        openText: '▾',
        closedText: '▸',
      }),
      drawSelection(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      polygolf(),
      autocompletion(),
      bracketMatching(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      highlightSelectionMatches(),
      keymap.of([
        ...defaultKeymap.filter(x => x.key !== "Mod-Enter"),
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        indentWithTab,
      ]),
      EditorView.lineWrapping,
      EditorView.theme({
        "&.cm-editor.cm-focused": { outline: "none" }
      }),
      EditorView.updateListener.of((v) => {
        if (v.docChanged) {
          onChange(v.state.doc.toString());
        }
      }),
      themeConfig.of(getThemeExtension(theme)),
    ],
    parent
  });
  editor.setTheme = (theme) => {
    editor.dispatch({
      effects: themeConfig.reconfigure(getThemeExtension(theme))
    });
  };
  return editor;
}
