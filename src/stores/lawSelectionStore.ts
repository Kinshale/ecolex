import { create } from 'zustand';
import { Law, LawFilters, DEFAULT_LAW_FILTERS } from '@/types/law';

interface LawSelectionState {
  // Modal state
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  
  // Selected laws
  selectedLaws: Law[];
  toggleLaw: (law: Law) => void;
  selectLaw: (law: Law) => void;
  deselectLaw: (lawId: string) => void;
  clearSelection: () => void;
  isLawSelected: (lawId: string) => boolean;
  
  // Uploaded document
  uploadedDocument: File | null;
  setUploadedDocument: (file: File | null) => void;
  
  // Filters
  filters: LawFilters;
  setFilters: (filters: Partial<LawFilters>) => void;
  resetFilters: () => void;
  
  // View mode
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  
  // Session management
  hasSelectedLawsForSession: boolean;
  confirmSelection: () => void;
  resetSession: () => void;
}

export const useLawSelectionStore = create<LawSelectionState>((set, get) => ({
  // Modal state
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  
  // Selected laws
  selectedLaws: [],
  toggleLaw: (law) => {
    const { selectedLaws } = get();
    const isSelected = selectedLaws.some(l => l.id === law.id);
    if (isSelected) {
      set({ selectedLaws: selectedLaws.filter(l => l.id !== law.id) });
    } else {
      set({ selectedLaws: [...selectedLaws, law] });
    }
  },
  selectLaw: (law) => {
    const { selectedLaws } = get();
    if (!selectedLaws.some(l => l.id === law.id)) {
      set({ selectedLaws: [...selectedLaws, law] });
    }
  },
  deselectLaw: (lawId) => {
    const { selectedLaws } = get();
    set({ selectedLaws: selectedLaws.filter(l => l.id !== lawId) });
  },
  clearSelection: () => set({ selectedLaws: [] }),
  isLawSelected: (lawId) => get().selectedLaws.some(l => l.id === lawId),
  
  // Uploaded document
  uploadedDocument: null,
  setUploadedDocument: (file) => set({ uploadedDocument: file }),
  
  // Filters
  filters: DEFAULT_LAW_FILTERS,
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  resetFilters: () => set({ filters: DEFAULT_LAW_FILTERS }),
  
  // View mode
  viewMode: 'list',
  setViewMode: (mode) => set({ viewMode: mode }),
  
  // Session management
  hasSelectedLawsForSession: false,
  confirmSelection: () => set({ hasSelectedLawsForSession: true, isModalOpen: false }),
  resetSession: () => set({ 
    selectedLaws: [], 
    uploadedDocument: null,
    hasSelectedLawsForSession: false,
    filters: DEFAULT_LAW_FILTERS,
  }),
}));
