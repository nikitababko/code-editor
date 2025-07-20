import { useEffect, useRef, useState } from 'react';
import { executeCode } from './core/api';
import { Loader } from './components/loader';
import clsx from 'clsx';
import { Button } from './components/button';
import { CODE_RUN_BUTTON_LABEL, LOCAL_STORAGE_CODE } from './constants.ts';
import { Editor, type OnMount } from '@monaco-editor/react';
import { Output } from './components/output';
import { useDebounce } from './hooks/use-debounce.ts';

export const App = () => {
  const editorReference = useRef<Parameters<OnMount>[0] | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditorLoading, setIsEditorLoading] = useState(true);

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

  const handleEditorChangeDebounced = useDebounce((value) => {
    if (value) {
      localStorage.setItem(LOCAL_STORAGE_CODE, value);
    }
  }, 1000);

  return (
    <div className="bg-dark-400 min-h-screen">
      <div className="m-auto grid min-h-screen max-w-[1920px] grid-cols-2 grid-rows-[auto_1fr_0.5fr] gap-[20px] p-[10px] lg:grid-rows-[auto_1fr]">
        <div className="col-span-full flex max-h-[fit-content] max-w-[fit-content] items-center gap-[10px] lg:col-start-2">
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
          className={clsx(
            'max-lg:col-span-full',
            isEditorLoading && 'rounded-[8px] border-[1px]',
          )}
        >
          <Editor
            defaultLanguage="javascript"
            defaultValue="// Start coding"
            onMount={onEditorMount}
            theme="vs-dark"
            loading={<Loader />}
            className="overflow-hidden rounded-[8px]"
            onChange={(value) => {
              handleEditorChangeDebounced(value);
            }}
          />
        </div>

        <Output isLoading={isLoading} output={output} />
      </div>
    </div>
  );
};
