import { useRef, useState } from 'react';
import { executeCode } from './core/api';
import { Loader } from './components/loader';
import clsx from 'clsx';
import { Button } from './components/button';
import { CODE_RUN_BUTTON_LABEL } from './constants.ts';
import { Editor, type OnMount } from '@monaco-editor/react';
import { Output } from './components/output';

export const App = () => {
    const editorReference = useRef<Parameters<OnMount>[0] | null>(null);
    const [output, setOutput] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditorLoading, setIsEditorLoading] = useState(true);

    const handleEditorDidMount: OnMount = (editor) => {
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

    return (
        <div className="bg-dark-400 h-screen">
            <div className="m-auto grid h-screen max-w-[1920px] grid-cols-2 grid-rows-[auto_1fr_150px] gap-[20px] p-[10px] lg:grid-rows-[auto_1fr]">
                <div className="col-span-full flex max-h-[fit-content] max-w-[fit-content] items-center gap-[10px] lg:col-start-2">
                    <Button
                        onClick={handleRunCode}
                        isEditorLoading={isEditorLoading}
                        label={CODE_RUN_BUTTON_LABEL}
                    />

                    <Button
                        onClick={handleCleanOutput}
                        isEditorLoading={isEditorLoading}
                        label="Clean output"
                    />
                </div>

                <div
                    className={clsx(
                        'h-[100%] max-lg:col-span-full',
                        isEditorLoading && 'rounded-[8px] border-[1px]',
                    )}
                >
                    <Editor
                        defaultLanguage="javascript"
                        defaultValue="// Start coding"
                        onMount={handleEditorDidMount}
                        theme="vs-dark"
                        loading={<Loader />}
                        className="overflow-hidden rounded-[8px]"
                    />
                </div>

                <Output isLoading={isLoading} output={output} />
            </div>
        </div>
    );
};
