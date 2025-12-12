import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { FeatureCard } from '@/components/FeatureCard';
import { Search, FileCheck, GraduationCap, Leaf } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 lg:p-12">
        <div className="max-w-4xl w-full mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              Environmental Compliance Platform
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              Welcome to <span className="text-gradient">EnviroComply</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cross-reference your project documents against regional, national, and European environmental regulations with AI-powered analysis.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={Search}
              title="Environmental Law Chat"
              description="Research and ask complex questions about specific environmental laws and norms across EU, Italy, and Lombardy."
              onClick={() => navigate('/law-chat')}
              variant="primary"
            />
            <FeatureCard
              icon={FileCheck}
              title="Document Analysis"
              description="Upload documents and receive AI-powered compliance analysis with detailed violation reports and suggestions."
              onClick={() => navigate('/document-analysis')}
              variant="secondary"
            />
            <FeatureCard
              icon={GraduationCap}
              title="Polimi Course Hub"
              description="Access specialized tools and documentation relevant to the Polimi environmental engineering curriculum."
              onClick={() => navigate('/polimi-hub')}
              variant="accent"
            />
          </div>

          {/* Quick Stats or Info */}
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-sm text-muted-foreground">Regulatory Levels</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold text-foreground">8</p>
              <p className="text-sm text-muted-foreground">Areas of Interest</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold text-foreground">AI</p>
              <p className="text-sm text-muted-foreground">Powered Analysis</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
