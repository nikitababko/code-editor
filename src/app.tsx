import React, { useEffect, useRef, useState } from 'react';
import { executeCode } from './core/api';
import { Button } from './components/button';
import {
  CODE_RUN_BUTTON_LABEL,
  DEFAULT_EDITOR_WIDTH,
  LOCAL_STORAGE_CODE,
  LOCAL_STORAGE_EDITOR_WIDTH,
  MAX_EDITOR_WIDTH,
  MIN_EDITOR_WIDTH,
  MIN_OUTPUT_WIDTH,
} from './constants.ts';
import { Editor, type OnMount } from '@monaco-editor/react';
import { useDebounce } from './hooks/use-debounce.ts';
import { Output } from './components/output';
import clsx from 'clsx';
import { Loader } from './components/loader';

export const App = () => {
  const editorReference = useRef<Parameters<OnMount>[0] | null>(null);
  const outputReference = useRef<HTMLDivElement | null>(null);
  const containerReference = useRef<HTMLDivElement | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [editorWidth, setEditorWidth] = useState(
    Number(localStorage.getItem(LOCAL_STORAGE_EDITOR_WIDTH) ?? DEFAULT_EDITOR_WIDTH),
  );

  const onEditorMount: OnMount = (editor) => {
    setIsEditorLoading(false);
    editorReference.current = editor;
  };

  const handleRunCode = async () => {
    try {
      const code = editorReference?.current?.getValue?.();

      if (!code) return;

      setIsLoading(true);
      const response = await executeCode(code);
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

  useEffect(() => {
    const code = localStorage.getItem(LOCAL_STORAGE_CODE);

    if (code) {
      editorReference?.current?.setValue(code);
    }
  }, [isEditorLoading]);

  const handleEditorCodeChangeDebounced = useDebounce((value) => {
    if (value) {
      localStorage.setItem(LOCAL_STORAGE_CODE, value);
    }
  }, 1000);

  const handleEditorWidthChangeDebounced = useDebounce((value) => {
    if (value) {
      localStorage.setItem(LOCAL_STORAGE_EDITOR_WIDTH, value);
    }
  }, 1000);

  const handleDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    document.body.style.cursor = 'col-resize';
    const startX = event.clientX;
    const startWidth = editorWidth;
    const containerWidth = containerReference.current?.clientWidth ?? 0;

    const onMove = (event_: MouseEvent) => {
      const delta = event_.clientX - startX;
      let newEditorWidth = startWidth + delta;
      const maxEditorWidth = containerWidth - MIN_OUTPUT_WIDTH;
      newEditorWidth = Math.min(newEditorWidth, maxEditorWidth);
      newEditorWidth = Math.max(
        MIN_EDITOR_WIDTH,
        Math.min(MAX_EDITOR_WIDTH, newEditorWidth),
      );

      setEditorWidth(newEditorWidth);
      handleEditorWidthChangeDebounced(newEditorWidth);
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
    <div className="bg-dark-400 flex min-h-screen p-[10px]">
      <div className="m-[0_auto] flex w-full max-w-[1920px] flex-col gap-[20px]">
        <div className="flex gap-[10px]">
          <Button
            onClick={handleRunCode}
            isDisabled={isEditorLoading}
            label={CODE_RUN_BUTTON_LABEL}
          />

          <Button
            onClick={handleCleanOutput}
            isDisabled={isEditorLoading}
            label="Clean output"
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
              minWidth: MIN_EDITOR_WIDTH,
              maxWidth: MAX_EDITOR_WIDTH,
            }}
          >
            <Editor
              defaultLanguage="javascript"
              defaultValue="// Start coding"
              onMount={onEditorMount}
              theme="vs-dark"
              loading={<Loader />}
              className="overflow-hidden rounded-[8px]"
              onChange={(value) => {
                handleEditorCodeChangeDebounced(value);
              }}
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
