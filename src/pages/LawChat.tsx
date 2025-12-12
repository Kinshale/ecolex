import { useState } from 'react';
import { FilterState, RegulatoryScope } from '@/types';
import { Header } from '@/components/Header';
import { HistorySidebar } from '@/components/HistorySidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { BottomFilterPanel } from '@/components/BottomFilterPanel';

export default function LawChat() {
  const [filters, setFilters] = useState<FilterState>({
    regulatoryScopes: ['european', 'national', 'lombardy'] as RegulatoryScope[],
    areaOfInterest: null,
    selectedNorms: [],
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <HistorySidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <ChatInterface filters={filters} />
          </div>
          <BottomFilterPanel filters={filters} onFiltersChange={setFilters} />
        </main>
      </div>
    </div>
  );
}
