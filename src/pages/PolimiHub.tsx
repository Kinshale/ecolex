import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { HistorySidebar } from '@/components/HistorySidebar';
import { PolimiSidebar } from '@/components/polimi/PolimiSidebar';
import { PolimiChatArea } from '@/components/polimi/PolimiChatArea';
import { toast } from 'sonner';

export interface CourseConfig {
  id: string;
  name: string;
  systemPrompt: string;
  isActive: boolean;
}

export interface Degree {
  id: string;
  name: string;
  isActive: boolean;
  courses: CourseConfig[];
}

// Complete list of Polimi Master of Science degrees
const DEGREES: Degree[] = [
  {
    id: 'aeronautical',
    name: 'Aeronautical Engineering',
    isActive: false,
    courses: []
  },
  {
    id: 'agricultural',
    name: 'Agricultural Engineering',
    isActive: false,
    courses: []
  },
  {
    id: 'architecture',
    name: 'Architecture - Built Environment Interiors',
    isActive: false,
    courses: []
  },
  {
    id: 'automation',
    name: 'Automation and Control Engineering',
    isActive: false,
    courses: []
  },
  {
    id: 'biomedical',
    name: 'Biomedical Engineering',
    isActive: false,
    courses: []
  },
  {
    id: 'building',
    name: 'Building and Architectural Engineering',
    isActive: false,
    courses: []
  },
  {
    id: 'chemical',
    name: 'Chemical Engineering',
    isActive: false,
    courses: []
  },
  {
    id: 'civil',
    name: 'Civil Engineering',
    isActive: false,
    courses: []
  },
  {
    id: 'computer',
    name: 'Computer Science and Engineering',
    isActive: false,
    courses: []
  },
  {
    id: 'design',
    name: 'Digital and Interaction Design',
    isActive: false,
    courses: []
  },
  {
    id: 'electrical',
    name: 'Electrical Engineering',
    isActive: false,
    courses: []
  },
  {
    id: 'energy',
    name: 'Energy Engineering',
    isActive: false,
    courses: []
  },
  {
    id: 'environmental',
    name: 'Civil, Environmental & Land Management Engineering',
    isActive: true,
    courses: [
      {
        id: 'soil-remediation',
        name: 'Soil Remediation',
        isActive: true,
        systemPrompt: `You are a Senior Environmental Engineer with 20+ years of experience in soil remediation. Your expertise includes:
- Chemical and biological processes for pollutant degradation
- Remediation technology selection (Biopiles, SVE, Pump-and-Treat, Phytoremediation, Thermal Desorption)
- System dimensioning and engineering calculations
- Site characterization and contamination assessment

Focus on technical/mathematical aspects. Provide formulas, calculations, and practical engineering guidance. Base your answers strictly on the uploaded technical documents when available. Always explain the scientific reasoning behind your recommendations.`
      },
      {
        id: 'eia',
        name: 'Environmental Impact Assessment',
        isActive: true,
        systemPrompt: `You are a Legal Consultant specializing in Environmental Law and EU Directives, with deep expertise in Environmental Impact Assessment procedures. Your knowledge covers:
- D.Lgs 152/2006 (Testo Unico Ambientale)
- EIA Directive 2011/92/EU and amendments
- Screening, Scoping, and full VIA procedures
- Studio di Impatto Ambientale (SIA) requirements
- DNSH principle and EU Taxonomy

Focus on regulatory/procedural aspects. Reference specific articles, annexes, and legal requirements. Base your answers strictly on the uploaded legal texts when available. Always cite the relevant legislation.`
      },
      {
        id: 'hydrology',
        name: 'Hydrology and Water Resources',
        isActive: false,
        systemPrompt: ''
      },
      {
        id: 'waste',
        name: 'Solid Waste Management',
        isActive: false,
        systemPrompt: ''
      },
      {
        id: 'wastewater',
        name: 'Wastewater Treatment Engineering',
        isActive: false,
        systemPrompt: ''
      },
      {
        id: 'ecology',
        name: 'Applied Ecology',
        isActive: false,
        systemPrompt: ''
      },
      {
        id: 'chemistry',
        name: 'Environmental Chemistry',
        isActive: false,
        systemPrompt: ''
      },
      {
        id: 'fluid',
        name: 'Fluid Mechanics',
        isActive: false,
        systemPrompt: ''
      },
      {
        id: 'geomatics',
        name: 'Geomatics and GIS',
        isActive: false,
        systemPrompt: ''
      },
      {
        id: 'slope',
        name: 'Slope Stability',
        isActive: false,
        systemPrompt: ''
      },
      {
        id: 'transport',
        name: 'Transport Planning and Economics',
        isActive: false,
        systemPrompt: ''
      }
    ]
  },
  {
    id: 'management',
    name: 'Management Engineering',
    isActive: false,
    courses: []
  },
  {
    id: 'mechanical',
    name: 'Mechanical Engineering',
    isActive: false,
    courses: []
  },
  {
    id: 'nuclear',
    name: 'Nuclear Engineering',
    isActive: false,
    courses: []
  },
  {
    id: 'space',
    name: 'Space Engineering',
    isActive: false,
    courses: []
  }
];

export default function PolimiHub() {
  const [selectedDegreeId, setSelectedDegreeId] = useState<string>('environmental');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('soil-remediation');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileContents, setFileContents] = useState<string>('');

  const selectedDegree = DEGREES.find(d => d.id === selectedDegreeId);
  const selectedCourse = selectedDegree?.courses.find(c => c.id === selectedCourseId);

  const handleDegreeChange = useCallback((degreeId: string) => {
    const degree = DEGREES.find(d => d.id === degreeId);
    
    if (!degree?.isActive) {
      toast.info('Demo Mode', {
        description: `Access to ${degree?.name} is restricted during the presentation.`
      });
      return;
    }
    
    setSelectedDegreeId(degreeId);
    // Select first active course in the degree
    const firstActiveCourse = degree.courses.find(c => c.isActive);
    if (firstActiveCourse) {
      setSelectedCourseId(firstActiveCourse.id);
    }
  }, []);

  const handleCourseChange = useCallback((courseId: string) => {
    const course = selectedDegree?.courses.find(c => c.id === courseId);
    
    if (!course?.isActive) {
      toast.info('Course Offline', {
        description: `Full dataset for ${course?.name} is currently processing. Please use the Demo Tracks.`
      });
      return;
    }
    
    setSelectedCourseId(courseId);
  }, [selectedDegree]);

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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <HistorySidebar />
        
        <div className="flex-1 flex overflow-hidden">
          <PolimiSidebar
            degrees={DEGREES}
            selectedDegreeId={selectedDegreeId}
            selectedCourseId={selectedCourseId}
            uploadedFiles={uploadedFiles}
            onDegreeChange={handleDegreeChange}
            onCourseChange={handleCourseChange}
            onFilesUpload={handleFilesUpload}
            onRemoveFile={handleRemoveFile}
          />
          
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
