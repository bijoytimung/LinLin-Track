'use client';

import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <p className="text-lg font-semibold">Connecting to the store...</p>
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
