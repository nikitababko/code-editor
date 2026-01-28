import * as babel from 'prettier/plugins/babel';
import estree from 'prettier/plugins/estree';
import * as typescript from 'prettier/plugins/typescript';
import prettier from 'prettier/standalone';
import type React from 'react';
import {
  DEFAULT_LANGUAGE_ID,
  LANGUAGES,
  LOCAL_STORAGE_CODE,
  LOCAL_STORAGE_DEFAULT_LANGUAGE_ID,
} from '../constants.ts';
import type { EditorInstanceType, LanguageType, MonacoType } from '../types.ts';

export const restoreLanguageLSFromStorage = (
  setSelectedLanguage: React.Dispatch<React.SetStateAction<LanguageType>>,
) => {
  const defaultLanguageId =
    localStorage.getItem(LOCAL_STORAGE_DEFAULT_LANGUAGE_ID) || DEFAULT_LANGUAGE_ID;

  const foundLanguage = LANGUAGES.find((lang) => {
    return lang.id === defaultLanguageId;
  });

  if (foundLanguage) {
    setSelectedLanguage?.(foundLanguage);
  }
};

export const restoreCodeFromStorage = (editor: EditorInstanceType) => {
  if (!editor) return;

  const code = localStorage.getItem(LOCAL_STORAGE_CODE);

  if (code) {
    editor?.setValue(code);
  }
};

export const applyEditorOptions = (editor: EditorInstanceType) => {
  if (!editor) return;

  editor.updateOptions({
    formatOnPaste: true,
    formatOnType: true,
  });
};

export const formatDocumentNow = async (editor: EditorInstanceType) => {
  if (!editor) return;
  const model = editor.getModel();
  if (!model) return;

  const languageId = model.getLanguageId();
  const code = editor.getValue() ?? '';

  // Save the current cursor position and vertical scroll
  const position = editor.getPosition() ?? model.getPositionAt(0);
  const cursorOffset = model.getOffsetAt(position);
  const prevScrollTop = editor.getScrollTop();

  // Format code with Prettier while keeping track of the cursor position
  const { formatted, cursorOffset: nextCursorOffset } = await prettier.formatWithCursor(
    code,
    {
      parser:
        languageId === 'typescript' || languageId === 'typescriptreact'
          ? 'typescript'
          : 'babel',
      plugins: [babel, estree, typescript],
      semi: true,
      singleQuote: true,
      trailingComma: 'all',
      cursorOffset,
    },
  );

  // If nothing changed, skip editing to prevent flicker
  if (formatted === code) return;

  const fullRange = model.getFullModelRange();

  // Start an undo stop, apply edits, then stop again
  editor.pushUndoStop();
  editor.executeEdits('prettier-format', [{ range: fullRange, text: formatted }]);
  editor.pushUndoStop();

  // Compute the new cursor position based on returned offset
  const nextPos = model.getPositionAt(
    Math.max(0, Math.min(formatted.length, nextCursorOffset)),
  );

  // Restore the cursor without forcing viewport jumps
  editor.setPosition(nextPos);
  editor.revealPositionInCenterIfOutsideViewport(nextPos);

  // Restore scroll only if it changed
  const afterScrollTop = editor.getScrollTop();
  if (afterScrollTop !== prevScrollTop) {
    editor.setScrollTop(prevScrollTop);
  }
};

export const bindSaveShortcut = (editor: EditorInstanceType, monaco: MonacoType) => {
  if (!editor || !monaco) return;

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
    formatDocumentNow(editor);
  });
};

export const bindRunShortcut = (
  editor: EditorInstanceType,
  monaco: MonacoType,
  runReference: React.RefObject<() => Promise<void>>,
) => {
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
    runReference.current?.();
  });
};

export const bindCommentAndNextLine = (
  editor: EditorInstanceType,
  monaco: MonacoType,
) => {
  if (!editor || !monaco) return;

  editor.addAction({
    id: 'comment-line-and-next',
    label: 'Toggle Line Comment and Move Cursor Down',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash],
    run: async (editor) => {
      // Toggle line comment
      editor.trigger('keyboard', 'editor.action.commentLine', null);

      // Move cursor down (preserve column)
      const model = editor.getModel();
      const pos = editor.getPosition();
      if (!model || !pos) return;

      const nextLine = Math.min(pos.lineNumber + 1, model.getLineCount());
      const nextCol = Math.min(pos.column, model.getLineMaxColumn(nextLine));

      editor.setPosition({ lineNumber: nextLine, column: nextCol });
      editor.revealPositionInCenterIfOutsideViewport({
        lineNumber: nextLine,
        column: nextCol,
      });
    },
  });
};

export const bindDuplicateLineDown = (editor: EditorInstanceType, monaco: MonacoType) => {
  if (!editor || !monaco) return;

  editor.addAction({
    id: 'duplicate-line-down',
    label: 'Duplicate Line Down',

    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD],

    run: (ed) => {
      const model = ed.getModel();
      const selection = ed.getSelection();

      if (!model || !selection) return;

      const eol = model.getEOL();

      // There is a text selection
      if (!selection.isEmpty()) {
        // Get selected text
        const selectedText = model.getValueInRange(selection);

        // Position where duplicated text will be inserted
        const insertPos = selection.getEndPosition();

        // Create undo group
        ed.pushUndoStop();

        // Insert duplicated selection
        ed.executeEdits('duplicate-selection-down', [
          {
            range: new monaco.Range(
              insertPos.lineNumber,
              insertPos.column,
              insertPos.lineNumber,
              insertPos.column,
            ),
            text: selectedText,
          },
        ]);

        ed.pushUndoStop();

        // Move selection to duplicated block
        const startOffset = model.getOffsetAt(selection.getStartPosition());
        const endOffset = model.getOffsetAt(selection.getEndPosition());

        const newStart = model.getPositionAt(endOffset);
        const newEnd = model.getPositionAt(endOffset + (endOffset - startOffset));

        ed.setSelection(
          new monaco.Selection(
            newStart.lineNumber,
            newStart.column,
            newEnd.lineNumber,
            newEnd.column,
          ),
        );

        // Ensure duplicated block is visible
        ed.revealPositionInCenterIfOutsideViewport(newEnd);

        return;
      }

      // No selection → duplicate current line
      const pos = ed.getPosition();
      if (!pos) return;

      const lineNumber = pos.lineNumber;

      // Read current line content
      const lineContent = model.getLineContent(lineNumber);

      // Insert duplicated line below
      const insertLine = lineNumber + 1;

      ed.pushUndoStop();

      ed.executeEdits('duplicate-line-down', [
        {
          range: new monaco.Range(insertLine, 1, insertLine, 1),
          text: lineContent + eol,
        },
      ]);

      ed.pushUndoStop();

      // Move cursor to duplicated line
      const nextLine = Math.min(lineNumber + 1, model.getLineCount());
      const nextColumn = Math.min(pos.column, model.getLineMaxColumn(nextLine));

      const nextPosition = {
        lineNumber: nextLine,
        column: nextColumn,
      };

      ed.setPosition(nextPosition);

      // Keep duplicated line centered in viewport
      ed.revealPositionInCenterIfOutsideViewport(nextPosition);
    },
  });
};
