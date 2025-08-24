'use client';

import { useState } from 'react';
import { formatCurrency, type FeeCalculation } from '@/lib/calculations';

interface ResultsDisplayProps {
  calculation: FeeCalculation;
  currencySymbol: string;
}

export default function ResultsDisplay({ calculation, currencySymbol }: ResultsDisplayProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (value: number, field: string) => {
    navigator.clipboard.writeText(value.toFixed(2));
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Main Results */}
      <div className="bg-card rounded-xl shadow-lg p-6 border">
        <h2 className="text-xl font-semibold mb-4">Results</h2>
        
        <div className="space-y-4">
          {/* Amount Sent */}
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-muted-foreground">Amount Sent</span>
            <span className="text-xl font-semibold">
              {formatCurrency(calculation.originalAmount, currencySymbol)}
            </span>
          </div>

          {/* PayPal Fee */}
          <div className="flex justify-between items-center py-3 border-b">
            <div>
              <span className="text-muted-foreground">PayPal Fee</span>
              <span className="text-xs text-muted-foreground ml-2">
                ({calculation.feePercentage}% + {currencySymbol}{calculation.fixedFee})
              </span>
            </div>
            <span className="text-xl font-semibold text-red-600 dark:text-red-400">
              -{formatCurrency(calculation.paypalFee, currencySymbol)}
            </span>
          </div>

          {/* You Receive - Modern Design */}
          <div className="relative overflow-hidden rounded-xl mt-6">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 opacity-90 animate-gradient" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* Floating orbs for visual interest */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse delay-700" />
            
            {/* Content */}
            <div className="relative bg-gradient-to-r from-emerald-500/95 via-green-500/95 to-teal-500/95 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/25 backdrop-blur rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/90 text-sm font-medium">You Receive</p>
                    <p className="text-white/70 text-xs">After PayPal fees</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white tracking-tight">
                      {formatCurrency(calculation.netAmount, currencySymbol)}
                    </div>
                    <div className="text-white/70 text-xs mt-1">
                      {((calculation.netAmount / calculation.originalAmount) * 100).toFixed(1)}% of original
                    </div>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(calculation.netAmount, 'receive')}
                    className="group relative p-3 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30"
                    title="Copy amount"
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-lg transition-colors" />
                    {copiedField === 'receive' ? (
                      <svg className="w-5 h-5 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Progress bar showing fee impact */}
              <div className="mt-4 bg-white/20 backdrop-blur rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-white/90 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(calculation.netAmount / calculation.originalAmount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reverse Calculation */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-primary/20">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Want to receive exactly {formatCurrency(calculation.originalAmount, currencySymbol)}?
        </h3>
        <div className="bg-card/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">
            Request this amount to receive your desired amount after fees:
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(calculation.shouldRequestAmount, currencySymbol)}
            </span>
            <button
              onClick={() => copyToClipboard(calculation.shouldRequestAmount, 'request')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {copiedField === 'request' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Fee Breakdown Visual */}
      <div className="bg-card rounded-xl shadow-lg p-6 border">
        <h3 className="text-lg font-semibold mb-4">Fee Breakdown</h3>
        <div className="space-y-3">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/10">
                  Amount after fees
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-primary">
                  {((calculation.netAmount / calculation.originalAmount) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-secondary">
              <div
                style={{ width: `${(calculation.netAmount / calculation.originalAmount) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
              />
            </div>
          </div>

          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-100 dark:bg-red-950/30">
                  PayPal fees
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-red-600 dark:text-red-400">
                  {((calculation.paypalFee / calculation.originalAmount) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-secondary">
              <div
                style={{ width: `${(calculation.paypalFee / calculation.originalAmount) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}