import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { ChatMessage } from '@/types';

export function useChatMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!conversationId || !user) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(
          data?.map((m) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            citations: (m.citations as any[]) || [],
            createdAt: new Date(m.created_at),
          })) || []
        );
      }
      setIsLoading(false);
    };

    fetchMessages();
  }, [conversationId, user]);

  const addMessage = async (
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    citations: any[] = []
  ) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role,
        content,
        citations,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      return null;
    }

    const newMessage: ChatMessage = {
      id: data.id,
      role: data.role as 'user' | 'assistant',
      content: data.content,
      citations: (data.citations as any[]) || [],
      createdAt: new Date(data.created_at),
    };

    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    setMessages,
    isLoading,
    addMessage,
    clearMessages,
  };
}
