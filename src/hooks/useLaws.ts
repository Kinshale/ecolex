import { useQuery } from '@tanstack/react-query';
import { Law } from '@/types/law';

async function fetchLaws(): Promise<Law[]> {
  const response = await fetch('/src/data/norms.json');
  if (!response.ok) {
    // Fallback: import directly
    const data = await import('@/data/norms.json');
    return data.default as Law[];
  }
  return response.json();
}

export function useLaws() {
  return useQuery({
    queryKey: ['laws'],
    queryFn: fetchLaws,
    staleTime: Infinity, // Laws don't change frequently
  });
}
