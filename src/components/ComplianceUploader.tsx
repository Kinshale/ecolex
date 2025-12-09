import { useState, useCallback } from 'react';
import { FilterState, ComplianceReport, Violation, Suggestion, REGULATORY_SCOPE_LABELS, AREA_OF_INTEREST_LABELS } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  FileUp,
  Lightbulb,
  Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ComplianceUploaderProps {
  filters: FilterState;
}

export function ComplianceUploader({ filters }: ComplianceUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx'))) {
      setFile(droppedFile);
      setReport(null);
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF or DOCX file.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setReport(null);
    }
  };

  const analyzeDocument = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      // Read file content
      const reader = new FileReader();
      const fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('analyze-compliance', {
        body: {
          fileName: file.name,
          fileContent,
          filters: {
            regulatoryScopes: filters.regulatoryScopes,
            areaOfInterest: filters.areaOfInterest,
          },
        },
      });

      if (error) throw error;

      setProgress(100);
      setReport(data as ComplianceReport);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: 'Failed to analyze document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setReport(null);
    setProgress(0);
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center animate-fade-in">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-4">
              <Scale className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Compliance Analyzer</h2>
            <p className="text-muted-foreground">
              Upload a document to check compliance against {filters.regulatoryScopes.length > 0 
                ? filters.regulatoryScopes.map(s => REGULATORY_SCOPE_LABELS[s]).join(', ')
                : 'all'} regulations
              {filters.areaOfInterest && ` in ${AREA_OF_INTEREST_LABELS[filters.areaOfInterest]}`}
            </p>
          </div>

          {/* Upload Zone */}
          {!file && (
            <Card
              className={cn(
                'border-2 border-dashed transition-all cursor-pointer animate-slide-up',
                isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              )}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CardContent className="py-16">
                <label className="flex flex-col items-center cursor-pointer">
                  <div className="p-4 rounded-2xl bg-muted mb-4">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium mb-1">Drop your document here</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                  <p className="text-xs text-muted-foreground">Supports PDF and DOCX files</p>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </CardContent>
            </Card>
          )}

          {/* File Selected */}
          {file && !report && (
            <Card className="animate-slide-up">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetUpload}>
                    Change
                  </Button>
                </div>

                {isAnalyzing ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Analyzing document...</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      Checking against environmental regulations
                    </p>
                  </div>
                ) : (
                  <Button onClick={analyzeDocument} className="w-full" size="lg">
                    <FileUp className="w-4 h-4 mr-2" />
                    Analyze Compliance
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Report */}
          {report && (
            <div className="space-y-4 animate-slide-up">
              {/* Status Card */}
              <Card className={cn(
                'border-2',
                report.status === 'pass' ? 'border-success/50 bg-success/5' : 'border-destructive/50 bg-destructive/5'
              )}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    {report.status === 'pass' ? (
                      <div className="p-3 rounded-full bg-success/20">
                        <CheckCircle2 className="w-8 h-8 text-success" />
                      </div>
                    ) : (
                      <div className="p-3 rounded-full bg-destructive/20">
                        <XCircle className="w-8 h-8 text-destructive" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold">
                        {report.status === 'pass' ? 'Compliant' : 'Non-Compliant'}
                      </h3>
                      <p className="text-muted-foreground">{report.documentName}</p>
                    </div>
                  </div>
                  {report.summary && (
                    <p className="mt-4 text-sm text-muted-foreground">{report.summary}</p>
                  )}
                </CardContent>
              </Card>

              {/* Violations */}
              {report.violations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Violations Found ({report.violations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {report.violations.map((violation, idx) => (
                      <ViolationItem key={idx} violation={violation} />
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              {report.suggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="w-5 h-5 text-accent" />
                      Recommended Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {report.suggestions.map((suggestion, idx) => (
                      <SuggestionItem key={idx} suggestion={suggestion} />
                    ))}
                  </CardContent>
                </Card>
              )}

              <Button onClick={resetUpload} variant="outline" className="w-full">
                Analyze Another Document
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ViolationItem({ violation }: { violation: Violation }) {
  const severityColors = {
    low: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    medium: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    high: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm">{violation.description}</p>
        <Badge variant="outline" className={cn('text-xs', severityColors[violation.severity])}>
          {violation.severity}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        <span className="font-medium">Regulation:</span> {violation.regulation}
      </p>
      {violation.location && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Location:</span> {violation.location}
        </p>
      )}
    </div>
  );
}

function SuggestionItem({ suggestion }: { suggestion: Suggestion }) {
  return (
    <div className="p-4 rounded-lg bg-accent/5 border border-accent/10 space-y-2">
      <p className="font-medium text-sm">{suggestion.title}</p>
      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
      <p className="text-xs text-muted-foreground">
        <span className="font-medium">Related regulation:</span> {suggestion.regulation}
      </p>
    </div>
  );
}
