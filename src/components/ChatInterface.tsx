import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Citation } from '@/types';
import { Button } from '@/components/ui/button';
import { ChatPrompt } from './ChatPrompt';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, FileText, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { useLawSelectionStore } from '@/stores/lawSelectionStore';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/lib/auth';

interface ChatInterfaceProps {
  conversationId: string | null;
  onConversationChange: (id: string | null) => void;
}

export function ChatInterface({ conversationId, onConversationChange }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { selectedLaws, openModal, uploadedDocument, setUploadedDocument, resetSession } = useLawSelectionStore();
  const { messages: dbMessages, addMessage, clearMessages, isLoading: isLoadingMessages } = useChatMessages(conversationId);
  const { createConversation, updateConversationTitle } = useConversations();

  // Use DB messages if we have a conversation, otherwise use local messages
  const messages = conversationId ? dbMessages : localMessages;
  const hasStartedChat = messages.length > 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear local messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      setLocalMessages([]);
    }
  }, [conversationId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF document.',
          variant: 'destructive',
        });
        return;
      }
      setUploadedDocument(file);
    }
  };

  const buildSystemContext = () => {
    if (selectedLaws.length === 0) return '';
    const lawTitles = selectedLaws.map((law) => law.title).join(', ');
    const lawUrls = selectedLaws.map((law) => `${law.short_name}: ${law.pdf_url}`).join('\n');
    return `The user is researching the following laws: ${lawTitles}. 
Use these PDFs as your primary source of truth:
${lawUrls}

When answering, always cite the specific law and article when applicable.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    const userContent = input.trim();
    setInput('');
    setIsLoading(true);

    let activeConversationId = conversationId;

    try {
      // Create a new conversation if we don't have one
      if (!activeConversationId) {
        const newConversation = await createConversation('New Chat');
        if (!newConversation) {
          throw new Error('Failed to create conversation');
        }
        activeConversationId = newConversation.id;
        onConversationChange(activeConversationId);
      }

      // Add user message to the database
      const userMessage = await addMessage(activeConversationId, 'user', userContent);
      if (!userMessage) {
        throw new Error('Failed to save user message');
      }

      // Build message history for the API
      const allMessages = [...messages, userMessage];
      
      const systemContext = buildSystemContext();
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemContext,
          selectedLaws: selectedLaws.map((law) => ({
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

      // Add assistant message to the database
      await addMessage(activeConversationId, 'assistant', data.content, data.citations || []);

      // Update conversation title based on first message
      if (messages.length === 0) {
        const title = userContent.slice(0, 50) + (userContent.length > 50 ? '...' : '');
        await updateConversationTitle(activeConversationId, title);
      }
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

  const handleNewChat = () => {
    onConversationChange(null);
    setLocalMessages([]);
    clearMessages();
    resetSession();
  };

  // Initial centered view
  if (!hasStartedChat && !isLoadingMessages) {
    return (
      <div className="flex flex-col items-center justify-center space-y-8 h-full pb-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl font-bold">Environmental Law Assistant</h1>
          <p className="text-muted-foreground text-xl">
            Select laws and upload documents to get context aware compliance insights.
          </p>
        </div>

        <div className="w-full px-4">
          <ChatPrompt
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            selectedLaws={selectedLaws}
            openModal={openModal}
            uploadedDocument={uploadedDocument}
            setUploadedDocument={setUploadedDocument}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            handleKeyDown={handleKeyDown}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Chat view with messages
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-4xl mx-auto">
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
      </ScrollArea>

      <div className="bottom-0 left-0 right-0 w-full px-4 py-4" style={{ zIndex: 50 }}>
        <ChatPrompt
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          selectedLaws={selectedLaws}
          openModal={openModal}
          uploadedDocument={uploadedDocument}
          setUploadedDocument={setUploadedDocument}
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
          handleKeyDown={handleKeyDown}
          handleSubmit={handleSubmit}
        />
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
        {isUser ? <User className="w-4 h-4 text-accent" /> : <Bot className="w-4 h-4 text-primary" />}
      </div>

      <div className={cn('flex-1 space-y-2', isUser && 'text-right')}>
        <Card
          className={cn(
            'inline-block p-4 max-w-[85%] border-0',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </Card>

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
