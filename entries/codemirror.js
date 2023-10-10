import { EditorView, lineNumbers, highlightSpecialChars, drawSelection, highlightActiveLine, keymap } from '@codemirror/view';
import { highlightSelectionMatches } from '@codemirror/search';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { history, defaultKeymap, historyKeymap, indentLess, insertTab } from '@codemirror/commands';

export function initEditor(parent, initialValue, onChange) {
  return new EditorView({
    doc: initialValue,
    extensions: [
      lineNumbers(),
      highlightSpecialChars(),
      history(),
      drawSelection(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        { key: 'Tab', run: insertTab, shift: indentLess },
      ]),
      EditorView.lineWrapping,
      EditorView.updateListener.of((v) => {
        if (v.docChanged) {
          onChange(v.state.doc.toString());
        }
      })
    ],
    parent
  });
}
