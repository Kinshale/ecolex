import { useState } from 'react';
import { FilterState, RegulatoryScope } from '@/types';
import { Header } from '@/components/Header';
import { FilterSidebar } from '@/components/FilterSidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { ComplianceUploader } from '@/components/ComplianceUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, FileCheck } from 'lucide-react';

export default function Dashboard() {
  const [filters, setFilters] = useState<FilterState>({
    regulatoryScopes: ['european', 'national', 'lombardy'] as RegulatoryScope[],
    areaOfInterest: null,
  });
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <FilterSidebar filters={filters} onFiltersChange={setFilters} />
        
        <main className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-border px-6 py-3 bg-muted/30">
              <TabsList className="bg-background/50">
                <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-background">
                  <MessageSquare className="w-4 h-4" />
                  Compliance Chat
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2 data-[state=active]:bg-background">
                  <FileCheck className="w-4 h-4" />
                  Document Analysis
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="chat" className="flex-1 m-0 data-[state=inactive]:hidden">
              <ChatInterface filters={filters} />
            </TabsContent>
            
            <TabsContent value="upload" className="flex-1 m-0 data-[state=inactive]:hidden">
              <ComplianceUploader filters={filters} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
