import type { OnMount } from '@monaco-editor/react';
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

export const formatDocumentNow = (editor: Parameters<OnMount>[0]) => {
  if (!editor) return;

  editor?.getAction('editor.action.formatDocument')?.run();
};

export const bindSaveShortcut = (editor: EditorInstanceType, monaco: MonacoType) => {
  if (!editor || !monaco) return;

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
    formatDocumentNow(editor);
  });
};
