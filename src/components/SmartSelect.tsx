// Componente para seleção inteligente de tipo/estilo com opção de adicionar novos
// src/components/SmartSelect.tsx

import React, { useState, useRef } from 'react';
import { ChevronDown, Plus, Tag } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  description?: string;
  isCustom?: boolean;
}

interface SmartSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  onAddNew?: (newValue: string) => Promise<boolean>;
  placeholder?: string;
  label?: string;
  allowCustom?: boolean;
}

export function SmartSelect({
  value,
  onChange,
  options,
  onAddNew,
  placeholder = "Selecione uma opção",
  label,
  allowCustom = true
}: SmartSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newValue, setNewValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar opções baseado no termo de busca
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Opção selecionada atual
  const selectedOption = options.find(opt => opt.value === value);

  const handleAddNew = async () => {
    if (!newValue.trim() || !onAddNew) return;

    const success = await onAddNew(newValue.trim());
    if (success) {
      onChange(newValue.trim().toLowerCase());
      setNewValue('');
      setIsAddingNew(false);
      setIsOpen(false);
    } else {
      alert('Este valor já existe ou não pôde ser adicionado.');
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      {/* Campo principal */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 border rounded-md bg-white text-left
            ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}
            ${selectedOption ? 'text-gray-900' : 'text-gray-500'}
            hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedOption?.isCustom && (
                <Tag className="w-4 h-4 text-purple-500" />
              )}
              <span>
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            {/* Campo de busca */}
            <div className="p-2 border-b border-gray-200">
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Lista de opções */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2
                    ${option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                  `}
                >
                  {option.isCustom && (
                    <Tag className="w-4 h-4 text-purple-500" />
                  )}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-500">{option.description}</div>
                    )}
                  </div>
                </button>
              ))}

              {/* Opção para adicionar novo */}
              {allowCustom && onAddNew && (
                <>
                  {filteredOptions.length > 0 && (
                    <div className="border-t border-gray-200" />
                  )}
                  
                  {!isAddingNew ? (
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(true)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar novo</span>
                    </button>
                  ) : (
                    <div className="p-3 border-t border-gray-200">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Digite o novo valor"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddNew();
                            } else if (e.key === 'Escape') {
                              setIsAddingNew(false);
                              setNewValue('');
                            }
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleAddNew}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Adicionar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNew(false);
                            setNewValue('');
                          }}
                          className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Indicador se é valor personalizado */}
      {selectedOption?.isCustom && (
        <div className="mt-1 text-xs text-purple-600 flex items-center gap-1">
          <Tag className="w-3 h-3" />
          Valor personalizado
        </div>
      )}
    </div>
  );
}

export default SmartSelect;
