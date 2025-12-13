import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, BookOpen, Loader2, FlaskConical, Ruler, Map, Scale, FileText, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { CourseConfig } from '@/pages/PolimiHub';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  action: string;
}

interface PolimiChatAreaProps {
  course: CourseConfig | undefined;
  fileContents: string;
  hasFiles: boolean;
}

// Course-specific quick actions
const QUICK_ACTIONS: Record<string, QuickAction[]> = {
  'soil-remediation': [
    {
      label: '⚗️ Select Tech',
      icon: <FlaskConical className="w-3.5 h-3.5" />,
      action: 'Suggest the best remediation technology for a site contaminated by diesel in the unsaturated zone.'
    },
    {
      label: '📐 Sizing',
      icon: <Ruler className="w-3.5 h-3.5" />,
      action: 'Help me dimension a Biopile system for 500 m³ of soil. What formulas should I use?'
    },
    {
      label: '🗺️ Site Analysis',
      icon: <Map className="w-3.5 h-3.5" />,
      action: 'Analyze the pollutant distribution in the uploaded site map data.'
    }
  ],
  'eia': [
    {
      label: '⚖️ Screening Check',
      icon: <Scale className="w-3.5 h-3.5" />,
      action: 'Does this project require a full EIA (VIA) or just a Screening according to D.Lgs 152/2006?'
    },
    {
      label: '📄 SIA Content',
      icon: <FileText className="w-3.5 h-3.5" />,
      action: 'List the mandatory contents for the Environmental Impact Study (Studio di Impatto Ambientale).'
    },
    {
      label: '🇪🇺 EU Compliance',
      icon: <Globe className="w-3.5 h-3.5" />,
      action: 'Check if the project complies with the "Do No Significant Harm" (DNSH) principle.'
    }
  ]
};

export function PolimiChatArea({ course, fileContents, hasFiles }: PolimiChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Reset chat when course changes
  useEffect(() => {
    setMessages([]);
    setInput('');
  }, [course?.id]);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading || !course) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const contextPrefix = fileContents 
        ? `\n\n--- UPLOADED COURSE MATERIALS ---\n${fileContents}\n--- END OF MATERIALS ---\n\nBased on the above course materials and your expertise, please answer the following question:\n\n`
        : '';

      const response = await supabase.functions.invoke('polimi-chat', {
        body: {
          messages: messages.map(m => ({ role: m.role, content: m.content })).concat([
            { role: 'user', content: contextPrefix + userMessage.content }
          ]),
          systemPrompt: course.systemPrompt,
          courseName: course.name,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to get response');
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.data?.content || 'Sorry, I could not generate a response.',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, course, messages, fileContents]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleQuickAction = useCallback((action: string) => {
    setInput(action);
    textareaRef.current?.focus();
  }, []);

  if (!course) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Select a course to begin</p>
      </div>
    );
  }

  const quickActions = QUICK_ACTIONS[course.id] || [];

  return (
    <main className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border px-6 flex items-center gap-3 bg-card/30">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-semibold">Chatting with: {course.name} Assistant</h1>
          <p className="text-[10px] text-muted-foreground">
            {hasFiles ? 'Using your uploaded materials' : 'No course materials uploaded yet'}
          </p>
        </div>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <EmptyState 
              courseName={course.name} 
              hasFiles={hasFiles} 
              quickActions={quickActions}
              onQuickAction={handleQuickAction}
            />
          ) : (
            messages.map(message => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-card/30">
        <div className="max-w-3xl mx-auto">
          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {quickActions.map((qa, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 hover:bg-primary/10 hover:border-primary/50"
                  onClick={() => handleQuickAction(qa.action)}
                >
                  {qa.label}
                </Button>
              ))}
            </div>
          )}
          
          <div className="relative flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${course.name}...`}
              className="min-h-[44px] max-h-32 resize-none pr-12 bg-background"
              disabled={isLoading}
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </main>
  );
}

interface EmptyStateProps {
  courseName: string;
  hasFiles: boolean;
  quickActions: QuickAction[];
  onQuickAction: (action: string) => void;
}

function EmptyState({ courseName, hasFiles, quickActions, onQuickAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-6">
        <BookOpen className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-lg font-semibold mb-2">Ready to help with {courseName}</h2>
      <p className="text-muted-foreground text-sm max-w-md">
        {hasFiles 
          ? `I've loaded your course materials. Ask me anything about ${courseName}!`
          : `Upload course documents or ask a question about ${courseName}.`
        }
      </p>
      {quickActions.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {quickActions.map((qa, index) => (
            <button 
              key={index}
              onClick={() => onQuickAction(qa.action)}
              className="px-3 py-1.5 text-xs rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              {qa.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3',
          isUser 
            ? 'bg-primary text-primary-foreground rounded-br-md' 
            : 'bg-muted text-foreground rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
