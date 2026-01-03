import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { HistorySidebar } from '@/components/HistorySidebar';
import { PolimiSidebar } from '@/components/polimi/PolimiSidebar';
import { PolimiChatArea } from '@/components/polimi/PolimiChatArea';
import { toast } from 'sonner';

export interface Degree {
  id: string;
  name: string;
  isActive: boolean;
}

// Corsi di Laurea selezionabili - focus su normative ambientali, urbanistiche, edilizie e sicurezza
const DEGREES: Degree[] = [
  // Lauree Triennali (Bachelor - in italiano)
  {
    id: 'ambiente-territorio',
    name: 'Ingegneria per l\'Ambiente e il Territorio',
    isActive: true
  },
  {
    id: 'civile',
    name: 'Ingegneria Civile',
    isActive: false
  },
  {
    id: 'edile-costruzioni',
    name: 'Ingegneria Edile e delle Costruzioni',
    isActive: false
  },
  {
    id: 'edile-architettura',
    name: 'Ingegneria Edile-Architettura',
    isActive: false
  },
  // Lauree Magistrali (Master - in inglese)
  {
    id: 'industrial-safety',
    name: 'Industrial Safety and Risk Engineering',
    isActive: false
  },
  {
    id: 'sustainable-architecture',
    name: 'Sustainable Architecture and Landscape Design',
    isActive: false
  },
  {
    id: 'urban-planning-policy',
    name: 'Urban Planning and Policy Design',
    isActive: false
  },
  {
    id: 'urban-planning-landscapes',
    name: 'Urban Planning: Cities, Environment and Landscapes',
    isActive: false
  }
];

export default function PolimiHub() {
  const [selectedDegreeId, setSelectedDegreeId] = useState<string>('ambiente-territorio');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileContents, setFileContents] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const selectedDegree = DEGREES.find(d => d.id === selectedDegreeId);

  const handleDegreeChange = useCallback((degreeId: string) => {
    const degree = DEGREES.find(d => d.id === degreeId);
    
    if (!degree?.isActive) {
      toast.info('Demo Mode', {
        description: `Access to ${degree?.name} is restricted during the presentation.`
      });
      return;
    }
    
    setSelectedDegreeId(degreeId);
  }, []);

  const handleFilesUpload = useCallback(async (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    
    const contents: string[] = [];
    for (const file of files) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text();
        contents.push(`--- ${file.name} ---\n${text}\n`);
      } else if (file.type === 'application/pdf') {
        contents.push(`--- ${file.name} (PDF uploaded) ---\n[PDF content available for analysis]\n`);
      }
    }
    
    setFileContents(prev => prev + contents.join('\n'));
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <HistorySidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeConversationId={null}
          onConversationSelect={() => {}}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <PolimiSidebar
            degrees={DEGREES}
            selectedDegreeId={selectedDegreeId}
            uploadedFiles={uploadedFiles}
            onDegreeChange={handleDegreeChange}
            onFilesUpload={handleFilesUpload}
            onRemoveFile={handleRemoveFile}
          />
          
          <PolimiChatArea
            degreeName={selectedDegree?.name}
            fileContents={fileContents}
            hasFiles={uploadedFiles.length > 0}
          />
        </div>
      </div>
    </div>
  );
}
