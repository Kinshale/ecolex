import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { GraduationCap, MessageSquare, PanelLeftClose, PanelLeft, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConversations, Conversation } from '@/hooks/useConversations';

interface HistorySidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeConversationId: string | null;
  onConversationSelect: (id: string | null) => void;
}

export function HistorySidebar({
  isCollapsed,
  onToggleCollapse,
  activeConversationId,
  onConversationSelect,
}: HistorySidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { conversations, isLoading } = useConversations();

  if (!user) return null;

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-sidebar border-r border-sidebar-border flex flex-col h-[calc(100vh-4rem)]">
        <div className="p-2">
          <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="w-8 h-8">
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
        <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-8 w-8">
          <PanelLeftClose className="w-4 h-4" />
        </Button>
      </div>

      {/* Activity Navigation */}
      <div className="px-3 pb-3 space-y-2">
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start gap-2 bg-sidebar-accent/50 border-sidebar-border hover:bg-sidebar-accent',
            location.pathname === '/law-chat' && !activeConversationId && 'bg-primary/10 border-primary/30'
          )}
          onClick={() => {
            navigate('/law-chat');
            onConversationSelect(null);
          }}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">New Chat</span>
        </Button>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start gap-2 bg-sidebar-accent/50 border-sidebar-border hover:bg-sidebar-accent',
            location.pathname === '/polimi-hub' && 'bg-primary/10 border-primary/30'
          )}
          onClick={() => navigate('/polimi-hub')}
        >
          <GraduationCap className="w-4 h-4" />
          <span className="text-sm">Polimi Course Hub</span>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No conversations yet</p>
          ) : (
            <div className="space-y-0.5">
              {conversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-2 h-9 px-2 text-sm text-muted-foreground hover:text-sidebar-foreground',
                    activeConversationId === conversation.id && 'bg-primary/10 text-sidebar-foreground'
                  )}
                  onClick={() => {
                    navigate('/law-chat');
                    onConversationSelect(conversation.id);
                  }}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">{conversation.title || 'New Chat'}</span>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </aside>
  );
}
