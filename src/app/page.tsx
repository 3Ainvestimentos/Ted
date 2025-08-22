
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page now acts as a simple redirector to the main entry point of the app.
// The actual authentication and maintenance checks are handled by middleware and layouts.
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/strategic-panel');
  }, [router]);

  // Render nothing, as the redirect will happen instantly.
  // A spinner could be placed here if there was a delay.
  return null;
}
