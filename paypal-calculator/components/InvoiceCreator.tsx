'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addDays, format } from 'date-fns';
import { Invoice, InvoiceItem, Customer, calculateInvoiceTotals, DEFAULT_PAYMENT_TERMS, DEFAULT_PAYMENT_INSTRUCTIONS } from '@/lib/invoice-types';
import { InvoiceStorage } from '@/lib/invoice-storage';
import { CompanySettingsStorage } from '@/lib/company-settings';
import { calculatePayPalFees } from '@/lib/calculations';
import { CURRENCIES, TRANSACTION_TYPES } from '@/lib/constants';
import InvoicePreview from './InvoicePreview';

interface InvoiceCreatorProps {
  initialAmount?: number;
  initialTransactionType?: string;
  initialCurrency?: string;
  onSave?: (invoice: Invoice) => void;
  onCancel?: () => void;
}

export default function InvoiceCreator({
  initialAmount,
  initialTransactionType = TRANSACTION_TYPES.DOMESTIC,
  initialCurrency = 'USD',
  onSave,
  onCancel
}: InvoiceCreatorProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [currency, setCurrency] = useState(initialCurrency);
  const [paypalTransactionType, setPaypalTransactionType] = useState(initialTransactionType);
  const [includePaypalFee, setIncludePaypalFee] = useState(false);
  
  const [customer, setCustomer] = useState<Omit<Customer, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: uuidv4(),
      description: '',
      quantity: 1,
      rate: initialAmount || 0,
      amount: initialAmount || 0,
    }
  ]);

  const [taxRate, setTaxRate] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(DEFAULT_PAYMENT_TERMS);
  const [paymentInstructions, setPaymentInstructions] = useState(DEFAULT_PAYMENT_INSTRUCTIONS);

  const [companyInfo, setCompanyInfo] = useState(CompanySettingsStorage.getSettings());

  useEffect(() => {
    setCompanyInfo(CompanySettingsStorage.getSettings());
  }, []);

  const currencySymbol = CURRENCIES[currency as keyof typeof CURRENCIES]?.symbol || '$';

  const calculateItemAmount = (quantity: number, rate: number) => {
    return Math.round(quantity * rate * 100) / 100;
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = calculateItemAmount(
              field === 'quantity' ? value : item.quantity,
              field === 'rate' ? value : item.rate
            );
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  const addItem = () => {
    setItems([...items, {
      id: uuidv4(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    
    let paypalFee = 0;
    if (includePaypalFee) {
      const feeCalculation = calculatePayPalFees(subtotal, paypalTransactionType);
      paypalFee = feeCalculation.paypalFee;
    }

    return calculateInvoiceTotals(items, taxRate, discountRate, paypalFee, includePaypalFee);
  };

  const totals = calculateTotals();

  const generateInvoice = (): Invoice => {
    const paypalFee = includePaypalFee 
      ? calculatePayPalFees(totals.subtotal - totals.discountAmount + totals.taxAmount, paypalTransactionType).paypalFee 
      : 0;

    return {
      id: uuidv4(),
      invoiceNumber: InvoiceStorage.getNextInvoiceNumber(),
      status: 'draft',
      issueDate: new Date(),
      dueDate: new Date(dueDate),
      customer: {
        id: uuidv4(),
        ...customer
      },
      items,
      currency,
      subtotal: totals.subtotal,
      taxRate,
      taxAmount: totals.taxAmount,
      discountRate,
      discountAmount: totals.discountAmount,
      paypalFee,
      includePaypalFee,
      total: totals.total,
      notes,
      terms,
      paymentInstructions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  const handleSave = () => {
    if (!customer.name || !customer.email) {
      alert('Please fill in customer name and email');
      return;
    }

    if (items.every(item => !item.description || item.amount === 0)) {
      alert('Please add at least one item with description and amount');
      return;
    }

    const invoice = generateInvoice();
    InvoiceStorage.saveInvoice(invoice);
    
    if (onSave) {
      onSave(invoice);
    } else {
      alert(`Invoice ${invoice.invoiceNumber} saved successfully!`);
    }
  };

  const previewInvoice = generateInvoice();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-card rounded-xl shadow-lg overflow-hidden">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'form'
                  ? 'text-primary border-b-2 border-primary bg-secondary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Invoice Details
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'text-primary border-b-2 border-primary bg-secondary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'form' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input
                      type="text"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Street Address</label>
                    <input
                      type="text"
                      value={customer.address?.street}
                      onChange={(e) => setCustomer({ 
                        ...customer, 
                        address: { ...customer.address, street: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      value={customer.address?.city}
                      onChange={(e) => setCustomer({ 
                        ...customer, 
                        address: { ...customer.address, city: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="New York"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">State</label>
                      <input
                        type="text"
                        value={customer.address?.state}
                        onChange={(e) => setCustomer({ 
                          ...customer, 
                          address: { ...customer.address, state: e.target.value }
                        })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">ZIP Code</label>
                      <input
                        type="text"
                        value={customer.address?.zipCode}
                        onChange={(e) => setCustomer({ 
                          ...customer, 
                          address: { ...customer.address, zipCode: e.target.value }
                        })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Invoice Items</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Item description"
                        />
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center"
                          placeholder="Qty"
                          min="0"
                          step="1"
                        />
                      </div>
                      <div className="w-32">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {currencySymbol}
                          </span>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="w-32">
                        <div className="px-3 py-2 border rounded-lg bg-secondary/50">
                          {currencySymbol}{item.amount.toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        disabled={items.length === 1}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addItem}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Item
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Pricing & Settings</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {Object.entries(CURRENCIES).map(([code, info]) => (
                        <option key={code} value={code}>
                          {info.name} ({info.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount (%)</label>
                    <input
                      type="number"
                      value={discountRate}
                      onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePaypalFee}
                        onChange={(e) => setIncludePaypalFee(e.target.checked)}
                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                      />
                      <span className="text-sm font-medium">Include PayPal fee in invoice</span>
                    </label>
                    {includePaypalFee && (
                      <select
                        value={paypalTransactionType}
                        onChange={(e) => setPaypalTransactionType(e.target.value)}
                        className="mt-2 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value={TRANSACTION_TYPES.DOMESTIC}>Domestic (2.9% + $0.30)</option>
                        <option value={TRANSACTION_TYPES.INTERNATIONAL}>International (4.4% + $0.30)</option>
                        <option value={TRANSACTION_TYPES.MICROPAYMENT}>Micropayment (5% + $0.05)</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Any additional notes for the customer..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
                    <textarea
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Payment terms and conditions..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Instructions</label>
                    <textarea
                      value={paymentInstructions}
                      onChange={(e) => setPaymentInstructions(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="How to make payment..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">{currencySymbol}{totals.subtotal.toFixed(2)}</span>
                  </div>
                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount ({discountRate}%):</span>
                      <span>-{currencySymbol}{totals.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {totals.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({taxRate}%):</span>
                      <span>{currencySymbol}{totals.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {includePaypalFee && (
                    <div className="flex justify-between">
                      <span>PayPal Fee:</span>
                      <span>{currencySymbol}{calculatePayPalFees(totals.subtotal - totals.discountAmount + totals.taxAmount, paypalTransactionType).paypalFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-primary">{currencySymbol}{totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Save Invoice
                </button>
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
            <InvoicePreview invoice={previewInvoice} companyInfo={companyInfo} />
          )}
        </div>
      </div>
    </div>
  );
}