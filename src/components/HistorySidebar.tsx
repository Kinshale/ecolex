import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, PanelLeftClose, PanelLeft, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export function HistorySidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch conversations from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
      } else {
        setConversations(data || []);
      }
      setIsLoading(false);
    };

    fetchConversations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleDeleteConversation = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    navigate(`/law-chat?conversation=${conversationId}`);
  };

  if (!user) return null;

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-sidebar border-r border-sidebar-border flex flex-col h-[calc(100vh-4rem)]">
        <div className="p-2">
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(false)} className="w-8 h-8">
            <PanelLeft className="w-4 h-4" />
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-[calc(100vh-4rem)]">
      {/* Collapse Button */}
      <div className="p-3 flex justify-end">
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)} className="h-8 w-8">
          <PanelLeftClose className="w-4 h-4" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pb-3">
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 bg-sidebar-accent/50 border-sidebar-border hover:bg-sidebar-accent",
            location.pathname === '/law-chat' && !location.search && "bg-primary/10 border-primary/30"
          )}
          onClick={() => navigate('/law-chat')}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">New Chat</span>
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* History */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-3 py-2">
          <span className="font-medium text-muted-foreground uppercase tracking-wider text-sm">
            Chat History
          </span>
        </div>

        <ScrollArea className="flex-1 px-3 pb-3">
          <div className="space-y-0.5">
            {isLoading ? (
              <div className="text-sm text-muted-foreground px-2 py-4">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-sm text-muted-foreground px-2 py-4">No conversations yet</div>
            ) : (
              conversations.map((conversation) => (
                <div key={conversation.id} className="group relative">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-9 px-2 text-sm text-muted-foreground hover:text-sidebar-foreground pr-8"
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span className="truncate">{conversation.title}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteConversation(e, conversation.id)}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
