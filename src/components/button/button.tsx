import clsx from 'clsx';
import React from 'react';
import type { Props } from './button.types.ts';

export const Button: React.FC<Props> = ({
  onClick,
  isDisabled,
  children,
  className,
  ...rest
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'hover:text-dark-400 transition-[background-color, color] max-h-[fit-content] rounded-[8px] border-[1px] border-amber-400 p-[10px] text-2xl text-amber-400 duration-[0.3s] ease-in-out hover:bg-amber-400',
        className,
        isDisabled
          ? 'pointer-events-none cursor-default opacity-[0.4]'
          : 'cursor-pointer',
      )}
      disabled={isDisabled}
      {...rest}
    >
      {children}
    </button>
  );
};
