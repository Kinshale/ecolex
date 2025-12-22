import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Citation } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, FileText, Loader2, Scale, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLawSelectionStore } from '@/stores/lawSelectionStore';

interface ChatInterfaceProps {
  conversationId?: string;
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { selectedLaws, openModal, hasSelectedLawsForSession } = useLawSelectionStore();

  // Auto-open modal when starting a new session without selected laws
  useEffect(() => {
    if (!hasSelectedLawsForSession && messages.length === 0) {
      openModal();
    }
  }, [hasSelectedLawsForSession, messages.length, openModal]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Build system context from selected laws
  const buildSystemContext = () => {
    if (selectedLaws.length === 0) return '';
    
    const lawTitles = selectedLaws.map(law => law.title).join(', ');
    const lawUrls = selectedLaws.map(law => `${law.short_name}: ${law.pdf_url}`).join('\n');
    
    return `The user is researching the following laws: ${lawTitles}. 
Use these PDFs as your primary source of truth:
${lawUrls}

When answering, always cite the specific law and article when applicable.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const systemContext = buildSystemContext();
      
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          systemContext,
          selectedLaws: selectedLaws.map(law => ({
            id: law.id,
            title: law.title,
            short_name: law.short_name,
            pdf_url: law.pdf_url,
            jurisdiction: law.jurisdiction,
            category: law.category,
          })),
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content,
        citations: data.citations || [],
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Selected Laws Banner */}
      {selectedLaws.length > 0 && (
        <div className="border-b bg-muted/30 px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <Scale className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{selectedLaws.length} Laws Selected</span>
          <div className="flex-1 flex gap-1 overflow-x-auto">
            {selectedLaws.slice(0, 4).map((law) => (
              <Badge key={law.id} variant="secondary" className="text-xs flex-shrink-0">
                {law.short_name}
              </Badge>
            ))}
            {selectedLaws.length > 4 && (
              <Badge variant="outline" className="text-xs flex-shrink-0">
                +{selectedLaws.length - 4}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={openModal} className="flex-shrink-0">
            Edit Selection
          </Button>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md animate-fade-in">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Compliance Assistant</h3>
              <p className="text-muted-foreground mb-4">
                {selectedLaws.length > 0
                  ? `You have ${selectedLaws.length} laws selected. Ask questions about these regulations.`
                  : 'Select laws and regulations to start your consultation.'}
              </p>
              {selectedLaws.length === 0 && (
                <Button onClick={openModal}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Select Laws
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <Card className="p-4 bg-muted/50 border-0">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching regulations...</span>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-background">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={openModal}
              className="flex-shrink-0 h-10 w-10"
              title="Select Laws"
            >
              <Scale className="w-4 h-4" />
            </Button>
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about environmental regulations..."
                className="min-h-[56px] max-h-32 pr-14 resize-none bg-muted/30 border-border/50 focus:border-primary"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 bottom-2"
                disabled={!input.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {selectedLaws.length > 0
              ? `Consulting ${selectedLaws.length} selected laws`
              : 'Select laws to get context-aware responses'}
          </p>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 chat-message', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-accent/20' : 'bg-primary/10'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-accent" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>

      <div className={cn('flex-1 space-y-2', isUser && 'text-right')}>
        <Card
          className={cn(
            'inline-block p-4 max-w-[85%] border-0',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
          )}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        </Card>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Sources:</p>
            <div className="flex flex-wrap gap-2">
              {message.citations.map((citation, idx) => (
                <CitationBadge key={idx} citation={citation} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CitationBadge({ citation }: { citation: Citation }) {
  return (
    <Badge
      variant="outline"
      className="text-xs py-1 px-2 bg-background hover:bg-muted cursor-pointer transition-colors"
    >
      <FileText className="w-3 h-3 mr-1" />
      {citation.documentTitle}
      <span className="ml-1 text-muted-foreground">({citation.regulatoryScope})</span>
    </Badge>
  );
}
