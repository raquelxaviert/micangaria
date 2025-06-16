'use client';

import React, { useState, useEffect } from 'react';
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { GripVertical, X, RotateCcw, Save, Trash2 } from 'lucide-react';
import { getOptimizedImageUrl, IMAGE_CONFIGS } from '@/lib/imageUtils';

interface ImageItem {
  id: string;
  url: string;
  index: number;
}

interface ImageReorderProps {
  images: string[];
  onReorder: (newOrder: string[]) => void;
  className?: string;
  onRemove?: (imageUrl: string) => void;
}

export function ImageReorder({ 
  images, 
  onReorder, 
  className = "",
  onRemove
}: ImageReorderProps) {
  const [items, setItems] = useState<ImageItem[]>([]);

  // Atualizar items quando images mudar
  useEffect(() => {
    const newItems = images.map((url, index) => ({
      id: `image-${index}`,
      url,
      index
    }));
    setItems(newItems);
  }, [images]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Notificar sobre a nova ordem
      const newOrder = newItems.map(item => item.url);
      onReorder(newOrder);
    }
  };

  return (
    <div className={className}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={rectSortingStrategy}
        >
          <div className="space-y-2">
            {items.map((item, index) => (
              <SortableImageItem
                key={item.id}
                item={item}
                index={index}
                totalItems={items.length}
                onRemove={onRemove ? () => onRemove(item.url) : undefined}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableImageItem({ 
  item, 
  index, 
  totalItems,
  onRemove
}: {
  item: ImageItem;
  index: number;
  totalItems: number;
  onRemove?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
        <span className="text-sm text-gray-500">{index + 1}/{totalItems}</span>
      </div>

      <div className="relative w-20 h-20 flex-shrink-0">
        <Image
          src={item.url}
          alt={`Produto ${index + 1}`}
          fill
          className="object-cover rounded-lg"
          sizes="80px"
          quality={75}
        />
        
        {/* Primary image indicator */}
        {index === 0 && (
          <div className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
            Principal
          </div>
        )}
      </div>

      {/* Remove button */}
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
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
