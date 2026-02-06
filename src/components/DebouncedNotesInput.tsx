import { useState, useEffect, useRef, memo, useCallback } from 'react';

interface DebouncedNotesInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export const DebouncedNotesInput = memo(function DebouncedNotesInput({ 
  value, 
  onChange, 
  placeholder = "Add notes...",
  className = "",
  debounceMs = 1000 
}: DebouncedNotesInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const onChangeRef = useRef(onChange);

  // Keep onChange ref updated without triggering effects
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Update local value when prop changes (e.g., from external source)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the onChange callback
  useEffect(() => {
    if (localValue !== value) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        onChangeRef.current(localValue);
      }, debounceMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [localValue, value, debounceMs]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
});
