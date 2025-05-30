import React from 'react';
import type { Props } from './button.types.ts';
import clsx from 'clsx';

export const Button: React.FC<Props> = ({ onClick, isEditorLoading, label }) => {
    return (
        <button
            onClick={onClick}
            className={clsx(
                'hover:text-dark-400 transition-[background-color, color] max-h-[fit-content] rounded-[8px] border-[1px] border-amber-400 p-[10px] text-2xl text-amber-400 duration-[0.3s] ease-in-out hover:bg-amber-400',
                isEditorLoading ? 'cursor-default opacity-[0.4]' : 'cursor-pointer',
            )}
            disabled={isEditorLoading}
        >
            {label}
        </button>
    );
};
