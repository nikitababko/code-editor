import React, { useRef, useState } from 'react';
import { LANGUAGES, LOCAL_STORAGE_DEFAULT_LANGUAGE_ID } from '../../constants.ts';
import { useOutsideClick } from '../../hooks';
import type { LanguageType } from '../../types.ts';
import { Button } from '../button';
import type { Props } from './language-select.types.ts';

export const LanguageSelect: React.FC<Props> = ({
  selected,
  setSelected,
  isDisabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useOutsideClick<HTMLDivElement>(ref, () => setIsOpen(false));

  const handleLanguageClick = (lang: LanguageType) => {
    localStorage.setItem(LOCAL_STORAGE_DEFAULT_LANGUAGE_ID, lang.id);
    setSelected(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative z-1 inline-block text-left" ref={ref}>
      <Button
        onClick={() => setIsOpen((isOpenPrevious) => !isOpenPrevious)}
        isDisabled={isDisabled}
        className="flex items-center"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selected.name}

        <svg
          className={`ml-2 h-4 w-4 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {isOpen && (
        <div
          className="absolute mt-2 w-[100%] rounded-md border border-yellow-500 bg-[#2b2b3a] shadow-lg"
          role="listbox"
          aria-activedescendant={selected.id}
        >
          <ul className="max-h-60 overflow-y-auto py-1 text-yellow-100">
            {LANGUAGES?.length > 0 &&
              LANGUAGES.map((lang) => (
                <li
                  key={lang.id}
                  onClick={() => handleLanguageClick(lang)}
                  className={`cursor-pointer p-4 duration-[0.3s] hover:bg-yellow-500/20 ${
                    selected.id === lang.id ? 'bg-yellow-500/20 font-medium' : ''
                  }`}
                >
                  {lang.name}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};
