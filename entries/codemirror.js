import { EditorView, highlightActiveLineGutter, lineNumbers, highlightSpecialChars, drawSelection, highlightActiveLine, keymap } from '@codemirror/view';
import { highlightSelectionMatches } from '@codemirror/search';
import { foldGutter, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap } from '@codemirror/language';
import { history, defaultKeymap, historyKeymap, indentWithTab } from '@codemirror/commands';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { polygolf } from 'codemirror-lang-polygolf';

export function initEditor(parent, initialValue, onChange) {
  return new EditorView({
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
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        indentWithTab,
      ]),
      EditorView.lineWrapping,
      EditorView.theme({
        "&.cm-editor.cm-focused": { outline: "none" }
      }, { dark: false }),
      EditorView.updateListener.of((v) => {
        if (v.docChanged) {
          onChange(v.state.doc.toString());
        }
      }),
    ],
    parent
  });
}
