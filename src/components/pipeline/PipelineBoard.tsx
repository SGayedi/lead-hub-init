
import React, { useState } from 'react';
import { PipelineColumn } from './PipelineColumn';
import { PipelineColumn as PipelineColumnType, PipelineType } from '@/types/pipeline';
import { usePipeline } from '@/hooks/usePipeline';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface PipelineBoardProps {
  type: PipelineType;
}

export const PipelineBoard = ({ type }: PipelineBoardProps) => {
  const { 
    columns, 
    isLoading, 
    error, 
    moveItem
  } = usePipeline(type);
  
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null);
  
  const handleDragStart = (e: React.DragEvent, itemId: string, columnId: string) => {
    setDraggingItemId(itemId);
    setSourceColumnId(columnId);
    e.dataTransfer.setData('text/plain', itemId);
    // Set a ghost drag image
    const dragImage = document.createElement('div');
    dragImage.style.width = '280px';
    dragImage.style.height = '100px';
    dragImage.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    dragImage.style.borderRadius = '8px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 140, 50);
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    if (!draggingItemId || !sourceColumnId || sourceColumnId === targetColumnId) {
      return;
    }
    
    try {
      await moveItem.mutateAsync({
        entityId: draggingItemId,
        targetStageId: targetColumnId
      });
    } catch (error) {
      console.error('Error moving item:', error);
    }
    
    // Reset drag state
    setDraggingItemId(null);
    setSourceColumnId(null);
  };
  
  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 bg-gray-50 p-3 rounded-lg min-w-[280px]">
            <Skeleton className="h-6 w-full mb-4" />
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-24 w-full mb-3" />
            ))}
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-card border-border rounded-md p-6 text-center text-red-500">
        <p>Error loading pipeline: {(error as Error).message}</p>
      </div>
    );
  }
  
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns?.map((column: PipelineColumnType) => (
        <PipelineColumn 
          key={column.id}
          column={column}
          type={type}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};
