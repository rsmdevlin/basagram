'use client';

import React, { useState, useCallback, useEffect } from 'react';

interface SearchResult {
  id: string;
  type: 'conversation' | 'user' | 'message';
  title: string;
  subtitle?: string;
  avatar?: string;
}

interface SearchInputProps {
  onSearch: (query: string) => void;
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  results?: SearchResult[];
  isLoading?: boolean;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  onResultSelect,
  placeholder = 'Search chats, users, messages...',
  results = [],
  isLoading = false,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    if (value.trim()) {
      onSearch(value);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    onResultSelect?.(result);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--tg-text-tertiary)]">
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 rounded-lg bg-[var(--tg-surface)] text-[var(--tg-text)] placeholder-[var(--tg-text-tertiary)] border border-[var(--tg-border)] outline-none focus:border-[var(--tg-primary)] focus:ring-2 focus:ring-[var(--tg-primary)] focus:ring-opacity-20 transition-all text-sm"
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--tg-text-tertiary)] hover:text-[var(--tg-text)] transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && (results.length > 0 || isLoading) && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Results list */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--tg-bg)] border border-[var(--tg-border)] rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto scrollbar-thin">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="inline-block w-5 h-5 border-2 border-[var(--tg-primary)] border-t-transparent rounded-full animate-spin" />
                <p className="text-[var(--tg-text-secondary)] text-sm mt-2">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-[var(--tg-text-secondary)] text-sm">No results found</p>
              </div>
            ) : (
              results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelectResult(result)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--tg-surface)] ${
                    selectedIndex === index ? 'bg-[var(--tg-surface)]' : ''
                  } border-b border-[var(--tg-border)] last:border-b-0 text-left`}
                >
                  {/* Avatar or icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--tg-surface)] flex items-center justify-center">
                    {result.avatar ? (
                      <img src={result.avatar} alt={result.title} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-lg">
                        {result.type === 'conversation' ? '💬' : result.type === 'user' ? '👤' : '💭'}
                      </span>
                    )}
                  </div>

                  {/* Result info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[var(--tg-text)] truncate">
                      {result.title}
                    </h4>
                    {result.subtitle && (
                      <p className="text-xs text-[var(--tg-text-secondary)] truncate">
                        {result.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Type badge */}
                  <span className="flex-shrink-0 text-xs font-semibold text-[var(--tg-text-tertiary)] bg-[var(--tg-surface)] px-2 py-1 rounded">
                    {result.type}
                  </span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchInput;
