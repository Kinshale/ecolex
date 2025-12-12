import { Header } from '@/components/Header';
import { HistorySidebar } from '@/components/HistorySidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, GraduationCap, Users, ExternalLink } from 'lucide-react';

const resources = [
  {
    icon: BookOpen,
    title: 'Course Materials',
    description: 'Access lecture notes, slides, and supplementary materials for environmental engineering courses.',
    action: 'Browse Materials',
  },
  {
    icon: FileText,
    title: 'Past Exams',
    description: 'Review previous examination papers and practice questions to prepare for assessments.',
    action: 'View Exams',
  },
  {
    icon: GraduationCap,
    title: 'Research Papers',
    description: 'Explore published research and thesis documents from Polimi environmental engineering department.',
    action: 'Explore Research',
  },
  {
    icon: Users,
    title: 'Study Groups',
    description: 'Connect with fellow students and join study groups for collaborative learning.',
    action: 'Find Groups',
  },
];

export default function PolimiHub() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <HistorySidebar />
        
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-6 md:p-8 lg:p-12">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-accent text-accent-foreground">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold">Polimi Course Hub</h1>
              </div>
              <p className="text-muted-foreground">
                Access specialized tools and documentation relevant to the Polimi environmental engineering curriculum.
              </p>
            </div>

            {/* Resource Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {resources.map((resource) => (
                <Card key={resource.title} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-muted">
                        <resource.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      {resource.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Coming Soon Notice */}
            <div className="mt-12 p-6 rounded-xl bg-muted/50 border border-border text-center">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">More resources coming soon!</span>
                <br />
                We're working on expanding the Polimi Course Hub with additional tools and materials.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
