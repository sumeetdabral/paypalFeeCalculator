'use client';

import { useState, useEffect } from 'react';
import { Invoice, getInvoiceStatusColor, isInvoiceOverdue } from '@/lib/invoice-types';
import { InvoiceStorage } from '@/lib/invoice-storage';
import { CompanySettingsStorage } from '@/lib/company-settings';
import { format } from 'date-fns';
import { CURRENCIES } from '@/lib/constants';
import { downloadInvoicePDF } from '@/lib/invoice-pdf';
import InvoicePreview from './InvoicePreview';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Invoice['status'] | 'all'>('all');
  const [showPreview, setShowPreview] = useState(false);
  const [stats, setStats] = useState(InvoiceStorage.getInvoiceStats());

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const allInvoices = InvoiceStorage.getAllInvoices();
    setInvoices(allInvoices);
    setStats(InvoiceStorage.getInvoiceStats());
  };

  const handleStatusChange = (invoiceId: string, newStatus: Invoice['status']) => {
    InvoiceStorage.updateInvoiceStatus(invoiceId, newStatus);
    loadInvoices();
  };

  const handleDelete = (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      InvoiceStorage.deleteInvoice(invoiceId);
      loadInvoices();
    }
  };

  const handleDuplicate = (invoiceId: string) => {
    const duplicated = InvoiceStorage.duplicateInvoice(invoiceId);
    if (duplicated) {
      loadInvoices();
      alert(`Invoice duplicated as ${duplicated.invoiceNumber}`);
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    const companyInfo = CompanySettingsStorage.getSettings();
    downloadInvoicePDF(invoice, {
      name: companyInfo.name,
      email: companyInfo.email,
      phone: companyInfo.phone,
      address: companyInfo.address,
      logo: companyInfo.logo
    });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchQuery === '' || 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getCurrencySymbol = (currency: string) => {
    return CURRENCIES[currency as keyof typeof CURRENCIES]?.symbol || '$';
  };

  if (showPreview && selectedInvoice) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => setShowPreview(false)}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-secondary/50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to List
          </button>
        </div>
        <InvoicePreview 
          invoice={selectedInvoice} 
          companyInfo={CompanySettingsStorage.getSettings()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Invoices</p>
              <p className="text-2xl font-bold">{stats.totalInvoices}</p>
            </div>
            <div className="p-3 rounded-lg" style={{backgroundColor: '#2563eb'}}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg" style={{backgroundColor: '#9333ea'}}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">${stats.paidAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg" style={{backgroundColor: '#16a34a'}}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">${stats.overdueAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg" style={{backgroundColor: '#dc2626'}}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-lg p-6 border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoices..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Invoice['status'] | 'all')}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-muted-foreground">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-sm">Invoice #</th>
                  <th className="text-left py-3 px-2 font-medium text-sm">Customer</th>
                  <th className="text-left py-3 px-2 font-medium text-sm">Date</th>
                  <th className="text-left py-3 px-2 font-medium text-sm">Due Date</th>
                  <th className="text-right py-3 px-2 font-medium text-sm">Amount</th>
                  <th className="text-center py-3 px-2 font-medium text-sm">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const overdue = isInvoiceOverdue(invoice);
                  return (
                    <tr key={invoice.id} className="border-b hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="text-primary hover:underline font-medium"
                        >
                          {invoice.invoiceNumber}
                        </button>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{invoice.customer.name}</p>
                          <p className="text-xs text-muted-foreground">{invoice.customer.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm">
                        {format(invoice.issueDate, 'MMM dd, yyyy')}
                      </td>
                      <td className="py-3 px-2 text-sm">
                        <span className={overdue && invoice.status !== 'paid' ? 'text-red-600 font-medium' : ''}>
                          {format(invoice.dueDate, 'MMM dd, yyyy')}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-medium">
                        {getCurrencySymbol(invoice.currency)}{invoice.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <select
                          value={invoice.status}
                          onChange={(e) => handleStatusChange(invoice.id, e.target.value as Invoice['status'])}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getInvoiceStatusColor(invoice.status)} border-0 cursor-pointer [&>option]:bg-background [&>option]:text-foreground`}
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleViewInvoice(invoice)}
                            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                            title="View"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(invoice)}
                            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDuplicate(invoice.id)}
                            className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                            title="Duplicate"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}