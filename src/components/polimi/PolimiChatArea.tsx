import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, BookOpen, Loader2 } from 'lucide-react';
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

interface PolimiChatAreaProps {
  course: CourseConfig | undefined;
  fileContents: string;
  hasFiles: boolean;
}

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
      // Build context with uploaded files
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

  if (!course) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Select a course to begin</p>
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
            <EmptyState courseName={course.name} hasFiles={hasFiles} />
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

function EmptyState({ courseName, hasFiles }: { courseName: string; hasFiles: boolean }) {
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
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <SuggestionChip text="Explain the key concepts" />
        <SuggestionChip text="Summarize the main topics" />
        <SuggestionChip text="Help me understand..." />
      </div>
    </div>
  );
}

function SuggestionChip({ text }: { text: string }) {
  return (
    <button className="px-3 py-1.5 text-xs rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">
      {text}
    </button>
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
