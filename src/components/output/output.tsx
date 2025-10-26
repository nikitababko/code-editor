import React, { useId } from 'react';
import { CODE_RUN_BUTTON_LABEL } from '../../constants.ts';
import { Loader } from '../loader';
import type { Props } from './output.types.ts';

export const Output: React.FC<Props> = ({ isLoading, output, ref }) => {
  const hiddenLabelId = useId();

  return (
    <div className="relative flex-1 rounded-[8px] border-[1px] p-[10px]">
      {/* Hidden label for screen readers */}
      <span id={hiddenLabelId} className="sr-only">
        Code output
      </span>

      <samp
        ref={ref}
        role="status"
        aria-live="polite"
        aria-busy={isLoading}
        aria-labelledby={hiddenLabelId}
        tabIndex={0}
      >
        {isLoading ? (
          <Loader className="top-[50%] left-[50%] translate-[-50%]" />
        ) : (
          <span className="whitespace-pre text-gray-100">
            {output || `Click "${CODE_RUN_BUTTON_LABEL}" to see the output here`}
          </span>
        )}
      </samp>
    </div>
  );
};
