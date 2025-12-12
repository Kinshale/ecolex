import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Plus,
  MessageSquare,
  FileCheck,
  FolderPlus,
  ChevronRight,
  MoreHorizontal,
  Settings,
  HelpCircle,
  CreditCard,
  Pencil,
  Trash2,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatSession {
  id: string;
  title: string;
  type: 'chat' | 'analysis';
  createdAt: Date;
  folderId?: string;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  isOpen: boolean;
}

const FOLDER_COLORS = [
  { name: 'Teal', value: 'bg-primary' },
  { name: 'Amber', value: 'bg-accent' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Rose', value: 'bg-rose-500' },
  { name: 'Green', value: 'bg-emerald-500' },
];

export function HistorySidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [folders, setFolders] = useState<Folder[]>([
    { id: '1', name: 'Environmental Projects', color: 'bg-primary', isOpen: true },
    { id: '2', name: 'Compliance Reports', color: 'bg-accent', isOpen: false },
  ]);
  
  const [sessions] = useState<ChatSession[]>([
    { id: '1', title: 'Water regulations inquiry', type: 'chat', createdAt: new Date(), folderId: '1' },
    { id: '2', title: 'Air quality compliance', type: 'analysis', createdAt: new Date(), folderId: '1' },
    { id: '3', title: 'Waste management EU', type: 'chat', createdAt: new Date(), folderId: '2' },
    { id: '4', title: 'Recent chat', type: 'chat', createdAt: new Date() },
  ]);

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleNewChat = () => {
    navigate('/');
  };

  const toggleFolder = (folderId: string) => {
    setFolders(prev => prev.map(f => 
      f.id === folderId ? { ...f, isOpen: !f.isOpen } : f
    ));
  };

  const addFolder = () => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: 'New Folder',
      color: FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)].value,
      isOpen: true,
    };
    setFolders(prev => [...prev, newFolder]);
    setEditingFolderId(newFolder.id);
    setEditingName(newFolder.name);
  };

  const renameFolder = (folderId: string) => {
    setFolders(prev => prev.map(f =>
      f.id === folderId ? { ...f, name: editingName } : f
    ));
    setEditingFolderId(null);
  };

  const deleteFolder = (folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
  };

  const changeColor = (folderId: string, color: string) => {
    setFolders(prev => prev.map(f =>
      f.id === folderId ? { ...f, color } : f
    ));
  };

  const unfolderedSessions = sessions.filter(s => !s.folderId);

  if (!user) return null;

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={handleNewChat}
          variant="outline"
          className="w-full justify-start gap-2 bg-sidebar-accent/50 border-sidebar-border hover:bg-sidebar-accent"
        >
          <Plus className="w-4 h-4" />
          New Activity
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <div className="p-3 space-y-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 text-sidebar-foreground",
            location.pathname === '/' && "bg-sidebar-accent"
          )}
          onClick={() => navigate('/')}
        >
          <Home className="w-4 h-4" />
          Dashboard
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* History */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            History
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={addFolder}
          >
            <FolderPlus className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          {/* Folders */}
          {folders.map((folder) => (
            <Collapsible
              key={folder.id}
              open={folder.isOpen}
              onOpenChange={() => toggleFolder(folder.id)}
              className="mb-1"
            >
              <div className="flex items-center group">
                <CollapsibleTrigger className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent/50 text-sm">
                  <ChevronRight className={cn(
                    "w-3 h-3 transition-transform",
                    folder.isOpen && "rotate-90"
                  )} />
                  <div className={cn("w-2 h-2 rounded-full", folder.color)} />
                  {editingFolderId === folder.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => renameFolder(folder.id)}
                      onKeyDown={(e) => e.key === 'Enter' && renameFolder(folder.id)}
                      className="h-5 text-xs px-1 bg-background"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="truncate text-sidebar-foreground">{folder.name}</span>
                  )}
                </CollapsibleTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => {
                      setEditingFolderId(folder.id);
                      setEditingName(folder.name);
                    }}>
                      <Pencil className="w-3 h-3 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <DropdownMenuItem>
                          <Palette className="w-3 h-3 mr-2" />
                          Color
                        </DropdownMenuItem>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" className="w-32">
                        {FOLDER_COLORS.map((c) => (
                          <DropdownMenuItem
                            key={c.value}
                            onClick={() => changeColor(folder.id, c.value)}
                          >
                            <div className={cn("w-3 h-3 rounded-full mr-2", c.value)} />
                            {c.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteFolder(folder.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CollapsibleContent className="pl-4">
                {sessions
                  .filter(s => s.folderId === folder.id)
                  .map((session) => (
                    <Button
                      key={session.id}
                      variant="ghost"
                      className="w-full justify-start gap-2 h-8 px-2 text-sm text-muted-foreground hover:text-sidebar-foreground"
                    >
                      {session.type === 'chat' ? (
                        <MessageSquare className="w-3 h-3" />
                      ) : (
                        <FileCheck className="w-3 h-3" />
                      )}
                      <span className="truncate">{session.title}</span>
                    </Button>
                  ))}
              </CollapsibleContent>
            </Collapsible>
          ))}

          {/* Unfoldered Sessions */}
          {unfolderedSessions.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {unfolderedSessions.map((session) => (
                <Button
                  key={session.id}
                  variant="ghost"
                  className="w-full justify-start gap-2 h-8 px-2 text-sm text-muted-foreground hover:text-sidebar-foreground"
                >
                  {session.type === 'chat' ? (
                    <MessageSquare className="w-3 h-3" />
                  ) : (
                    <FileCheck className="w-3 h-3" />
                  )}
                  <span className="truncate">{session.title}</span>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Utility Links */}
      <div className="p-3 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-sidebar-foreground"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-sidebar-foreground"
        >
          <HelpCircle className="w-4 h-4" />
          Help & Support
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-sidebar-foreground"
        >
          <CreditCard className="w-4 h-4" />
          Pricing
        </Button>
      </div>
    </aside>
  );
}
