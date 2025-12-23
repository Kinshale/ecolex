import { Header } from '@/components/Header';
import { HistorySidebar } from '@/components/HistorySidebar';
import { ComplianceUploader } from '@/components/ComplianceUploader';
import { LawSelectionModal } from '@/components/law-selection';
import { useLawSelectionStore } from '@/stores/lawSelectionStore';

export default function DocumentAnalysis() {
  const { selectedLaws } = useLawSelectionStore();

  return (
    <div className="h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <HistorySidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <ComplianceUploader selectedLaws={selectedLaws} />
          </div>
        </main>
      </div>

      <LawSelectionModal />
    </div>
  );
}
