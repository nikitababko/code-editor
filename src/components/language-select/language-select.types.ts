import type React from 'react';
import type { LanguageType } from '../../types.ts';

export type Props = {
  selected: LanguageType;
  setSelected: React.Dispatch<React.SetStateAction<LanguageType>>;
  isDisabled: boolean;
};
