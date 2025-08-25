import { Suspense } from 'react';
import InvoicesPageClient from './InvoicesPageClient';

function InvoicesPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading invoices...</p>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<InvoicesPageFallback />}>
      <InvoicesPageClient />
    </Suspense>
  );
}