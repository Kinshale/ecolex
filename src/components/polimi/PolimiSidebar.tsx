import { useCallback, useState } from 'react';
import { GraduationCap, Upload, X, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Degree } from '@/pages/PolimiHub';

interface PolimiSidebarProps {
  degrees: Degree[];
  selectedDegreeId: string;
  uploadedFiles: File[];
  onDegreeChange: (degreeId: string) => void;
  onFilesUpload: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
}

export function PolimiSidebar({
  degrees,
  selectedDegreeId,
  uploadedFiles,
  onDegreeChange,
  onFilesUpload,
  onRemoveFile,
}: PolimiSidebarProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf' || 
              file.type === 'text/plain' || 
              file.name.endsWith('.txt') ||
              file.name.endsWith('.md')
    );

    if (files.length > 0) {
      onFilesUpload(files);
    }
  }, [onFilesUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesUpload(files);
    }
    e.target.value = '';
  }, [onFilesUpload]);

  return (
    <aside className="w-72 border-r border-border bg-card/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <GraduationCap className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-semibold text-sm">Polimi Student AI Hub</h2>
        </div>
        <p className="text-xs text-muted-foreground">Regulatory assistant for Polimi students</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Degree Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Degree Program
            </label>
            <Select value={selectedDegreeId} onValueChange={onDegreeChange}>
              <SelectTrigger className="w-full bg-background text-sm h-9">
                <SelectValue placeholder="Select degree" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {degrees.map(degree => (
                  <SelectItem 
                    key={degree.id} 
                    value={degree.id} 
                    className="text-sm cursor-pointer"
                  >
                    {degree.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Knowledge Base Upload */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Reference Documents
            </label>
            <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
              Upload regulations or documents to contextualize responses
            </p>
            
            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 cursor-pointer",
                "hover:border-primary/50 hover:bg-primary/5",
                isDragOver 
                  ? "border-primary bg-primary/10 scale-[1.02]" 
                  : "border-border bg-muted/30"
              )}
            >
              <input
                type="file"
                accept=".pdf,.txt,.md,text/plain,application/pdf"
                multiple
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2 text-center">
                <div className={cn(
                  "p-2 rounded-full transition-colors",
                  isDragOver ? "bg-primary/20" : "bg-muted"
                )}>
                  <Upload className={cn(
                    "w-4 h-4 transition-colors",
                    isDragOver ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <p className="text-xs font-medium">
                    {isDragOver ? "Drop files here" : "Drag & drop files"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    PDF, TXT, MD supported
                  </p>
                </div>
              </div>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-1.5 mt-3">
                <p className="text-[10px] text-muted-foreground font-medium">
                  {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} uploaded
                </p>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/50 group"
                  >
                    <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs truncate flex-1" title={file.name}>
                      {file.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveFile(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/30">
        <p className="text-[10px] text-muted-foreground text-center">
          Powered by Lovable AI • Polimi Edition
        </p>
      </div>
    </aside>
  );
}
