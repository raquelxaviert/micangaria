'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { GripVertical, X, RotateCcw, Save } from 'lucide-react';
import { getOptimizedImageUrl, IMAGE_CONFIGS } from '@/lib/imageUtils';

interface SortableImageItemProps {
  id: string;
  url: string;
  index: number;
  onRemove: (id: string) => void;
  isPrimary?: boolean;
}

// Componente individual para cada imagem sortável
function SortableImageItem({ id, url, index, onRemove, isPrimary }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const optimizedUrl = getOptimizedImageUrl(url, IMAGE_CONFIGS.thumbnail);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <Card className={`overflow-hidden border-2 transition-all duration-200 ${
        isPrimary ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
      }`}>
        <CardContent className="p-2">
          {/* Badge da posição e principal */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Badge variant={isPrimary ? "default" : "secondary"} className="text-xs">
                {isPrimary ? 'Principal' : `#${index + 1}`}
              </Badge>
            </div>
            
            {/* Botão de remover */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(id)}
            >
              <X className="h-3 w-3 text-red-500" />
            </Button>
          </div>

          {/* Imagem */}
          <div className="relative aspect-square mb-2">
            <Image
              src={optimizedUrl}
              alt={`Imagem ${index + 1}`}
              fill
              className="object-cover rounded"
              sizes="150px"
            />
          </div>

          {/* Handle para drag */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center justify-center p-2 cursor-grab active:cursor-grabbing bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-600 ml-1">Arrastar</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ImageReorderProps {
  images: string[];
  onReorder: (newOrder: string[]) => void;
  onRemove?: (imageUrl: string) => void;
  className?: string;
}

export function ImageReorder({ 
  images, 
  onReorder, 
  onRemove,
  className = "" 
}: ImageReorderProps) {
  const [items, setItems] = useState(images);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      setHasChanges(true);
    }
  }

  function handleRemove(imageUrl: string) {
    const newItems = items.filter(url => url !== imageUrl);
    setItems(newItems);
    setHasChanges(true);
    
    if (onRemove) {
      onRemove(imageUrl);
    }
  }

  function handleSave() {
    onReorder(items);
    setHasChanges(false);
  }

  function handleReset() {
    setItems(images);
    setHasChanges(false);
  }

  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhuma imagem para reordenar</p>
          <p className="text-sm text-gray-400">
            Adicione imagens para poder reordená-las
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Cabeçalho com controles */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Reordenar Imagens</h3>
          <p className="text-sm text-gray-600">
            Arraste as imagens para reordená-las. A primeira será a imagem principal.
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reverter
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-1" />
              Salvar Ordem
            </Button>
          </div>
        )}
      </div>

      {/* Grid de imagens sortáveis */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={horizontalListSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((url, index) => (
              <SortableImageItem
                key={url}
                id={url}
                url={url}
                index={index}
                onRemove={handleRemove}
                isPrimary={index === 0}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Indicador de mudanças */}
      {hasChanges && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ⚠️ <strong>Você tem alterações não salvas.</strong> Lembre-se de clicar em "Salvar Ordem" para confirmar as mudanças.
          </p>
        </div>
      )}
    </div>
  );
}

// Componente mais simples para usar em formulários
interface SimpleImageReorderProps {
  images: string[];
  onChange: (newOrder: string[]) => void;
  maxImages?: number;
}

export function SimpleImageReorder({ 
  images, 
  onChange, 
  maxImages = 10 
}: SimpleImageReorderProps) {
  return (
    <ImageReorder
      images={images.slice(0, maxImages)}
      onReorder={onChange}
      className="w-full"
    />
  );
}
