import { useState } from 'react';
import { FilterState, RegulatoryScope } from '@/types';
import { Header } from '@/components/Header';
import { HistorySidebar } from '@/components/HistorySidebar';
import { ComplianceUploader } from '@/components/ComplianceUploader';
import { BottomFilterPanel } from '@/components/BottomFilterPanel';

export default function DocumentAnalysis() {
  const [filters, setFilters] = useState<FilterState>({
    regulatoryScopes: ['european', 'national', 'lombardy'] as RegulatoryScope[],
    areaOfInterest: null,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <HistorySidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <ComplianceUploader filters={filters} />
          </div>
          <BottomFilterPanel filters={filters} onFiltersChange={setFilters} />
        </main>
      </div>
    </div>
  );
}
