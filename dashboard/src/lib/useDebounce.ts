import { useState, useEffect } from 'react';

/**
 * Hook utilitario para retrasar la actualización de un valor.
 * Útil para inputs de búsqueda y evitar saturar APIs.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Establecer un timeout para actualizar el valor debounced
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el timeout si el valor cambia (o el componente se desmonta)
    // Esto es lo que previene que se actualice si el usuario sigue escribiendo
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
