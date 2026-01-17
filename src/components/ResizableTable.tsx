import { useState, useRef, useEffect, ReactNode } from 'react';

export interface ColumnConfig {
  key: string;
  label: string;
  width: number;
  minWidth?: number;
  render: (row: any) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
}

interface ResizableTableProps {
  columns: ColumnConfig[];
  data: any[];
  onColumnReorder: (newOrder: ColumnConfig[]) => void;
  onColumnResize: (key: string, width: number) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export function ResizableTable({
  columns,
  data,
  onColumnReorder,
  onColumnResize,
  sortField,
  sortDirection,
  onSort,
}: ResizableTableProps) {
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = (e: React.MouseEvent, columnKey: string, currentWidth: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(columnKey);
    setStartX(e.clientX);
    setStartWidth(currentWidth);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumn) {
        const diff = e.clientX - startX;
        const newWidth = Math.max(50, startWidth + diff);
        onColumnResize(resizingColumn, newWidth);
      }
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    if (resizingColumn) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingColumn, startX, startWidth, onColumnResize]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedColumn(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverColumn(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedColumn === null || draggedColumn === dropIndex) {
      setDraggedColumn(null);
      setDragOverColumn(null);
      return;
    }

    const newColumns = [...columns];
    const [removed] = newColumns.splice(draggedColumn, 1);
    newColumns.splice(dropIndex, 0, removed);
    
    onColumnReorder(newColumns);
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  return (
    <div ref={tableRef} className="overflow-x-auto max-h-[600px] overflow-y-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 sticky top-0 z-20">
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                style={{ 
                  width: `${column.width}px`,
                  minWidth: `${column.minWidth || 50}px`,
                  position: column.sticky ? 'sticky' : 'relative',
                  left: column.sticky ? 0 : 'auto',
                  zIndex: column.sticky ? 30 : 20,
                }}
                className={`
                  px-3 py-2 border-r border-gray-200 dark:border-gray-700 select-none
                  ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}
                  ${dragOverColumn === index ? 'bg-blue-100 dark:bg-blue-900' : ''}
                  ${column.sticky ? 'bg-gray-50 dark:bg-gray-800' : ''}
                  cursor-move hover:bg-gray-100 dark:hover:bg-gray-700
                `}
              >
                <div className="flex items-center justify-between gap-2">
                  <span 
                    className={`flex-1 ${column.sortable && onSort ? 'cursor-pointer' : ''}`}
                    onClick={() => column.sortable && onSort && onSort(column.key)}
                  >
                    {column.label}
                    {column.sortable && sortField === column.key && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                  <div
                    className="w-1 h-full cursor-col-resize hover:bg-blue-500 absolute right-0 top-0"
                    onMouseDown={(e) => handleResizeStart(e, column.key, column.width)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{ 
                    width: `${column.width}px`,
                    minWidth: `${column.minWidth || 50}px`,
                    position: column.sticky ? 'sticky' : 'relative',
                    left: column.sticky ? 0 : 'auto',
                    zIndex: column.sticky ? 10 : 'auto',
                  }}
                  className={`
                    px-3 py-2 border-r border-gray-200 dark:border-gray-700
                    ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}
                    ${column.sticky ? 'bg-white dark:bg-gray-900' : ''}
                  `}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
