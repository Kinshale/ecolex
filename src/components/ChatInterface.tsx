import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Citation } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatPrompt } from './ChatPrompt';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, FileText, Loader2, Scale, Upload, FileCheck, X, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { useLawSelectionStore } from '@/stores/lawSelectionStore';
interface ChatInterfaceProps {
  conversationId?: string;
}
export function ChatInterface({
  conversationId
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();
  const {
    selectedLaws,
    openModal,
    uploadedDocument,
    setUploadedDocument,
    resetSession
  } = useLawSelectionStore();
  const hasStartedChat = messages.length > 0;
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF document.',
          variant: 'destructive'
        });
        return;
      }
      setUploadedDocument(file);
    }
  };
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
      createdAt: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const systemContext = buildSystemContext();
      const {
        data,
        error
      } = await supabase.functions.invoke('chat', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          systemContext,
          selectedLaws: selectedLaws.map(law => ({
            id: law.id,
            title: law.title,
            short_name: law.short_name,
            pdf_url: law.pdf_url,
            jurisdiction: law.jurisdiction,
            category: law.category
          }))
        }
      });
      if (error) throw error;
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content,
        citations: data.citations || [],
        createdAt: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive'
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
  const handleNewChat = () => {
    setMessages([]);
    resetSession();
  };

  // Template prompts
  const templates = ["What are the main requirements of this regulation?", "Summarize the key compliance obligations", "What are the penalties for non-compliance?", "Compare these regulations' approaches to environmental protection"];

  // Initial centered view
  if (!hasStartedChat) {
    return <div className="flex flex-col items-center justify-center space-y-8 h-full pb-12">
        {/* Logo/Title */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl font-bold">Environmental Law Assistant</h1>
          <p className="text-muted-foreground text-xl">
            Select laws and upload documents to get context aware compliance insights.
          </p>
        </div>

        <div className='w-full px-4'>
          <ChatPrompt input={input} setInput={setInput} isLoading={isLoading} selectedLaws={selectedLaws} openModal={openModal} uploadedDocument={uploadedDocument} setUploadedDocument={setUploadedDocument} fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} handleKeyDown={handleKeyDown} handleSubmit={handleSubmit} />
        </div>

      </div>;
  }

  // Chat view with messages
  return <div className="flex flex-col h-full">

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map(message => <MessageBubble key={message.id} message={message} />)}
          {isLoading && <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <Card className="p-4 bg-muted/50 border-0">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching regulations...</span>
                </div>
              </Card>
            </div>}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bottom-0 left-0 right-0 w-full px-4 py-4" style={{
      zIndex: 50
    }}>
        <ChatPrompt input={input} setInput={setInput} isLoading={isLoading} selectedLaws={selectedLaws} openModal={openModal} uploadedDocument={uploadedDocument} setUploadedDocument={setUploadedDocument} fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} handleKeyDown={handleKeyDown} handleSubmit={handleSubmit} />
      </div>
    </div>;
}
function MessageBubble({
  message
}: {
  message: ChatMessage;
}) {
  const isUser = message.role === 'user';
  return <div className={cn('flex gap-3 chat-message', isUser && 'flex-row-reverse')}>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', isUser ? 'bg-accent/20' : 'bg-primary/10')}>
        {isUser ? <User className="w-4 h-4 text-accent" /> : <Bot className="w-4 h-4 text-primary" />}
      </div>

      <div className={cn('flex-1 space-y-2', isUser && 'text-right')}>
        <Card className={cn('inline-block p-4 max-w-[85%] border-0', isUser ? 'bg-primary text-primary-foreground' : 'bg-muted/50')}>
          <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </Card>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Sources:</p>
            <div className="flex flex-wrap gap-2">
              {message.citations.map((citation, idx) => <CitationBadge key={idx} citation={citation} />)}
            </div>
          </div>}
      </div>
    </div>;
}
function CitationBadge({
  citation
}: {
  citation: Citation;
}) {
  return <Badge variant="outline" className="text-xs py-1 px-2 bg-background hover:bg-muted cursor-pointer transition-colors">
      <FileText className="w-3 h-3 mr-1" />
      {citation.documentTitle}
      <span className="ml-1 text-muted-foreground">({citation.regulatoryScope})</span>
    </Badge>;
}