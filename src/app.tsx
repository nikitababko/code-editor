import { Editor, type OnMount } from '@monaco-editor/react';
import clsx from 'clsx';
import React, { useRef, useState } from 'react';
import { Button } from './components/button';
import { LanguageSelect } from './components/language-select';
import { Loader } from './components/loader';
import { Output } from './components/output';
import {
  CODE_RUN_BUTTON_LABEL,
  DEFAULT_EDITOR_WIDTH,
  LANGUAGES,
  LOCAL_STORAGE_CODE,
  LOCAL_STORAGE_EDITOR_WIDTH,
  MAX_EDITOR_WIDTH,
  MIN_EDITOR_WIDTH,
} from './constants.ts';
import { executeCode } from './core/api';
import { useDebounce } from './hooks';
import type { EditorInstanceType, LanguageType } from './types.ts';
import {
  applyEditorOptions,
  bindSaveShortcut,
  formatDocumentNow,
  restoreCodeFromStorage,
  restoreLanguageLSFromStorage,
} from './utils';

export const App = () => {
  const editorReference = useRef<EditorInstanceType | null>(null);
  const outputReference = useRef<HTMLDivElement | null>(null);
  const containerReference = useRef<HTMLDivElement | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [editorWidth, setEditorWidth] = useState(
    Number(localStorage.getItem(LOCAL_STORAGE_EDITOR_WIDTH) ?? DEFAULT_EDITOR_WIDTH),
  );
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>(LANGUAGES[0]);

  const onEditorMount: OnMount = (editor, monaco) => {
    setIsEditorLoading(false);
    editorReference.current = editor;

    restoreLanguageLSFromStorage(setSelectedLanguage);
    restoreCodeFromStorage(editor);
    applyEditorOptions(editor);
    bindSaveShortcut(editor, monaco);
  };

  const handleRunCode = async () => {
    if (isLoading) return;

    try {
      const code = editorReference?.current?.getValue?.();

      if (!code) return;

      setIsLoading(true);
      const response = await executeCode(code, selectedLanguage.id);
      setOutput(response?.data?.run?.output || 'undefined');
    } catch (error) {
      if (error instanceof Error) {
        setOutput(error.message);
      } else {
        setOutput(String(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanOutput = () => {
    setOutput(null);
  };

  const handleEditorCodeChangeDebounced = useDebounce((value) => {
    if (value) {
      localStorage.setItem(LOCAL_STORAGE_CODE, value);
    }
  }, 1000);

  const handleDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    document.body.style.cursor = 'col-resize';
    const startX = event.clientX;
    const startWidth = editorWidth;

    let raf = 0;

    const onMove = (event: MouseEvent) => {
      cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        const delta = event.clientX - startX;
        let newEditorWidth = startWidth + delta;

        // ограничения
        newEditorWidth = Math.max(
          MIN_EDITOR_WIDTH,
          Math.min(MAX_EDITOR_WIDTH, newEditorWidth),
        );

        setEditorWidth(newEditorWidth);
      });
    };

    const onUp = () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div className="bg-dark-400 flex min-h-screen overflow-hidden p-[10px]">
      <div className="m-[0_auto] flex w-full max-w-[1920px] flex-col gap-[20px]">
        <div className="flex flex-wrap gap-[10px] max-sm:justify-between">
          <Button onClick={handleRunCode} isDisabled={isEditorLoading}>
            {CODE_RUN_BUTTON_LABEL}
          </Button>

          <Button onClick={handleCleanOutput} isDisabled={isEditorLoading}>
            Clean output
          </Button>

          <Button
            onClick={() =>
              editorReference.current && formatDocumentNow(editorReference.current)
            }
            isDisabled={isEditorLoading}
          >
            Prettify code
          </Button>

          <LanguageSelect
            selected={selectedLanguage}
            setSelected={setSelectedLanguage}
            isDisabled={isEditorLoading}
          />
        </div>

        <div
          className="flex min-h-0 flex-1 gap-[5px] max-lg:flex-col"
          ref={containerReference}
        >
          <div
            className={clsx(
              'h-full max-lg:!w-full',
              isEditorLoading && 'rounded-[8px] border-[1px]',
            )}
            style={{
              width: editorWidth,
              maxWidth: MAX_EDITOR_WIDTH,
            }}
          >
            <Editor
              defaultLanguage={LANGUAGES[0].id}
              defaultValue={selectedLanguage.defaultValue}
              onMount={onEditorMount}
              theme="vs-dark"
              loading={<Loader />}
              className="overflow-hidden rounded-[8px]"
              onChange={(value) => {
                handleEditorCodeChangeDebounced(value);
              }}
              language={selectedLanguage.id}
            />
          </div>

          <div
            onMouseDown={handleDrag}
            style={{
              cursor: 'col-resize',
            }}
            className="hover:bg-dark-300 w-[4px] rounded-[8px] bg-[#222] transition-colors"
          />

          <Output isLoading={isLoading} output={output} ref={outputReference} />
        </div>
      </div>
    </div>
  );
};
