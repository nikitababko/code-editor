import React from 'react';
import { Loader } from '../loader';
import type { Props } from './output.types.ts';
import { CODE_RUN_BUTTON_LABEL } from '../../constants.ts';

export const Output: React.FC<Props> = ({ isLoading, output }) => {
  return (
    <div className="relative w-full rounded-[8px] border-[1px] p-[10px] max-lg:col-span-full max-lg:row-start-3">
      {isLoading ? (
        <Loader className="top-[50%] left-[50%] translate-[-50%]" />
      ) : (
        <p className="whitespace-pre text-gray-100">
          {output || `Click "${CODE_RUN_BUTTON_LABEL}" to see the output here`}
        </p>
      )}
    </div>
  );
};
