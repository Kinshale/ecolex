import { useQuery } from '@tanstack/react-query';
import { Law } from '@/types/law';
import normsData from '@/data/norms.json';

export function useLaws() {
  return useQuery({
    queryKey: ['laws'],
    queryFn: async (): Promise<Law[]> => {
      // Simulate async to match query pattern
      return normsData as Law[];
    },
    staleTime: Infinity,
  });
}
