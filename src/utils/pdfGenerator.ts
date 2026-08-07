import { jsPDF } from 'jspdf';
import type { InvoiceItem } from '../types/invoice';
import logoImg from '../assets/icon-logo.png';

export const generateInvoicePDF = (invoice: InvoiceItem): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true, // Enable built-in stream compression for minimal file size
  });

  const brandOrange = [249, 115, 22]; // #f97316
  const textDark = [17, 24, 39]; // #111827
  const textGray = [107, 114, 128]; // #6b7280

  // 1. Brand Header Section
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  // Top Brand Line Accent
  doc.setFillColor(brandOrange[0], brandOrange[1], brandOrange[2]);
  doc.rect(0, 0, 210, 4, 'F');

  // Try adding brand logo image, with graceful text fallback
  try {
    const img = new Image();
    img.src = logoImg;
    doc.addImage(img, 'PNG', 15, 14, 12, 12);
  } catch (e) {
    // Fallback vector icon circle
    doc.setFillColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.circle(21, 20, 6, 'F');
  }

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('GM DIGITAL STUDIO', 32, 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('Digital Product & Creative Studio • www.gmdigitalstudio.app', 32, 25);

  // Invoice Title & Number
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
  doc.text('INVOICE', 195, 21, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`# ${invoice.invoiceNumber || invoice.id}`, 195, 27, { align: 'right' });

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.4);
  doc.line(15, 34, 195, 34);

  // 2. Client & Invoice Meta Info Section
  // Left Box: Billed To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('BILLED TO', 15, 42);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(invoice.clientCompany || invoice.clientName || 'Valued Client', 15, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  if (invoice.clientName && invoice.clientName !== invoice.clientCompany) {
    doc.text(`Attn: ${invoice.clientName}`, 15, 53);
  }
  doc.text(invoice.clientEmail || 'client@company.com', 15, invoice.clientName ? 58 : 53);

  // Right Box: Meta Details (Date, Due Date, Status)
  const rightX = 140;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('INVOICE DATE', rightX, 42);
  doc.text('DUE DATE', rightX + 30, 42);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(invoice.date || 'Today', rightX, 48);
  doc.text(invoice.dueDate || '14 Days', rightX + 30, 48);

  // Status Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('PAYMENT STATUS', rightX, 56);

  const statusText = (invoice.status || 'Pending').toUpperCase();
  let badgeColor = [59, 130, 246]; // Blue for Pending
  if (invoice.status === 'Paid') badgeColor = [16, 185, 129]; // Emerald Green
  if (invoice.status === 'Overdue') badgeColor = [239, 68, 68]; // Red
  if (invoice.status === 'Pending Verification') badgeColor = [147, 51, 234]; // Purple

  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(rightX, 59, 36, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(statusText, rightX + 18, 63.3, { align: 'center' });

  // 3. Itemized Deliverables Table
  const tableY = 74;

  // Table Header Bar
  doc.setFillColor(249, 250, 251);
  doc.rect(15, tableY, 180, 8, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(15, tableY, 180, 8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('DESCRIPTION / DELIVERABLE', 20, tableY + 5.5);
  doc.text('QTY', 125, tableY + 5.5, { align: 'center' });
  doc.text('RATE', 155, tableY + 5.5, { align: 'right' });
  doc.text('AMOUNT', 190, tableY + 5.5, { align: 'right' });

  // Table Line Items
  let lineY = tableY + 14;
  const items = invoice.items && invoice.items.length > 0
    ? invoice.items
    : [
        {
          id: '1',
          description: invoice.description || 'Studio Services',
          quantity: 1,
          rate: parseFloat(invoice.amount.replace(/[^0-9.]/g, '')) || 5000,
          amount: parseFloat(invoice.amount.replace(/[^0-9.]/g, '')) || 5000,
        },
      ];

  items.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(item.description || 'Deliverable Item', 20, lineY);
    doc.text(String(item.quantity), 125, lineY, { align: 'center' });
    doc.text(`$${item.rate.toLocaleString()}`, 155, lineY, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(`$${item.amount.toLocaleString()}`, 190, lineY, { align: 'right' });

    lineY += 9;
    doc.setDrawColor(243, 244, 246);
    doc.line(15, lineY - 4, 195, lineY - 4);
  });

  // 4. Totals Calculation Box
  const numAmount = parseFloat(invoice.amount.replace(/[^0-9.]/g, '')) || 5000;
  const subtotal = invoice.subtotal ?? numAmount;
  const tax = invoice.tax ?? 0;
  const tip = invoice.tipAmount ?? 0;
  const total = invoice.total ?? (subtotal + tax + tip);
  const taxLabel = invoice.taxRate !== undefined ? `Tax (${invoice.taxRate}%):` : tax > 0 ? `Tax:` : `Tax (0%):`;

  let currentCalcY = lineY + 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('Subtotal:', 145, currentCalcY);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`$${subtotal.toLocaleString()}`, 190, currentCalcY, { align: 'right' });

  currentCalcY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text(taxLabel, 145, currentCalcY);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`$${tax.toLocaleString()}`, 190, currentCalcY, { align: 'right' });

  if (tip > 0) {
    currentCalcY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text('Gratuity / Tip:', 145, currentCalcY);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`+$${tip.toLocaleString()}`, 190, currentCalcY, { align: 'right' });
  }

  // Total Highlights Line
  currentCalcY += 5;
  doc.setFillColor(brandOrange[0], brandOrange[1], brandOrange[2]);
  doc.rect(130, currentCalcY, 65, 9, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL DUE:', 135, currentCalcY + 6);
  doc.text(`$${total.toLocaleString()}`, 190, currentCalcY + 6, { align: 'right' });

  // 5. Payment Terms & Footnote
  const footerY = 245;
  doc.setDrawColor(229, 231, 235);
  doc.line(15, footerY, 195, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('TERMS & INSTRUCTIONS:', 15, footerY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text(
    invoice.notes ||
      'Please submit payment within 14 business days. For bank wire transfer or card checkout details, visit your client portal.',
    15,
    footerY + 11,
    { maxWidth: 180 }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text('GM Digital Studio Inc. • Official Client Billing Statement • Confidential', 105, 285, { align: 'center' });

  return doc;
};

export const downloadInvoicePDF = (invoice: InvoiceItem) => {
  const doc = generateInvoicePDF(invoice);
  const filename = `${invoice.invoiceNumber || 'Invoice'}_GM_Digital_Studio.pdf`;
  doc.save(filename);
};
