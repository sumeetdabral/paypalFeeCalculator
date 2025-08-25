import { Invoice, InvoiceStats } from './invoice-types';

const STORAGE_KEY = 'paypal-calculator-invoices';
const INVOICE_COUNTER_KEY = 'paypal-calculator-invoice-counter';

export class InvoiceStorage {
  private static getInvoices(): Invoice[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    try {
      const invoices = JSON.parse(stored);
      return invoices.map((inv: any) => ({
        ...inv,
        issueDate: new Date(inv.issueDate),
        dueDate: new Date(inv.dueDate),
        createdAt: new Date(inv.createdAt),
        updatedAt: new Date(inv.updatedAt),
        paidAt: inv.paidAt ? new Date(inv.paidAt) : undefined,
      }));
    } catch (error) {
      console.error('Error parsing invoices from storage:', error);
      return [];
    }
  }

  private static saveInvoices(invoices: Invoice[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  }

  static getNextInvoiceNumber(): string {
    if (typeof window === 'undefined') return 'INV-001';
    
    const currentCounter = localStorage.getItem(INVOICE_COUNTER_KEY);
    const nextNumber = currentCounter ? parseInt(currentCounter) + 1 : 1;
    localStorage.setItem(INVOICE_COUNTER_KEY, nextNumber.toString());
    
    const year = new Date().getFullYear();
    const paddedNumber = nextNumber.toString().padStart(4, '0');
    return `INV-${year}-${paddedNumber}`;
  }

  static getAllInvoices(): Invoice[] {
    return this.getInvoices();
  }

  static getInvoiceById(id: string): Invoice | undefined {
    const invoices = this.getInvoices();
    return invoices.find(inv => inv.id === id);
  }

  static getInvoicesByStatus(status: Invoice['status']): Invoice[] {
    const invoices = this.getInvoices();
    return invoices.filter(inv => inv.status === status);
  }

  static getInvoicesByCustomer(customerId: string): Invoice[] {
    const invoices = this.getInvoices();
    return invoices.filter(inv => inv.customer.id === customerId);
  }

  static saveInvoice(invoice: Invoice): void {
    const invoices = this.getInvoices();
    const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
    
    if (existingIndex >= 0) {
      invoices[existingIndex] = {
        ...invoice,
        updatedAt: new Date(),
      };
    } else {
      invoices.push({
        ...invoice,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    this.saveInvoices(invoices);
  }

  static updateInvoiceStatus(id: string, status: Invoice['status']): boolean {
    const invoices = this.getInvoices();
    const invoice = invoices.find(inv => inv.id === id);
    
    if (!invoice) return false;
    
    invoice.status = status;
    invoice.updatedAt = new Date();
    
    if (status === 'paid') {
      invoice.paidAt = new Date();
    }
    
    this.saveInvoices(invoices);
    return true;
  }

  static deleteInvoice(id: string): boolean {
    const invoices = this.getInvoices();
    const filteredInvoices = invoices.filter(inv => inv.id !== id);
    
    if (filteredInvoices.length === invoices.length) {
      return false;
    }
    
    this.saveInvoices(filteredInvoices);
    return true;
  }

  static duplicateInvoice(id: string): Invoice | null {
    const invoice = this.getInvoiceById(id);
    if (!invoice) return null;
    
    const newInvoice: Invoice = {
      ...invoice,
      id: crypto.randomUUID(),
      invoiceNumber: this.getNextInvoiceNumber(),
      status: 'draft',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      paidAt: undefined,
    };
    
    this.saveInvoice(newInvoice);
    return newInvoice;
  }

  static getInvoiceStats(): InvoiceStats {
    const invoices = this.getInvoices();
    
    if (invoices.length === 0) {
      return {
        totalInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        overdueAmount: 0,
        averageInvoiceAmount: 0,
      };
    }
    
    const now = new Date();
    let totalAmount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let overdueAmount = 0;
    
    invoices.forEach(invoice => {
      totalAmount += invoice.total;
      
      if (invoice.status === 'paid') {
        paidAmount += invoice.total;
      } else if (invoice.status === 'sent' || invoice.status === 'draft') {
        if (new Date(invoice.dueDate) < now) {
          overdueAmount += invoice.total;
        } else {
          pendingAmount += invoice.total;
        }
      }
    });
    
    return {
      totalInvoices: invoices.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
      paidAmount: Math.round(paidAmount * 100) / 100,
      pendingAmount: Math.round(pendingAmount * 100) / 100,
      overdueAmount: Math.round(overdueAmount * 100) / 100,
      averageInvoiceAmount: Math.round((totalAmount / invoices.length) * 100) / 100,
    };
  }

  static searchInvoices(query: string): Invoice[] {
    const invoices = this.getInvoices();
    const lowerQuery = query.toLowerCase();
    
    return invoices.filter(invoice => {
      return (
        invoice.invoiceNumber.toLowerCase().includes(lowerQuery) ||
        invoice.customer.name.toLowerCase().includes(lowerQuery) ||
        invoice.customer.email.toLowerCase().includes(lowerQuery) ||
        invoice.items.some(item => 
          item.description.toLowerCase().includes(lowerQuery)
        )
      );
    });
  }

  static getRecentInvoices(limit: number = 5): Invoice[] {
    const invoices = this.getInvoices();
    return invoices
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  static exportInvoices(): string {
    const invoices = this.getInvoices();
    return JSON.stringify(invoices, null, 2);
  }

  static importInvoices(jsonData: string): boolean {
    try {
      const invoices = JSON.parse(jsonData);
      if (!Array.isArray(invoices)) {
        throw new Error('Invalid invoice data format');
      }
      
      const validInvoices = invoices.map((inv: any) => ({
        ...inv,
        issueDate: new Date(inv.issueDate),
        dueDate: new Date(inv.dueDate),
        createdAt: new Date(inv.createdAt),
        updatedAt: new Date(inv.updatedAt),
        paidAt: inv.paidAt ? new Date(inv.paidAt) : undefined,
      }));
      
      this.saveInvoices(validInvoices);
      return true;
    } catch (error) {
      console.error('Error importing invoices:', error);
      return false;
    }
  }

  static clearAllInvoices(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(INVOICE_COUNTER_KEY);
  }
}