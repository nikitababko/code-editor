import React from 'react';
import './loader.styles.css';
import type { Props } from './loader.types.ts';
import clsx from 'clsx';

export const Loader: React.FC<Props> = ({ className }) => {
    return <div className={clsx('loader', className)} />;
};
