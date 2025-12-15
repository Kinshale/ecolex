import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, BookOpen, Loader2, Scale, FileText, Globe, Building, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

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
  degreeName: string | undefined;
  fileContents: string;
  hasFiles: boolean;
}

// Quick actions focused on regulatory topics
const QUICK_ACTIONS: QuickAction[] = [
  {
    label: '⚖️ Normativa VIA',
    icon: <Scale className="w-3.5 h-3.5" />,
    action: 'Quali sono i contenuti obbligatori dello Studio di Impatto Ambientale secondo il D.Lgs 152/2006?'
  },
  {
    label: '📄 D.Lgs 152/2006',
    icon: <FileText className="w-3.5 h-3.5" />,
    action: 'Spiega la struttura del Testo Unico Ambientale (D.Lgs 152/2006) e le sue parti principali.'
  },
  {
    label: '🇪🇺 Direttive EU',
    icon: <Globe className="w-3.5 h-3.5" />,
    action: 'Quali sono le principali direttive europee in materia ambientale recepite in Italia?'
  },
  {
    label: '🏗️ Edilizia',
    icon: <Building className="w-3.5 h-3.5" />,
    action: 'Quali autorizzazioni sono necessarie per un intervento edilizio secondo il DPR 380/2001?'
  },
  {
    label: '🛡️ Sicurezza',
    icon: <Shield className="w-3.5 h-3.5" />,
    action: 'Cosa prevede la Direttiva Seveso III per gli stabilimenti a rischio di incidente rilevante?'
  }
];

export function PolimiChatArea({ degreeName, fileContents, hasFiles }: PolimiChatAreaProps) {
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

  // Reset chat when degree changes
  useEffect(() => {
    setMessages([]);
    setInput('');
  }, [degreeName]);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading || !degreeName) return;

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
        ? `\n\n--- DOCUMENTI CARICATI ---\n${fileContents}\n--- FINE DOCUMENTI ---\n\nBasandoti sui documenti sopra e sulla tua competenza normativa, rispondi alla seguente domanda:\n\n`
        : '';

      const response = await supabase.functions.invoke('polimi-chat', {
        body: {
          messages: messages.map(m => ({ role: m.role, content: m.content })).concat([
            { role: 'user', content: contextPrefix + userMessage.content }
          ]),
          systemPrompt: '',
          courseName: degreeName,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to get response');
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.data?.content || 'Mi dispiace, non sono riuscito a generare una risposta.',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Si è verificato un errore. Per favore riprova.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, degreeName, messages, fileContents]);

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

  if (!degreeName) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Seleziona un corso di laurea per iniziare</p>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border px-6 flex items-center gap-3 bg-card/30">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-semibold">Assistente Normativo: {degreeName}</h1>
          <p className="text-[10px] text-muted-foreground">
            {hasFiles ? 'Utilizzo i documenti caricati' : 'Nessun documento caricato'}
          </p>
        </div>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <EmptyState 
              degreeName={degreeName} 
              hasFiles={hasFiles} 
              quickActions={QUICK_ACTIONS}
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
              <span className="text-sm">Elaborazione in corso...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-card/30">
        <div className="max-w-3xl mx-auto">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK_ACTIONS.map((qa, index) => (
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
          
          <div className="relative flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Chiedi informazioni su normative ambientali, urbanistiche, edilizie..."
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
            Premi Invio per inviare, Shift+Invio per nuova riga
          </p>
        </div>
      </div>
    </main>
  );
}

interface EmptyStateProps {
  degreeName: string;
  hasFiles: boolean;
  quickActions: QuickAction[];
  onQuickAction: (action: string) => void;
}

function EmptyState({ degreeName, hasFiles, quickActions, onQuickAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-6">
        <BookOpen className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-lg font-semibold mb-2">Assistente Normativo per {degreeName}</h2>
      <p className="text-muted-foreground text-sm max-w-md mb-2">
        {hasFiles 
          ? 'Ho caricato i tuoi documenti. Chiedimi informazioni su normative e regolamenti!'
          : 'Carica documenti normativi o chiedimi informazioni su leggi ambientali, urbanistiche, edilizie e di sicurezza.'
        }
      </p>
      <p className="text-muted-foreground text-xs max-w-md">
        Focus su: D.Lgs 152/2006 • Direttive EU • Regolamenti edilizi • Sicurezza industriale
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
            : 'bg-muted text-foreground rounded-bl-md prose prose-sm dark:prose-invert max-w-none'
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : (
          <div className="text-sm leading-relaxed [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>p:last-child]:mb-0">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
