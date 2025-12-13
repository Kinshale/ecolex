import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { HistorySidebar } from '@/components/HistorySidebar';
import { PolimiSidebar } from '@/components/polimi/PolimiSidebar';
import { PolimiChatArea } from '@/components/polimi/PolimiChatArea';

export interface CourseConfig {
  id: string;
  name: string;
  systemPrompt: string;
}

export interface Faculty {
  id: string;
  name: string;
  courses: CourseConfig[];
}

const FACULTIES: Faculty[] = [
  {
    id: 'civil-env',
    name: 'Civil & Environmental Engineering',
    courses: [
      {
        id: 'soil-remediation',
        name: 'Soil Remediation',
        systemPrompt: `You are a Technical Environmental Engineer specializing in soil remediation. Focus on chemical processes, pollutant degradation formulas, and remediation technologies (Biopiles, SVE, Pump-and-Treat, Phytoremediation). Base your answers strictly on the uploaded technical documents when available. Provide detailed technical explanations with relevant equations and methodologies. Always cite specific remediation standards and best practices.`
      },
      {
        id: 'eia',
        name: 'Environmental Impact Assessment',
        systemPrompt: `You are an expert in Environmental Law and EU Directives, specializing in Environmental Impact Assessment procedures. Focus on administrative procedures, legal articles (D.Lgs 152/2006, EIA Directive 2011/92/EU), and mandatory documentation requirements. Base your answers strictly on the uploaded legal texts when available. Reference specific articles, annexes, and procedural timelines. Clarify the distinction between screening, scoping, and full EIA processes.`
      }
    ]
  },
  {
    id: 'architecture',
    name: 'Architecture',
    courses: [
      {
        id: 'sustainable-design',
        name: 'Sustainable Building Design',
        systemPrompt: `You are an expert in sustainable architecture and green building design. Focus on energy efficiency, passive design strategies, LEED/BREEAM certification requirements, and sustainable materials. Base your answers on uploaded course materials when available.`
      }
    ]
  },
  {
    id: 'energy',
    name: 'Energy Engineering',
    courses: [
      {
        id: 'renewable-energy',
        name: 'Renewable Energy Systems',
        systemPrompt: `You are an expert in renewable energy systems and technologies. Focus on solar, wind, hydro, and biomass energy conversion, grid integration, and energy storage solutions. Provide technical calculations and system sizing guidance based on uploaded materials.`
      }
    ]
  }
];

export default function PolimiHub() {
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('civil-env');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('soil-remediation');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileContents, setFileContents] = useState<string>('');

  const selectedFaculty = FACULTIES.find(f => f.id === selectedFacultyId);
  const selectedCourse = selectedFaculty?.courses.find(c => c.id === selectedCourseId);

  const handleFacultyChange = useCallback((facultyId: string) => {
    setSelectedFacultyId(facultyId);
    const faculty = FACULTIES.find(f => f.id === facultyId);
    if (faculty && faculty.courses.length > 0) {
      setSelectedCourseId(faculty.courses[0].id);
    }
  }, []);

  const handleCourseChange = useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
  }, []);

  const handleFilesUpload = useCallback(async (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    
    // Read text content from files
    const contents: string[] = [];
    for (const file of files) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text();
        contents.push(`--- ${file.name} ---\n${text}\n`);
      } else if (file.type === 'application/pdf') {
        // For PDFs, we'll note that they're uploaded but can't read client-side
        contents.push(`--- ${file.name} (PDF uploaded) ---\n[PDF content available for analysis]\n`);
      }
    }
    
    setFileContents(prev => prev + contents.join('\n'));
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <HistorySidebar />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Polimi Course Sidebar */}
          <PolimiSidebar
            faculties={FACULTIES}
            selectedFacultyId={selectedFacultyId}
            selectedCourseId={selectedCourseId}
            uploadedFiles={uploadedFiles}
            onFacultyChange={handleFacultyChange}
            onCourseChange={handleCourseChange}
            onFilesUpload={handleFilesUpload}
            onRemoveFile={handleRemoveFile}
          />
          
          {/* Main Chat Area */}
          <PolimiChatArea
            course={selectedCourse}
            fileContents={fileContents}
            hasFiles={uploadedFiles.length > 0}
          />
        </div>
      </div>
    </div>
  );
}
