'use client';

import { Invoice, getInvoiceStatusColor } from '@/lib/invoice-types';
import { CompanySettings, CompanySettingsStorage, formatCompanyAddress } from '@/lib/company-settings';
import { format } from 'date-fns';
import { CURRENCIES } from '@/lib/constants';
import { downloadInvoicePDF } from '@/lib/invoice-pdf';
import { useEffect, useState } from 'react';

interface InvoicePreviewProps {
  invoice: Invoice;
  companyInfo?: CompanySettings;
}

export default function InvoicePreview({ invoice, companyInfo }: InvoicePreviewProps) {
  const [currentCompanyInfo, setCurrentCompanyInfo] = useState<CompanySettings>(
    companyInfo || CompanySettingsStorage.getSettings()
  );
  const currencySymbol = CURRENCIES[invoice.currency as keyof typeof CURRENCIES]?.symbol || '$';

  useEffect(() => {
    if (!companyInfo) {
      setCurrentCompanyInfo(CompanySettingsStorage.getSettings());
    }
  }, [companyInfo]);

  const handleDownloadPDF = () => {
    downloadInvoicePDF(invoice, {
      name: currentCompanyInfo.name,
      email: currentCompanyInfo.email,
      phone: currentCompanyInfo.phone,
      address: formatCompanyAddress(currentCompanyInfo.address),
      logo: currentCompanyInfo.logo
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-card rounded-xl shadow-lg overflow-hidden border">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Invoice</h2>
            <div className="space-y-1 text-sm">
              <p>Invoice #: {invoice.invoiceNumber}</p>
              <p>Date: {format(invoice.issueDate, 'MMM dd, yyyy')}</p>
              <p>Due: {format(invoice.dueDate, 'MMM dd, yyyy')}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getInvoiceStatusColor(invoice.status)}`}>
              {invoice.status.toUpperCase()}
            </div>
            <div className="mt-4 space-y-1 text-sm">
              {currentCompanyInfo.logo && (
                <div className="mb-3">
                  <img src={currentCompanyInfo.logo} alt="Company Logo" className="h-12 w-auto" />
                </div>
              )}
              <p className="font-semibold">{currentCompanyInfo.name}</p>
              <p>{currentCompanyInfo.email}</p>
              {currentCompanyInfo.phone && <p>{currentCompanyInfo.phone}</p>}
              {currentCompanyInfo.website && (
                <p className="text-blue-600 dark:text-blue-400">
                  <a href={currentCompanyInfo.website} target="_blank" rel="noopener noreferrer">
                    {currentCompanyInfo.website}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Bill To</h3>
            <div className="space-y-1">
              <p className="font-semibold">{invoice.customer.name}</p>
              <p className="text-sm text-muted-foreground">{invoice.customer.email}</p>
              {invoice.customer.phone && (
                <p className="text-sm text-muted-foreground">{invoice.customer.phone}</p>
              )}
              {invoice.customer.address && (
                <div className="text-sm text-muted-foreground mt-2">
                  {invoice.customer.address.street && <p>{invoice.customer.address.street}</p>}
                  {(invoice.customer.address.city || invoice.customer.address.state || invoice.customer.address.zipCode) && (
                    <p>
                      {[
                        invoice.customer.address.city,
                        invoice.customer.address.state,
                        invoice.customer.address.zipCode
                      ].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {invoice.customer.address.country && <p>{invoice.customer.address.country}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-3 px-2 font-semibold text-sm">Description</th>
                <th className="text-center py-3 px-2 font-semibold text-sm">Qty</th>
                <th className="text-right py-3 px-2 font-semibold text-sm">Rate</th>
                <th className="text-right py-3 px-2 font-semibold text-sm">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b border-border/50">
                  <td className="py-3 px-2 text-sm">{item.description}</td>
                  <td className="py-3 px-2 text-sm text-center">{item.quantity}</td>
                  <td className="py-3 px-2 text-sm text-right">
                    {currencySymbol}{item.rate.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-sm text-right font-medium">
                    {currencySymbol}{item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full md:w-80 space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm font-medium">{currencySymbol}{invoice.subtotal.toFixed(2)}</span>
            </div>
            
            {invoice.discountAmount && invoice.discountAmount > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  Discount ({invoice.discountRate}%)
                </span>
                <span className="text-sm font-medium text-red-600">
                  -{currencySymbol}{invoice.discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            
            {invoice.taxAmount && invoice.taxAmount > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  Tax ({invoice.taxRate}%)
                </span>
                <span className="text-sm font-medium">
                  {currencySymbol}{invoice.taxAmount.toFixed(2)}
                </span>
              </div>
            )}
            
            {invoice.paypalFee && invoice.includePaypalFee && (
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">PayPal Fee</span>
                <span className="text-sm font-medium">
                  {currencySymbol}{invoice.paypalFee.toFixed(2)}
                </span>
              </div>
            )}
            
            <div className="border-t-2 border-border pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {currencySymbol}{invoice.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {(invoice.notes || invoice.terms || invoice.paymentInstructions) && (
          <div className="space-y-4 pt-4 border-t border-border">
            {invoice.notes && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            
            {invoice.terms && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Terms & Conditions</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
            
            {invoice.paymentInstructions && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Payment Instructions</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.paymentInstructions}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4 print:hidden">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>
    </div>
  );
}