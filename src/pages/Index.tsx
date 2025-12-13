import { useAuth } from '@/lib/auth';
import Dashboard from './Dashboard';
import LawChat from './LawChat';
import { Loader2 } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Authenticated users bypass landing page and go directly to the app
  if (user) {
    return <LawChat />;
  }

  // Guests see the marketing landing page
  return <Dashboard />;
}
