import { Header } from '@/components/Header';
import { HistorySidebar } from '@/components/HistorySidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { LawSelectionModal } from '@/components/law-selection';

export default function LawChat() {
  return (
    <div className="h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <HistorySidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <ChatInterface />
          </div>
        </main>
      </div>

      <LawSelectionModal />
    </div>
  );
}
