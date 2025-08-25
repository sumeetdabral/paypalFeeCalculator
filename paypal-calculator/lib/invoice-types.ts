export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  customer: Customer;
  items: InvoiceItem[];
  currency: string;
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  paypalFee?: number;
  includePaypalFee: boolean;
  total: number;
  notes?: string;
  terms?: string;
  paymentInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

export interface InvoiceFormData {
  customer: Omit<Customer, 'id'>;
  items: Omit<InvoiceItem, 'id' | 'amount' | 'taxAmount'>[];
  currency: string;
  taxRate?: number;
  discountRate?: number;
  includePaypalFee: boolean;
  paypalTransactionType?: string;
  notes?: string;
  terms?: string;
  paymentInstructions?: string;
  dueDate: Date;
}

export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  averageInvoiceAmount: number;
}

export const DEFAULT_PAYMENT_TERMS = 'Payment is due within 30 days of invoice date.';
export const DEFAULT_PAYMENT_INSTRUCTIONS = 'Please make payment via PayPal to the email address provided.';

export function generateInvoiceNumber(prefix: string = 'INV'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function calculateInvoiceTotals(
  items: InvoiceItem[],
  taxRate: number = 0,
  discountRate: number = 0,
  paypalFee: number = 0,
  includePaypalFee: boolean = false
): {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = (subtotal * discountRate) / 100;
  const discountedSubtotal = subtotal - discountAmount;
  const taxAmount = (discountedSubtotal * taxRate) / 100;
  let total = discountedSubtotal + taxAmount;
  
  if (includePaypalFee) {
    total += paypalFee;
  }

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function getInvoiceStatusColor(status: Invoice['status']): string {
  switch (status) {
    case 'draft':
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    case 'sent':
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
    case 'paid':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    case 'overdue':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
    case 'cancelled':
      return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
  }
}

export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    return false;
  }
  return new Date() > new Date(invoice.dueDate);
}