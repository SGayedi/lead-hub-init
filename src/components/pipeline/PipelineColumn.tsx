
import React from 'react';
import { PipelineCard } from './PipelineCard';
import { PipelineColumn as PipelineColumnType, PipelineType } from '@/types/pipeline';

interface PipelineColumnProps {
  column: PipelineColumnType;
  type: PipelineType;
  onDragStart: (e: React.DragEvent, itemId: string, sourceColumnId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetColumnId: string) => void;
}

export const PipelineColumn = ({ 
  column, 
  type,
  onDragStart,
  onDragOver,
  onDrop
}: PipelineColumnProps) => {
  return (
    <div 
      className="flex flex-col bg-gray-50 p-3 rounded-lg min-w-[280px] max-w-[320px]"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id)}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">{column.name}</h3>
        <span className="bg-gray-200 rounded-full px-2 text-xs">
          {column.items.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-auto">
        {column.items.map((item) => (
          <div 
            key={item.id}
            draggable
            onDragStart={(e) => onDragStart(e, item.id, column.id)}
          >
            <PipelineCard item={item} type={type} />
          </div>
        ))}
        
        {column.items.length === 0 && (
          <div className="py-8 px-4 text-center text-gray-500 text-sm italic">
            No items in this stage
          </div>
        )}
      </div>
    </div>
  );
};
