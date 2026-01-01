import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { GraduationCap, MessageSquare, PanelLeftClose, PanelLeft, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
interface ChatSession {
  id: string;
  title: string;
  type: 'chat' | 'analysis';
  createdAt: Date;
}
export function HistorySidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user
  } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sessions] = useState<ChatSession[]>([{
    id: '1',
    title: 'Water regulations inquiry',
    type: 'chat',
    createdAt: new Date()
  }, {
    id: '2',
    title: 'Air quality compliance',
    type: 'chat',
    createdAt: new Date(Date.now() - 86400000)
  }, {
    id: '3',
    title: 'Waste management EU',
    type: 'chat',
    createdAt: new Date(Date.now() - 172800000)
  }, {
    id: '4',
    title: 'Noise pollution check',
    type: 'chat',
    createdAt: new Date(Date.now() - 259200000)
  }]);
  if (!user) return null;
  if (isCollapsed) {
    return <aside className="w-12 bg-sidebar border-r border-sidebar-border flex flex-col h-[calc(100vh-4rem)]">
        <div className="p-2">
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(false)} className="w-8 h-8">
            <PanelLeft className="w-4 h-4" />
          </Button>
        </div>
      </aside>;
  }
  return <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-[calc(100vh-4rem)]">
      {/* Collapse Button */}
      <div className="p-3 flex justify-end">
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)} className="h-8 w-8">
          <PanelLeftClose className="w-4 h-4" />
        </Button>
      </div>

      {/* Activity Navigation */}
      <div className="px-3 pb-3 space-y-2">
        <Button variant="outline" className={cn("w-full justify-start gap-2 bg-sidebar-accent/50 border-sidebar-border hover:bg-sidebar-accent", location.pathname === '/law-chat' && "bg-primary/10 border-primary/30")} onClick={() => navigate('/law-chat')}>
          <Plus className="w-4 h-4" />
          <span className="text-sm">New Chat </span>
        </Button>
        <Button variant="outline" className={cn("w-full justify-start gap-2 bg-sidebar-accent/50 border-sidebar-border hover:bg-sidebar-accent", location.pathname === '/polimi-hub' && "bg-primary/10 border-primary/30")} onClick={() => navigate('/polimi-hub')}>
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
          <div className="space-y-0.5">
            {sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(session => <Button key={session.id} variant="ghost" className="w-full justify-start gap-2 h-9 px-2 text-sm text-muted-foreground hover:text-sidebar-foreground">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">{session.title}</span>
                </Button>)}
          </div>
        </ScrollArea>
      </div>
    </aside>;
}