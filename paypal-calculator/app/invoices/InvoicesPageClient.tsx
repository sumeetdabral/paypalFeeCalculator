'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import InvoiceCreator from '@/components/InvoiceCreator';
import InvoiceList from '@/components/InvoiceList';
import CompanySettings from '@/components/CompanySettings';
import ThemeToggle from '@/components/ThemeToggle';

export default function InvoicesPageClient() {
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState<'list' | 'create' | 'settings'>('list');
  const [initialAmount, setInitialAmount] = useState<number | undefined>();
  const [initialCurrency, setInitialCurrency] = useState<string>('USD');
  const [initialTransactionType, setInitialTransactionType] = useState<string>('DOMESTIC');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (searchParams.get('create') === 'true') {
      setActiveView('create');
      const amount = searchParams.get('amount');
      if (amount) {
        setInitialAmount(parseFloat(amount));
      }
      const currency = searchParams.get('currency');
      if (currency) {
        setInitialCurrency(currency);
      }
      const transactionType = searchParams.get('transactionType');
      if (transactionType) {
        setInitialTransactionType(transactionType);
      }
    }
  }, [searchParams]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="relative mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-90 rounded-xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl" />
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl blur-xl opacity-50 animate-pulse" />
          
          <div className="relative bg-gradient-to-r from-indigo-600/95 via-purple-600/95 to-pink-600/95 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse delay-700" />
            </div>
            
            <div className="relative px-6 py-6 md:px-10 md:py-8">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        Invoice <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">Manager</span>
                      </h1>
                      <p className="text-white/80 text-sm md:text-base mt-1">
                        Create, manage, and track your professional invoices
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white/70 text-xs">PDF Export</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white/70 text-xs">PayPal Fee Integration</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white/70 text-xs">Status Tracking</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 ml-4">
                  <button
                    onClick={() => setActiveView('settings')}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 text-sm font-medium border border-white/30"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                  <Link 
                    href="/"
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 text-sm font-medium border border-white/30"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Calculator
                  </Link>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </header>

        {activeView !== 'settings' && (
          <div className="mb-6">
            <div className="bg-card rounded-xl shadow-lg p-1 inline-flex">
              <button
                onClick={() => setActiveView('list')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeView === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Invoice List
                </div>
              </button>
              <button
                onClick={() => setActiveView('create')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeView === 'create'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Invoice
                </div>
              </button>
            </div>
          </div>
        )}

        {activeView === 'list' ? (
          <InvoiceList />
        ) : activeView === 'create' ? (
          <InvoiceCreator 
            initialAmount={initialAmount}
            initialCurrency={initialCurrency}
            initialTransactionType={initialTransactionType}
            onSave={(invoice) => {
              setActiveView('list');
              alert(`Invoice ${invoice.invoiceNumber} created successfully!`);
            }}
            onCancel={() => setActiveView('list')}
          />
        ) : (
          <CompanySettings 
            onSave={() => {
              setActiveView('list');
              alert('Company settings saved successfully!');
            }}
            onCancel={() => setActiveView('list')}
          />
        )}
      </div>
    </div>
  );
}