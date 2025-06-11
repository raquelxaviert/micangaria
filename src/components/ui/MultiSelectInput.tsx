'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

interface MultiSelectInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  label?: string;
  maxItems?: number;
}

export function MultiSelectInput({
  value = [],
  onChange,
  suggestions = [],
  placeholder = "Digite e pressione Enter para adicionar",
  label,
  maxItems = 10
}: MultiSelectInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions.filter(
        suggestion => 
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(suggestion)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, suggestions, value]);

  const addItem = (item: string) => {
    const trimmedItem = item.trim();
    if (trimmedItem && !value.includes(trimmedItem) && value.length < maxItems) {
      onChange([...value, trimmedItem]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeItem(value.length - 1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addItem(suggestion);
    inputRef.current?.focus();
  };  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium block">{label}</label>}
      
      {/* Selected items */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {item}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeItem(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length >= maxItems ? `Máximo ${maxItems} itens` : placeholder}
          disabled={value.length >= maxItems}
        />
        
        {/* Add button */}
        {inputValue.trim() && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1 h-6 w-6 p-0"
            onClick={() => addItem(inputValue)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}      </div>

      {/* Status do campo */}
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {value.length}/{maxItems} itens adicionados
        </p>
      )}
    </div>
  );
}
