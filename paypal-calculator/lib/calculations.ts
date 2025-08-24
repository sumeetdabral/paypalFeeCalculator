import { PAYPAL_FEES, TRANSACTION_TYPES } from './constants';

export interface FeeCalculation {
  originalAmount: number;
  paypalFee: number;
  feePercentage: number;
  fixedFee: number;
  netAmount: number;
  shouldRequestAmount: number;
}

export function calculatePayPalFees(
  amount: number,
  transactionType: string = TRANSACTION_TYPES.DOMESTIC,
  isMicropayment: boolean = false
): FeeCalculation {
  if (amount <= 0) {
    return {
      originalAmount: 0,
      paypalFee: 0,
      feePercentage: 0,
      fixedFee: 0,
      netAmount: 0,
      shouldRequestAmount: 0,
    };
  }

  let feePercentage: number;
  let fixedFee: number;

  // Determine fee structure based on transaction type
  if (transactionType === TRANSACTION_TYPES.MICROPAYMENT || (isMicropayment && amount < 10)) {
    feePercentage = PAYPAL_FEES.DOMESTIC.MICROPAYMENT.percentage;
    fixedFee = PAYPAL_FEES.DOMESTIC.MICROPAYMENT.fixed;
  } else if (transactionType === TRANSACTION_TYPES.INTERNATIONAL) {
    feePercentage = PAYPAL_FEES.INTERNATIONAL.STANDARD.percentage;
    fixedFee = PAYPAL_FEES.INTERNATIONAL.STANDARD.fixed;
  } else {
    feePercentage = PAYPAL_FEES.DOMESTIC.STANDARD.percentage;
    fixedFee = PAYPAL_FEES.DOMESTIC.STANDARD.fixed;
  }

  // Calculate the PayPal fee
  const paypalFee = amount * feePercentage + fixedFee;
  
  // Calculate net amount (what you receive after fees)
  const netAmount = amount - paypalFee;
  
  // Calculate reverse amount (what to request to receive exact amount)
  // Formula: (desired_amount + fixed_fee) / (1 - percentage_fee)
  const shouldRequestAmount = (amount + fixedFee) / (1 - feePercentage);

  return {
    originalAmount: amount,
    paypalFee: Math.round(paypalFee * 100) / 100, // Round to 2 decimal places
    feePercentage: feePercentage * 100, // Convert to percentage
    fixedFee,
    netAmount: Math.round(netAmount * 100) / 100,
    shouldRequestAmount: Math.round(shouldRequestAmount * 100) / 100,
  };
}

export function calculateReverseAmount(
  desiredAmount: number,
  transactionType: string = TRANSACTION_TYPES.DOMESTIC,
  isMicropayment: boolean = false
): number {
  if (desiredAmount <= 0) return 0;

  let feePercentage: number;
  let fixedFee: number;

  if (transactionType === TRANSACTION_TYPES.MICROPAYMENT || (isMicropayment && desiredAmount < 10)) {
    feePercentage = PAYPAL_FEES.DOMESTIC.MICROPAYMENT.percentage;
    fixedFee = PAYPAL_FEES.DOMESTIC.MICROPAYMENT.fixed;
  } else if (transactionType === TRANSACTION_TYPES.INTERNATIONAL) {
    feePercentage = PAYPAL_FEES.INTERNATIONAL.STANDARD.percentage;
    fixedFee = PAYPAL_FEES.INTERNATIONAL.STANDARD.fixed;
  } else {
    feePercentage = PAYPAL_FEES.DOMESTIC.STANDARD.percentage;
    fixedFee = PAYPAL_FEES.DOMESTIC.STANDARD.fixed;
  }

  // Calculate amount to request to receive the desired amount after fees
  const amountToRequest = (desiredAmount + fixedFee) / (1 - feePercentage);
  
  return Math.round(amountToRequest * 100) / 100;
}

export function calculateBatchFees(
  amounts: number[],
  transactionType: string = TRANSACTION_TYPES.DOMESTIC
): {
  totalOriginal: number;
  totalFees: number;
  totalNet: number;
  calculations: FeeCalculation[];
} {
  const calculations = amounts.map(amount =>
    calculatePayPalFees(amount, transactionType, amount < 10)
  );

  const totalOriginal = calculations.reduce((sum, calc) => sum + calc.originalAmount, 0);
  const totalFees = calculations.reduce((sum, calc) => sum + calc.paypalFee, 0);
  const totalNet = calculations.reduce((sum, calc) => sum + calc.netAmount, 0);

  return {
    totalOriginal: Math.round(totalOriginal * 100) / 100,
    totalFees: Math.round(totalFees * 100) / 100,
    totalNet: Math.round(totalNet * 100) / 100,
    calculations,
  };
}

export function formatCurrency(amount: number, currencySymbol: string = '$'): string {
  return `${currencySymbol}${amount.toFixed(2)}`;
}