import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { GraduationCap, MessageSquare, PanelLeftClose, PanelLeft, Plus, Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConversations, Conversation } from '@/hooks/useConversations';
import { useToast } from '@/hooks/use-toast';

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
  const { conversations, isLoading, updateConversationTitle, deleteConversation } = useConversations();
  const { toast } = useToast();
  
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newTitle, setNewTitle] = useState('');

  if (!user) return null;

  const handleRename = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setNewTitle(conversation.title || '');
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = async () => {
    if (!selectedConversation || !newTitle.trim()) return;
    
    const success = await updateConversationTitle(selectedConversation.id, newTitle.trim());
    setRenameDialogOpen(false);
    setSelectedConversation(null);
    
    if (success) {
      toast({ title: 'Chat renamed' });
    } else {
      toast({ title: 'Failed to rename chat', variant: 'destructive' });
    }
  };

  const handleDelete = async (conversation: Conversation) => {
    const success = await deleteConversation(conversation.id);
    if (success) {
      if (activeConversationId === conversation.id) {
        onConversationSelect(null);
      }
      toast({ title: 'Chat deleted' });
    } else {
      toast({ title: 'Failed to delete chat', variant: 'destructive' });
    }
  };

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
    <>
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
                  <div
                    key={conversation.id}
                    className={cn(
                      'group flex items-center gap-1 rounded-md hover:bg-sidebar-accent min-w-0',
                      activeConversationId === conversation.id && 'bg-primary/10'
                    )}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        'flex-1 justify-start gap-2 h-9 px-2 text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-transparent min-w-0 text-left',
                        activeConversationId === conversation.id && 'text-sidebar-foreground'
                      )}
                      onClick={() => {
                        navigate('/law-chat');
                        onConversationSelect(conversation.id);
                      }}
                    >
                      <span className="truncate block min-w-0 flex-1 text-left">{conversation.title || 'New Chat'}</span>
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleRename(conversation)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(conversation)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </aside>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter new name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRenameSubmit();
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
