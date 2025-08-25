import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from './invoice-types';
import { format } from 'date-fns';
import { CURRENCIES } from './constants';

export function generateInvoicePDF(invoice: Invoice, companyInfo?: {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
}): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  const primaryColor = [37, 99, 235];
  const textColor = [31, 41, 55];
  const lightGray = [243, 244, 246];
  
  const currencySymbol = CURRENCIES[invoice.currency as keyof typeof CURRENCIES]?.symbol || '$';

  doc.setTextColor(...textColor);

  if (companyInfo?.logo) {
    try {
      doc.addImage(companyInfo.logo, 'PNG', margin, yPosition, 40, 40);
      yPosition = margin;
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo?.name || 'Your Company', pageWidth - margin, yPosition + 10, { align: 'right' });
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  
  if (companyInfo?.email) {
    doc.text(companyInfo.email, pageWidth - margin, yPosition + 10, { align: 'right' });
    yPosition += 5;
  }
  if (companyInfo?.phone) {
    doc.text(companyInfo.phone, pageWidth - margin, yPosition + 10, { align: 'right' });
    yPosition += 5;
  }
  if (companyInfo?.address) {
    const addressLines = companyInfo.address.split('\n');
    addressLines.forEach(line => {
      doc.text(line, pageWidth - margin, yPosition + 10, { align: 'right' });
      yPosition += 5;
    });
  }

  yPosition = Math.max(yPosition, 70);

  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('INVOICE', margin, yPosition);
  
  const statusColors: Record<Invoice['status'], number[]> = {
    draft: [107, 114, 128],
    sent: [59, 130, 246],
    paid: [34, 197, 94],
    overdue: [239, 68, 68],
    cancelled: [251, 146, 60],
  };
  
  const statusColor = statusColors[invoice.status];
  doc.setFillColor(...statusColor);
  doc.roundedRect(margin + 70, yPosition - 8, 40, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(invoice.status.toUpperCase(), margin + 90, yPosition - 2, { align: 'center' });
  
  yPosition += 15;

  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const invoiceDetails = [
    ['Invoice Number:', invoice.invoiceNumber],
    ['Issue Date:', format(invoice.issueDate, 'MMM dd, yyyy')],
    ['Due Date:', format(invoice.dueDate, 'MMM dd, yyyy')],
  ];
  
  if (invoice.paidAt) {
    invoiceDetails.push(['Paid Date:', format(invoice.paidAt, 'MMM dd, yyyy')]);
  }
  
  invoiceDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 35, yPosition);
    yPosition += 6;
  });

  yPosition += 10;
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, yPosition - 5, (pageWidth - 2 * margin) / 2 - 5, 50, 3, 3, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Bill To:', margin + 5, yPosition + 5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(invoice.customer.name, margin + 5, yPosition + 12);
  
  if (invoice.customer.email) {
    doc.text(invoice.customer.email, margin + 5, yPosition + 18);
  }
  
  if (invoice.customer.phone) {
    doc.text(invoice.customer.phone, margin + 5, yPosition + 24);
  }
  
  if (invoice.customer.address) {
    let addressY = yPosition + 30;
    if (invoice.customer.address.street) {
      doc.text(invoice.customer.address.street, margin + 5, addressY);
      addressY += 6;
    }
    if (invoice.customer.address.city || invoice.customer.address.state || invoice.customer.address.zipCode) {
      const cityStateZip = [
        invoice.customer.address.city,
        invoice.customer.address.state,
        invoice.customer.address.zipCode
      ].filter(Boolean).join(', ');
      doc.text(cityStateZip, margin + 5, addressY);
    }
  }

  yPosition += 55;

  const tableData = invoice.items.map(item => [
    item.description,
    item.quantity.toString(),
    `${currencySymbol}${item.rate.toFixed(2)}`,
    `${currencySymbol}${item.amount.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Description', 'Qty', 'Rate', 'Amount']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      textColor: textColor,
      fontSize: 9,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  const summaryX = pageWidth - margin - 80;
  const summaryItems: Array<[string, string, boolean?]> = [
    ['Subtotal:', `${currencySymbol}${invoice.subtotal.toFixed(2)}`],
  ];
  
  if (invoice.discountAmount && invoice.discountAmount > 0) {
    summaryItems.push([
      `Discount (${invoice.discountRate}%):`,
      `-${currencySymbol}${invoice.discountAmount.toFixed(2)}`
    ]);
  }
  
  if (invoice.taxAmount && invoice.taxAmount > 0) {
    summaryItems.push([
      `Tax (${invoice.taxRate}%):`,
      `${currencySymbol}${invoice.taxAmount.toFixed(2)}`
    ]);
  }
  
  if (invoice.paypalFee && invoice.includePaypalFee) {
    summaryItems.push([
      'PayPal Fee:',
      `${currencySymbol}${invoice.paypalFee.toFixed(2)}`
    ]);
  }
  
  summaryItems.push(['Total:', `${currencySymbol}${invoice.total.toFixed(2)}`, true]);

  summaryItems.forEach(([label, value, isBold]) => {
    if (isBold) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setDrawColor(...primaryColor);
      doc.line(summaryX - 10, yPosition - 2, pageWidth - margin, yPosition - 2);
      yPosition += 3;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
    }
    
    doc.text(label, summaryX, yPosition);
    doc.text(value, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += isBold ? 8 : 6;
  });

  yPosition += 10;

  if (invoice.notes || invoice.terms || invoice.paymentInstructions) {
    if (yPosition + 40 > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    if (invoice.notes) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Notes:', margin, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const noteLines = doc.splitTextToSize(invoice.notes, pageWidth - 2 * margin);
      doc.text(noteLines, margin, yPosition);
      yPosition += noteLines.length * 5 + 8;
    }
    
    if (invoice.terms) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Terms & Conditions:', margin, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const termLines = doc.splitTextToSize(invoice.terms, pageWidth - 2 * margin);
      doc.text(termLines, margin, yPosition);
      yPosition += termLines.length * 5 + 8;
    }
    
    if (invoice.paymentInstructions) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Payment Instructions:', margin, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const instructionLines = doc.splitTextToSize(invoice.paymentInstructions, pageWidth - 2 * margin);
      doc.text(instructionLines, margin, yPosition);
    }
  }

  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(
    `Generated on ${format(new Date(), 'MMM dd, yyyy')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc;
}

export function downloadInvoicePDF(invoice: Invoice, companyInfo?: any): void {
  const pdf = generateInvoicePDF(invoice, companyInfo);
  pdf.save(`${invoice.invoiceNumber}.pdf`);
}

export function getInvoicePDFBlob(invoice: Invoice, companyInfo?: any): Blob {
  const pdf = generateInvoicePDF(invoice, companyInfo);
  return pdf.output('blob');
}

export function getInvoicePDFDataUri(invoice: Invoice, companyInfo?: any): string {
  const pdf = generateInvoicePDF(invoice, companyInfo);
  return pdf.output('datauristring');
}