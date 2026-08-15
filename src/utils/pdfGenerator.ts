import { jsPDF } from 'jspdf';
import type { InvoiceItem } from '../types/invoice';
import type { 
  FinancialReportData, 
  ProjectReportData, 
  ClientReportData, 
  ToolsUsageReportData 
} from '../services/reportingService';
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
  doc.text('Digital Product & Creative Studio • portal.gmdigitalstudio.app', 32, 25);

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
  doc.text(invoice.dueDate || 'Upon Receipt', rightX + 30, 48);

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
      'Please submit payment before the specified due date. For payment submission and status tracking, visit your client portal.',
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

/**
 * Pure Vector Multi-Page Executive Studio Telemetry Report PDF Generator
 */
export const generateExecutiveReportPDF = (
  financialData: FinancialReportData | null,
  projectData: ProjectReportData | null,
  clientData: ClientReportData | null,
  toolsData: ToolsUsageReportData | null,
  timeframe: string = 'all'
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const brandOrange = [249, 115, 22]; // #f97316
  const textDark = [17, 24, 39]; // #111827
  const textGray = [107, 114, 128]; // #6b7280
  const bgLight = [249, 250, 251];

  let currentY = 15;

  const drawHeader = (_pageNumber?: number) => {
    // Top Brand Line Accent
    doc.setFillColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.rect(0, 0, 210, 4, 'F');

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text('GM DIGITAL STUDIO', 15, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text('Executive Performance & Telemetry Statement • Confidential', 15, 21);

    // Right Side Meta
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.text(`TIMEFRAME: ${timeframe.toUpperCase()}`, 195, 16, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 195, 21, { align: 'right' });

    // Divider
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.4);
    doc.line(15, 25, 195, 25);

    return 32;
  };

  currentY = drawHeader(1);

  // 1. FINANCIAL SUMMARY SECTION
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('1. FINANCIAL PERFORMANCE TELEMETRY', 15, currentY);
  currentY += 5;

  // 4 Metric Stat Cards (Grid)
  const cardW = 42;
  const cardH = 22;
  const gap = 4;
  const stats = [
    { title: 'Total Billed', value: `$${(financialData?.totalBilled || 0).toLocaleString()}`, sub: `${financialData?.totalInvoices || 0} invoices issued` },
    { title: 'Collected Rev.', value: `$${(financialData?.paidAmount || 0).toLocaleString()}`, sub: 'Fully settled payments' },
    { title: 'Pending / Overdue', value: `$${((financialData?.pendingAmount || 0) + (financialData?.overdueAmount || 0)).toLocaleString()}`, sub: 'Outstanding balance' },
    { title: 'Avg Invoice Value', value: `$${Math.round(financialData?.avgInvoiceValue || 0).toLocaleString()}`, sub: 'Average statement' },
  ];

  stats.forEach((st, idx) => {
    const cardX = 15 + idx * (cardW + gap);
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(cardX, currentY, cardW, cardH, 2, 2, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(cardX, currentY, cardW, cardH, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text(st.title.toUpperCase(), cardX + 4, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(st.value, cardX + 4, currentY + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text(st.sub, cardX + 4, currentY + 18);
  });

  currentY += cardH + 10;

  // 2. PROJECT & CLIENT OVERVIEW SECTION
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('2. PROJECT DELIVERY & CLIENT PORTFOLIO OVERVIEW', 15, currentY);
  currentY += 5;

  const projStats = [
    { title: 'Total Projects', value: `${projectData?.totalProjects || 0}`, sub: `${projectData?.activeProjects || 0} active, ${projectData?.completedProjects || 0} completed` },
    { title: 'Avg Completion', value: `${Math.round(projectData?.avgProgress || 0)}%`, sub: `${projectData?.completedMilestones || 0}/${projectData?.totalMilestones || 0} milestones` },
    { title: 'Total Clients', value: `${clientData?.totalClients || 0}`, sub: `${clientData?.activeClients || 0} active accounts` },
    { title: 'Avg Rev / Client', value: `$${Math.round(clientData?.avgRevenuePerClient || 0).toLocaleString()}`, sub: 'Lifetime client value' },
  ];

  projStats.forEach((st, idx) => {
    const cardX = 15 + idx * (cardW + gap);
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(cardX, currentY, cardW, cardH, 2, 2, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(cardX, currentY, cardW, cardH, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text(st.title.toUpperCase(), cardX + 4, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(st.value, cardX + 4, currentY + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text(st.sub, cardX + 4, currentY + 18);
  });

  currentY += cardH + 10;

  // 3. SAAS STUDIO TOOLS & AUDIT LOG TABLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('3. SAAS STUDIO TOOLS USAGE & AUDIT TRAIL LOG', 15, currentY);
  currentY += 6;

  // Table Header Function
  const drawTableHeader = (y: number) => {
    doc.setFillColor(243, 244, 246);
    doc.rect(15, y, 180, 7, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.rect(15, y, 180, 7, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text('CLIENT / USER', 18, y + 4.8);
    doc.text('EMAIL ADDRESS', 68, y + 4.8);
    doc.text('ACTION / WORKSPACE INTERACTION', 120, y + 4.8);
    doc.text('DATE & TIME', 192, y + 4.8, { align: 'right' });
    return y + 7;
  };

  currentY = drawTableHeader(currentY);

  const activities = toolsData?.clientActivityList || [];
  if (activities.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text('No client activity log records found for the selected timeframe.', 18, currentY + 8);
  } else {
    activities.forEach((act, idx) => {
      // Check page height space (Smart Page Break Check)
      if (currentY > 270) {
        doc.addPage();
        drawHeader(doc.getNumberOfPages());
        currentY = drawTableHeader(32);
      }

      const isEven = idx % 2 === 0;
      if (isEven) {
        doc.setFillColor(252, 252, 253);
        doc.rect(15, currentY, 180, 7, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      const safeName = (act.user_name || 'Client User').substring(0, 24);
      doc.text(safeName, 18, currentY + 4.8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      const safeEmail = (act.user_email || 'client@company.com').substring(0, 26);
      doc.text(safeEmail, 68, currentY + 4.8);

      const actionText = act.details || act.action || 'Workspace Launch';
      doc.text(actionText.substring(0, 36), 120, currentY + 4.8);

      const dateStr = act.created_at ? new Date(act.created_at).toLocaleDateString() : 'Today';
      doc.text(dateStr, 192, currentY + 4.8, { align: 'right' });

      doc.setDrawColor(243, 244, 246);
      doc.line(15, currentY + 7, 195, currentY + 7);
      currentY += 7;
    });
  }

  // Page Numbers Footer on All Pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text(`Page ${i} of ${totalPages}`, 195, 290, { align: 'right' });
    doc.text('GM Digital Studio • Executive Operations Report • Confidential', 15, 290);
  }

  return doc;
};

export const downloadExecutiveReportPDF = (
  financialData: FinancialReportData | null,
  projectData: ProjectReportData | null,
  clientData: ClientReportData | null,
  toolsData: ToolsUsageReportData | null,
  timeframe: string = 'all'
) => {
  const doc = generateExecutiveReportPDF(financialData, projectData, clientData, toolsData, timeframe);
  const filename = `GM_Studio_Executive_Report_${timeframe}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
