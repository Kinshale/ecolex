import { useState } from 'react';
import { Header } from '@/components/Header';
import { HistorySidebar } from '@/components/HistorySidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { LawSelectionModal } from '@/components/law-selection';

export default function LawChat() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  return (
    <div className="h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <HistorySidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          activeConversationId={activeConversationId}
          onConversationSelect={setActiveConversationId}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              conversationId={activeConversationId}
              onConversationChange={setActiveConversationId}
            />
          </div>
        </main>
      </div>

      <LawSelectionModal />
    </div>
  );
}
