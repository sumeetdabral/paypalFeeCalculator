'use client';

import { useState, useEffect, useCallback } from 'react';
import { calculatePayPalFees, formatCurrency } from '@/lib/calculations';
import { TRANSACTION_TYPES, CURRENCIES } from '@/lib/constants';
import ResultsDisplay from './ResultsDisplay';
import ThemeToggle from './ThemeToggle';
import BatchCalculator from './BatchCalculator';

export default function Calculator() {
  const [amount, setAmount] = useState<string>('');
  const [transactionType, setTransactionType] = useState<string>(TRANSACTION_TYPES.DOMESTIC);
  const [currency, setCurrency] = useState('USD');
  const [calculation, setCalculation] = useState<ReturnType<typeof calculatePayPalFees> | null>(null);
  const [history, setHistory] = useState<Array<ReturnType<typeof calculatePayPalFees>>>([]);

  const handleCalculate = useCallback(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setCalculation(null);
      return;
    }

    const result = calculatePayPalFees(
      numAmount,
      transactionType,
      transactionType === TRANSACTION_TYPES.MICROPAYMENT || numAmount < 10
    );
    
    setCalculation(result);
    
    // Add to history (limit to last 10)
    setHistory(prev => [result, ...prev.slice(0, 9)]);
  }, [amount, transactionType]);

  useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('paypal-calc-history');
  };

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('paypal-calc-history', JSON.stringify(history));
    }
  }, [history]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('paypal-calc-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  const currencySymbol = CURRENCIES[currency as keyof typeof CURRENCIES]?.symbol || '$';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Banner */}
        <header className="relative mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90 rounded-xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl" />
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl blur-xl opacity-50 animate-pulse" />
          
          <div className="relative bg-gradient-to-r from-blue-600/95 via-indigo-600/95 to-purple-600/95 rounded-xl shadow-2xl backdrop-blur-sm border border-white/10">
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        PayPal Fee <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">Calculator</span>
                      </h1>
                      <p className="text-white/80 text-sm md:text-base mt-1">
                        Calculate fees instantly and find out exactly how much to request
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white/70 text-xs">Real-time</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white/70 text-xs">Multi-currency</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white/70 text-xs">Batch Processing</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Section */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl shadow-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">Calculate Fees</h2>
              
              {/* Amount Input */}
              <div className="space-y-2 mb-4">
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currencySymbol}
                  </span>
                  <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Transaction Type */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Transaction Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTransactionType(TRANSACTION_TYPES.DOMESTIC)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      transactionType === TRANSACTION_TYPES.DOMESTIC
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-secondary/50 border-border'
                    }`}
                  >
                    Domestic
                  </button>
                  <button
                    onClick={() => setTransactionType(TRANSACTION_TYPES.INTERNATIONAL)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      transactionType === TRANSACTION_TYPES.INTERNATIONAL
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-secondary/50 border-border'
                    }`}
                  >
                    International
                  </button>
                  <button
                    onClick={() => setTransactionType(TRANSACTION_TYPES.MICROPAYMENT)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      transactionType === TRANSACTION_TYPES.MICROPAYMENT
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-secondary/50 border-border'
                    }`}
                  >
                    Micro (&lt;$10)
                  </button>
                </div>
              </div>

              {/* Currency Selector */}
              <div className="space-y-2 mb-4">
                <label htmlFor="currency" className="text-sm font-medium">
                  Currency
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  {Object.entries(CURRENCIES).map(([code, info]) => (
                    <option key={code} value={code}>
                      {info.name} ({info.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fee Information */}
              <div className="bg-secondary/30 rounded-lg p-4 text-sm">
                <p className="font-medium mb-1">Current Fee Structure:</p>
                <p className="text-muted-foreground">
                  {transactionType === TRANSACTION_TYPES.MICROPAYMENT
                    ? '5% + $0.05 (Micropayments)'
                    : transactionType === TRANSACTION_TYPES.INTERNATIONAL
                    ? '4.4% + $0.30 (International)'
                    : '2.9% + $0.30 (Domestic)'}
                </p>
              </div>
            </div>

            {/* Quick Amount Presets */}
            <div className="bg-card rounded-xl shadow-lg p-6 border">
              <h3 className="text-lg font-semibold mb-3">Quick Amounts</h3>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100, 250, 500, 1000, 5000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset.toString())}
                    className="px-3 py-2 rounded-lg border bg-background hover:bg-secondary/50 transition-all text-sm"
                  >
                    {currencySymbol}{preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {calculation && <ResultsDisplay calculation={calculation} currencySymbol={currencySymbol} />}

            {/* Batch Calculator */}
            <BatchCalculator currencySymbol={currencySymbol} />

            {/* History */}
            {history.length > 0 && (
              <div className="bg-card rounded-xl shadow-lg p-6 border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recent Calculations</h3>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.map((calc, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 px-3 rounded-lg bg-secondary/30 text-sm"
                    >
                      <span>{formatCurrency(calc.originalAmount, currencySymbol)}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-green-600 dark:text-green-400">
                        {formatCurrency(calc.netAmount, currencySymbol)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        -{formatCurrency(calc.paypalFee, currencySymbol)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}