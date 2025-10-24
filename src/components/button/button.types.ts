import type React from 'react';

export type Props = React.ComponentProps<'button'> & {
  onClick: () => void;
  isDisabled: boolean;
  children?: React.ReactNode;
  className?: string;
};
