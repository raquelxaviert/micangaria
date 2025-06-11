'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectInputProps {
  value?: string;
  onChange: (value: string) => void;
  options?: string[];
  placeholder?: string;
  label?: string;
  allowCustom?: boolean;
  required?: boolean;
  className?: string;
}

export function SelectInput({
  value = '',
  onChange,
  options = [],
  placeholder = "Selecione uma opção",
  label,
  allowCustom = true,
  required = false,
  className
}: SelectInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [allOptions, setAllOptions] = useState<string[]>(options);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newOptionValue, setNewOptionValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carregar opções customizadas do localStorage ao montar o componente
  useEffect(() => {
    if (allowCustom && label) {
      const storageKey = `custom_${label.toLowerCase().replace(/\s+/g, '_')}`;
      const customOptions = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Combinar opções padrão com customizadas, removendo duplicatas
      const combinedOptions = [...new Set([...options, ...customOptions])];
      setAllOptions(combinedOptions);
    } else {
      setAllOptions(options);
    }
  }, [options, label, allowCustom]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = allOptions.filter(option =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(allOptions);
    }
  }, [inputValue, allOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsAddingNew(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setInputValue(option);
    setIsOpen(false);
    setIsAddingNew(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (allowCustom) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0 && !isAddingNew) {
        handleSelect(filteredOptions[0]);
      } else if (allowCustom && inputValue.trim()) {
        handleSelect(inputValue.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setIsAddingNew(false);
    }
  };  const handleAddNew = () => {
    if (newOptionValue.trim()) {
      const newOption = newOptionValue.trim();
      
      // Adicionar a nova opção à lista de opções (se permitido)
      if (allowCustom && !allOptions.includes(newOption)) {
        // Atualizar lista local
        const updatedOptions = [...allOptions, newOption];
        setAllOptions(updatedOptions);
        
        // Salvar no localStorage para persistir entre sessões
        if (label) {
          const storageKey = `custom_${label.toLowerCase().replace(/\s+/g, '_')}`;
          const existingCustom = JSON.parse(localStorage.getItem(storageKey) || '[]');
          if (!existingCustom.includes(newOption)) {
            existingCustom.push(newOption);
            localStorage.setItem(storageKey, JSON.stringify(existingCustom));
          }
        }
        
        // Notificar sobre a nova categoria criada
        console.log('✅ Nova categoria criada e salva:', newOption);
      }
      
      onChange(newOption);
      setInputValue(newOption);
      setNewOptionValue('');
      setIsAddingNew(false);
      setIsOpen(false);
    }
  };

  const showAddButton = allowCustom && inputValue.trim() && 
    !allOptions.some(option => option.toLowerCase() === inputValue.toLowerCase());  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium block">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            required={required}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-6 w-6 p-0"
            onClick={() => {
              setIsOpen(!isOpen);
              inputRef.current?.focus();
            }}
          >
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )} />
          </Button>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {/* Opções existentes */}
            {filteredOptions.length > 0 && (
              <div className="py-1">
                {filteredOptions.map((option, index) => (
                  <button
                    key={index}
                    type="button"
                    className={cn(
                      "w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm flex items-center justify-between",
                      value === option && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => handleSelect(option)}
                  >
                    <span>{option}</span>
                    {value === option && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            )}

            {/* Divisor se há opções e permite adicionar nova */}
            {filteredOptions.length > 0 && allowCustom && showAddButton && (
              <div className="border-t border-border" />
            )}

            {/* Seção para adicionar nova opção */}
            {allowCustom && (
              <div className="py-1">
                {!isAddingNew && showAddButton && (
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm flex items-center gap-2 text-primary"
                    onClick={() => setIsAddingNew(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar "{inputValue}"
                  </button>
                )}

                {isAddingNew && (
                  <div className="p-2 space-y-2 border-t border-border">
                    <div className="text-xs text-muted-foreground font-medium">
                      Adicionar nova categoria:
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newOptionValue}
                        onChange={(e) => setNewOptionValue(e.target.value)}
                        placeholder="Nome da nova categoria"
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNew();
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddNew}
                        disabled={!newOptionValue.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mensagem quando não há opções */}
            {filteredOptions.length === 0 && !allowCustom && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Nenhuma opção encontrada
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
