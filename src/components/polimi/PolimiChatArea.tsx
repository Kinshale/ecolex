import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, Loader2, Bot, User, Scale, FileText, Globe, Building, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
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
    label: '⚖️ EIA Regulations',
    icon: <Scale className="w-3.5 h-3.5" />,
    action: 'What are the mandatory contents of an Environmental Impact Study according to D.Lgs 152/2006?'
  },
  {
    label: '📄 D.Lgs 152/2006',
    icon: <FileText className="w-3.5 h-3.5" />,
    action: 'Explain the structure of the Italian Environmental Code (D.Lgs 152/2006) and its main parts.'
  },
  {
    label: '🇪🇺 EU Directives',
    icon: <Globe className="w-3.5 h-3.5" />,
    action: 'What are the main EU environmental directives transposed into Italian law?'
  },
  {
    label: '🏗️ Building',
    icon: <Building className="w-3.5 h-3.5" />,
    action: 'What permits are required for a building project according to DPR 380/2001?'
  },
  {
    label: '🛡️ Safety',
    icon: <Shield className="w-3.5 h-3.5" />,
    action: 'What does the Seveso III Directive require for major accident hazard establishments?'
  }
];

export function PolimiChatArea({ degreeName, fileContents, hasFiles }: PolimiChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasStartedChat = messages.length > 0;

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
        ? `\n\n--- UPLOADED DOCUMENTS ---\n${fileContents}\n--- END OF DOCUMENTS ---\n\nBased on the documents above and your regulatory expertise, answer the following question:\n\n`
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
        content: response.data?.content || 'Sorry, I could not generate a response.',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'An error occurred. Please try again.',
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
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Select a degree program to begin</p>
      </div>
    );
  }

  // Initial centered view (matching ChatInterface style)
  if (!hasStartedChat) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center space-y-8 pb-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl font-bold">Regulatory Assistant</h1>
          <p className="text-muted-foreground text-xl">
            {hasFiles 
              ? 'Documents loaded. Ask me about regulations and laws!'
              : 'Ask about environmental, urban planning, building, and safety regulations.'
            }
          </p>
          <p className="text-muted-foreground text-sm">
            Course: {degreeName}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl px-4">
          {QUICK_ACTIONS.map((qa, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1.5 hover:bg-primary/10 hover:border-primary/50"
              onClick={() => handleQuickAction(qa.action)}
            >
              {qa.label}
            </Button>
          ))}
        </div>

        {/* Input Area */}
        <div className="w-full max-w-3xl px-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about environmental, urban planning, building, or safety regulations..."
              className="min-h-[56px] max-h-40 resize-none pr-14 bg-background border-border"
              disabled={isLoading}
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="absolute right-2 bottom-2 h-9 w-9"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </main>
    );
  }

  // Chat view with messages (matching ChatInterface style)
  return (
    <main className="flex-1 flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map(message => (
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
      </ScrollArea>

      {/* Bottom Input Area */}
      <div className="w-full px-4 py-4" style={{ zIndex: 50 }}>
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about environmental, urban planning, building, or safety regulations..."
              className="min-h-[56px] max-h-40 resize-none pr-14 bg-background border-border"
              disabled={isLoading}
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="absolute right-2 bottom-2 h-9 w-9"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn('flex gap-3 chat-message', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-accent/20' : 'bg-primary/10'
        )}
      >
        {isUser ? <User className="w-4 h-4 text-accent" /> : <Bot className="w-4 h-4 text-primary" />}
      </div>

      <div className={cn('flex-1 space-y-2', isUser && 'text-right')}>
        <Card
          className={cn(
            'inline-block p-4 max-w-[85%] border-0',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
          )}
        >
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {isUser ? (
              message.content
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
