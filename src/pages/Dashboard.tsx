import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { FeatureCard } from '@/components/FeatureCard';
import { Search, FileCheck, GraduationCap, Leaf, Shield, Zap } from 'lucide-react';
export default function Dashboard() {
  const navigate = useNavigate();
  const handleFeatureClick = () => {
    // All features require authentication - redirect to auth
    navigate('/auth');
  };
  return <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative py-20 px-6 md:px-8 lg:px-12 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative max-w-5xl mx-auto text-center">
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Navigate Environmental <br />
              <span className="text-gradient">Regulations with AI</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Cross-reference your project documents against regional, national, and European environmental regulations with AI-powered analysis.
            </p>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-12 px-6 md:px-8 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard icon={Search} title="Environmental Law Chat" description="Research and ask complex questions about specific environmental laws and norms across EU, Italy, and Lombardy." onClick={handleFeatureClick} variant="primary" />
              <FeatureCard icon={FileCheck} title="Document Analysis" description="Upload documents and receive AI-powered compliance analysis with detailed violation reports and suggestions." onClick={handleFeatureClick} variant="secondary" />
              <FeatureCard icon={GraduationCap} title="Polimi Course Hub" description="Access specialized tools and documentation relevant to the Polimi environmental engineering curriculum." onClick={handleFeatureClick} variant="accent" />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-6 md:px-8 lg:px-12 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Why Choose EnviroComply?
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Comprehensive Coverage</h3>
                <p className="text-sm text-muted-foreground">
                  Access regulations from EU, Italian national, and Lombardy regional levels in one place.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex p-3 rounded-xl bg-accent/10 text-accent mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get instant compliance checks and detailed reports powered by advanced AI models.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Built for Polimi</h3>
                <p className="text-sm text-muted-foreground">
                  Tailored specifically for Polimi environmental engineering students and professionals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-primary" />
            <span>EnviroComply</span>
          </div>
          <p>© 2024  EnviroComply
        </p>
        </div>
      </footer>
    </div>;
}