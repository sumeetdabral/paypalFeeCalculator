'use client';

import { useState } from 'react';
import { calculateBatchFees, formatCurrency } from '@/lib/calculations';
import { TRANSACTION_TYPES } from '@/lib/constants';

interface BatchCalculatorProps {
  currencySymbol: string;
}

export default function BatchCalculator({ currencySymbol }: BatchCalculatorProps) {
  const [amounts, setAmounts] = useState<string>('');
  const [transactionType, setTransactionType] = useState<string>(TRANSACTION_TYPES.DOMESTIC);
  const [batchResult, setBatchResult] = useState<ReturnType<typeof calculateBatchFees> | null>(null);

  const handleBatchCalculate = () => {
    const amountList = amounts
      .split(/[,\n]+/)
      .map(a => parseFloat(a.trim()))
      .filter(a => !isNaN(a) && a > 0);

    if (amountList.length === 0) {
      setBatchResult(null);
      return;
    }

    const result = calculateBatchFees(amountList, transactionType);
    setBatchResult(result);
  };

  return (
    <div className="bg-card rounded-xl shadow-lg p-6 border">
      <h3 className="text-lg font-semibold mb-4">Batch Calculator</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Enter multiple amounts (comma or new line separated)
          </label>
          <textarea
            value={amounts}
            onChange={(e) => setAmounts(e.target.value)}
            placeholder="100, 250, 500&#10;1000&#10;2500"
            className="w-full mt-2 px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all h-32 resize-none"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={TRANSACTION_TYPES.DOMESTIC}>Domestic</option>
            <option value={TRANSACTION_TYPES.INTERNATIONAL}>International</option>
            <option value={TRANSACTION_TYPES.MICROPAYMENT}>Micropayment</option>
          </select>
          <button
            onClick={handleBatchCalculate}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Calculate All
          </button>
        </div>

        {batchResult && (
          <div className="mt-4 space-y-3">
            <div className="bg-secondary/30 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Original</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(batchResult.totalOriginal, currencySymbol)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Fees</p>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                    -{formatCurrency(batchResult.totalFees, currencySymbol)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Net</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(batchResult.totalNet, currencySymbol)}
                  </p>
                </div>
              </div>
            </div>

            <details className="cursor-pointer">
              <summary className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                View individual calculations ({batchResult.calculations.length} items)
              </summary>
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {batchResult.calculations.map((calc, index) => (
                  <div key={index} className="flex justify-between text-xs py-1 px-2 rounded bg-secondary/20">
                    <span>{formatCurrency(calc.originalAmount, currencySymbol)}</span>
                    <span className="text-muted-foreground">→</span>
                    <span>{formatCurrency(calc.netAmount, currencySymbol)}</span>
                    <span className="text-muted-foreground">
                      (fee: {formatCurrency(calc.paypalFee, currencySymbol)})
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}