import { supabase } from './supabase';
import { emailRecordService } from './emailRecordService';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  services?: string[];
  budget?: string;
  timeline?: string;
  message: string;
}

export interface WelcomeClientData {
  fullName: string;
  email: string;
  company: string;
  assignedPackage?: string;
  portalPassword?: string;
}

export interface InvoiceAlertData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: string;
  dueDate?: string;
  status: string;
  rejectionReason?: string;
  paymentProofUrl?: string;
}

export interface PaymentProofAlertData {
  invoiceNumber: string;
  clientName: string;
  amount: string;
  paymentMethod: string;
  referenceNumber: string;
  proofUrl?: string;
}

export interface ProjectAlertData {
  projectTitle: string;
  clientName: string;
  clientEmail: string;
  status: string;
  milestoneTitle?: string;
  milestoneStatus?: string;
  notes?: string;
}

export interface ProjectStatusAlertData {
  projectTitle: string;
  clientName: string;
  clientEmail: string;
  newStatus: string;
  previousStatus?: string;
}

export interface ToolRequestAlertData {
  clientName: string;
  clientEmail: string;
  toolName: string;
  status: 'requested' | 'approved' | 'declined';
  notes?: string;
}

export interface CustomComposeEmailData {
  to: string[];
  subject: string;
  bodyMessage: string;
  rawHtml?: string;
  ctaText?: string;
  ctaUrl?: string;
  recipientName?: string;
}

export interface SendEmailResponse {
  success: boolean;
  message: string;
}

/**
 * Utility function to sanitize user-submitted strings against HTML injection in email templates
 */
export const escapeHtml = (str: string | undefined | null): string => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Default verified sender addresses using custom domain gmdigitalstudio.app
const SENDER = 'GM Digital Studio <notifications@gmdigitalstudio.app>';
const SUPPORT_SENDER = 'GM Digital Studio Support <support@gmdigitalstudio.app>';
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

// Generic HTML Email Shell with Clean Corporate Light Branding
export const renderEmailShell = (title: string, bodyHtml: string, ctaText?: string, ctaUrl?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 32px 16px; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
    .accent-bar { height: 4px; background: linear-gradient(90deg, #ea580c 0%, #f97316 100%); }
    .header { padding: 28px 32px 20px 32px; border-bottom: 1px solid #f1f5f9; text-align: left; }
    .brand-title { color: #0f172a; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
    .brand-sub { color: #ea580c; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; margin-top: 4px; }
    .content { padding: 32px; font-size: 15px; line-height: 1.6; color: #334155; }
    .content-title { color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 16px 0; letter-spacing: -0.3px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 24px 0; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .info-table td { padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .info-table tr:last-child td { border-bottom: none; }
    .info-table td.label { font-weight: 600; color: #64748b; width: 38%; }
    .info-table td.value { color: #0f172a; font-weight: 700; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
    .cta-container { text-align: left; margin: 32px 0 16px 0; }
    .cta-button { display: inline-block; background-color: #ea580c; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25); }
    .quote-box { background: #f8fafc; padding: 16px; border-left: 4px solid #ea580c; border-radius: 8px; color: #0f172a; font-size: 14px; margin: 16px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; font-weight: 500; }
    .footer { background-color: #f8fafc; padding: 24px 32px; text-align: left; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.5; }
    .footer-brand { font-weight: 800; color: #1e293b; font-size: 13px; margin-bottom: 4px; letter-spacing: -0.2px; }
    .footer-copy { color: #94a3b8; font-size: 12px; }
    .footer-link { color: #ea580c; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="accent-bar"></div>
    <div class="header">
      <h1 class="brand-title">GM DIGITAL STUDIO</h1>
      <div class="brand-sub">Official Platform Notification</div>
    </div>
    <div class="content">
      <h2 class="content-title">${title}</h2>
      ${bodyHtml}
      ${ctaText && ctaUrl ? `
        <div class="cta-container">
          <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
        </div>
      ` : ''}
    </div>
    <div class="footer">
      <div class="footer-brand">GM DIGITAL STUDIO</div>
      <div class="footer-copy">&copy; ${new Date().getFullYear()} GM Digital Studio. All rights reserved. • <a href="https://gmdigitalstudio.app" class="footer-link">gmdigitalstudio.app</a></div>
    </div>
  </div>
</body>
</html>
`;

// Secure email dispatch routing 100% via Supabase Serverless Edge Function (No client API key exposure)
const sendViaResend = async (
  to: string[],
  subject: string,
  html: string,
  fromSender?: string,
  mode: 'contact_form' | 'system_notification' | 'custom_compose' = 'system_notification'
): Promise<SendEmailResponse> => {
  const activeSender = fromSender || SENDER;

  if (!supabase) {
    throw new Error('Database service is not initialized. Cannot send email notification.');
  }

  try {
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html, from: activeSender, mode },
    });

    if (edgeError) {
      console.error('[Email Service] Edge Function Dispatch Error:', edgeError);
      throw new Error(`Email service error: ${edgeError.message || 'Serverless edge function call failed'}`);
    }

    if (edgeData && !edgeData.success && edgeData.error) {
      throw new Error(`Email dispatch failed: ${edgeData.error}`);
    }

    return {
      success: true,
      message: edgeData?.message || 'Email notification dispatched successfully.',
    };
  } catch (err: any) {
    console.error('[Email Service] Dispatch Exception:', err);
    throw new Error(err.message || 'Failed to send email notification.');
  }
};

/**
 * 1. Send Contact Form Inquiries (Admin notification + Auto-reply to visitor)
 */
export const sendContactEmail = async (formData: ContactFormData): Promise<SendEmailResponse> => {
  const safeName = escapeHtml(formData.name);
  const safeEmail = escapeHtml(formData.email);
  const safeCompany = escapeHtml(formData.company || 'N/A');
  const safeService = escapeHtml(formData.service || (formData.services ? formData.services.join(', ') : 'General Inquiry'));
  const safeBudget = escapeHtml(formData.budget || 'N/A');
  const safeMessage = escapeHtml(formData.message);

  const adminHtml = renderEmailShell(
    `New Contact Inquiry from ${safeName}`,
    `
      <p>A new project inquiry has been submitted via the contact form on GM Digital Studio:</p>
      <table class="info-table">
        <tr><td class="label">Full Name</td><td class="value">${safeName}</td></tr>
        <tr><td class="label">Email Address</td><td class="value">${safeEmail}</td></tr>
        <tr><td class="label">Company</td><td class="value">${safeCompany}</td></tr>
        <tr><td class="label">Service Required</td><td class="value"><span class="badge">${safeService}</span></td></tr>
        <tr><td class="label">Budget Range</td><td class="value">${safeBudget}</td></tr>
      </table>
      <p><strong>Message / Project Description:</strong></p>
      <div class="quote-box">
        ${safeMessage}
      </div>
    `,
    'View Contact Submissions',
    'https://gmdigitalstudio.app/admin/dashboard'
  );

  const res = await sendViaResend([ADMIN_EMAIL], `New Inquiry from ${safeName}`, adminHtml, undefined, 'contact_form');
  return {
    success: res.success,
    message: 'Thank you! Your inquiry has been sent successfully. Our team will contact you shortly.',
  };
};

/**
 * 2. Send Client Welcome Onboarding Email (When Admin creates a Client account)
 */
export const sendWelcomeClientEmail = async (clientData: WelcomeClientData): Promise<SendEmailResponse> => {
  const safeFullName = escapeHtml(clientData.fullName);
  const safeCompany = escapeHtml(clientData.company);
  const safePackage = escapeHtml(clientData.assignedPackage || 'Standard Agency Service');
  const safeEmail = escapeHtml(clientData.email);
  const safePassword = clientData.portalPassword ? escapeHtml(clientData.portalPassword) : '';

  const html = renderEmailShell(
    `Welcome to GM Digital Studio Client Portal!`,
    `
      <p>Hello <strong>${safeFullName}</strong>,</p>
      <p>Your client portal account for <strong>${safeCompany}</strong> has been successfully provisioned on the GM Digital Studio platform.</p>
      <table class="info-table">
        <tr><td class="label">Client Name</td><td class="value">${safeFullName}</td></tr>
        <tr><td class="label">Company</td><td class="value">${safeCompany}</td></tr>
        <tr><td class="label">Assigned Package</td><td class="value"><span class="badge">${safePackage}</span></td></tr>
        <tr><td class="label">Portal Email</td><td class="value">${safeEmail}</td></tr>
        ${safePassword ? `<tr><td class="label">Initial Password</td><td class="value" style="font-family: monospace; color: #ea580c;">${safePassword}</td></tr>` : ''}
      </table>
      <p>You can now log into your private client workspace to track active project progress, view interactive milestones, download invoices, and communicate directly with our team.</p>
      <p style="background: #fff7ed; padding: 12px 16px; border-left: 4px solid #ea580c; border-radius: 6px; color: #c2410c; font-size: 13px; margin-top: 16px;">
        <strong>🔒 Account Security Note:</strong> For optimal account security, please log into your portal and update your initial password under <strong>Profile Settings</strong>.
      </p>
    `,
    'Access Client Portal',
    'https://gmdigitalstudio.app/login'
  );

  return await sendViaResend([clientData.email], `Welcome to GM Digital Studio - Portal Account Ready`, html);
};

/**
 * 3. Send Invoice Billing Telemetry Alerts (Issuance, Payment Proof, Approvals, Rejections)
 */
export const sendInvoiceAlertEmail = async (invoiceData: InvoiceAlertData): Promise<SendEmailResponse> => {
  const safeInvoiceNum = escapeHtml(invoiceData.invoiceNumber);
  const safeClientName = escapeHtml(invoiceData.clientName);
  const safeClientEmail = escapeHtml(invoiceData.clientEmail);
  const safeAmount = escapeHtml(invoiceData.amount);
  const safeDueDate = invoiceData.dueDate ? escapeHtml(invoiceData.dueDate) : '';
  const safeRejectionReason = invoiceData.rejectionReason ? escapeHtml(invoiceData.rejectionReason) : '';

  let title = `Invoice Update: ${safeInvoiceNum}`;
  let recipient = invoiceData.clientEmail;
  let bodyContent = '';

  switch (invoiceData.status) {
    case 'Pending':
      title = `New Invoice Issued: ${safeInvoiceNum}`;
      bodyContent = `
        <p>Dear <strong>${safeClientName}</strong>,</p>
        <p>A new invoice has been issued for your active project scope at GM Digital Studio.</p>
        <table class="info-table">
          <tr><td class="label">Invoice Number</td><td class="value">${safeInvoiceNum}</td></tr>
          <tr><td class="label">Total Amount</td><td class="value" style="color: #ea580c; font-size: 16px;">${safeAmount}</td></tr>
          ${safeDueDate ? `<tr><td class="label">Due Date</td><td class="value">${safeDueDate}</td></tr>` : ''}
          <tr><td class="label">Status</td><td class="value"><span class="badge">Payment Pending</span></td></tr>
        </table>
        <p>Please log into your client portal to review the itemized breakdown and submit your payment proof.</p>
      `;
      break;

    case 'Under Approval':
      title = `Payment Proof Received: ${safeInvoiceNum}`;
      recipient = ADMIN_EMAIL;
      bodyContent = `
        <p>Client <strong>${safeClientName}</strong> has submitted payment proof for invoice <strong>${safeInvoiceNum}</strong>.</p>
        <table class="info-table">
          <tr><td class="label">Invoice Number</td><td class="value">${safeInvoiceNum}</td></tr>
          <tr><td class="label">Client Email</td><td class="value">${safeClientEmail}</td></tr>
          <tr><td class="label">Amount</td><td class="value">${safeAmount}</td></tr>
          <tr><td class="label">Status</td><td class="value"><span class="badge" style="background: #eab308; color: #000;">Under Review</span></td></tr>
        </table>
        <p>Please inspect the payment proof document in the Admin Invoices dashboard.</p>
      `;
      break;

    case 'Paid':
      title = `Invoice Payment Confirmed: ${safeInvoiceNum}`;
      bodyContent = `
        <p>Dear <strong>${safeClientName}</strong>,</p>
        <p>Your payment for invoice <strong>${safeInvoiceNum}</strong> has been verified and confirmed by GM Digital Studio.</p>
        <table class="info-table">
          <tr><td class="label">Invoice Number</td><td class="value">${safeInvoiceNum}</td></tr>
          <tr><td class="label">Amount Paid</td><td class="value" style="color: #22c55e;">${safeAmount}</td></tr>
          <tr><td class="label">Status</td><td class="value"><span class="badge" style="background: #22c55e;">PAID & VERIFIED</span></td></tr>
        </table>
        <p>Thank you for your prompt payment! A copy of your verified PDF invoice is available for download in your portal.</p>
      `;
      break;

    case 'Request Rejected':
      title = `Invoice Request Action Required: ${safeInvoiceNum}`;
      bodyContent = `
        <p>Dear <strong>${safeClientName}</strong>,</p>
        <p>Your custom invoice request or payment submission for invoice <strong>${safeInvoiceNum}</strong> requires attention.</p>
        <table class="info-table">
          <tr><td class="label">Invoice Number</td><td class="value">${safeInvoiceNum}</td></tr>
          <tr><td class="label">Status</td><td class="value"><span class="badge" style="background: #ef4444;">Action Required</span></td></tr>
        </table>
        ${safeRejectionReason ? `
          <p><strong>Admin Rejection Notes:</strong></p>
          <blockquote style="background: #1e293b; padding: 12px; border-left: 4px solid #ef4444; color: #f8fafc;">
            ${safeRejectionReason}
          </blockquote>
        ` : ''}
        <p>Please update your invoice details or re-submit valid payment proof in your portal workspace.</p>
      `;
      break;

    default:
      bodyContent = `<p>Invoice status updated to <strong>${escapeHtml(invoiceData.status)}</strong> for invoice ${safeInvoiceNum}.</p>`;
  }

  const html = renderEmailShell(title, bodyContent, 'View Invoices in Portal', 'https://gmdigitalstudio.app/client/invoices');
  return await sendViaResend([recipient], title, html);
};

/**
 * 4. Send Project Milestone & Status Update Alerts
 */
export const sendProjectStatusAlertEmail = async (projectData: ProjectAlertData): Promise<SendEmailResponse> => {
  const safeTitle = escapeHtml(projectData.projectTitle);
  const safeClientName = escapeHtml(projectData.clientName);
  const safeStatus = escapeHtml(projectData.status);
  const safeMilestoneTitle = projectData.milestoneTitle ? escapeHtml(projectData.milestoneTitle) : '';
  const safeMilestoneStatus = projectData.milestoneStatus ? escapeHtml(projectData.milestoneStatus) : '';
  const safeNotes = projectData.notes ? escapeHtml(projectData.notes) : '';

  const title = `Project Update: ${safeTitle}`;
  const bodyContent = `
    <p>Dear <strong>${safeClientName}</strong>,</p>
    <p>There is a status update on your active project <strong>${safeTitle}</strong> at GM Digital Studio.</p>
    <table class="info-table">
      <tr><td class="label">Project Title</td><td class="value">${safeTitle}</td></tr>
      <tr><td class="label">Current Status</td><td class="value"><span class="badge">${safeStatus.toUpperCase()}</span></td></tr>
      ${safeMilestoneTitle ? `<tr><td class="label">Milestone</td><td class="value">${safeMilestoneTitle}</td></tr>` : ''}
      ${safeMilestoneStatus ? `<tr><td class="label">Phase Status</td><td class="value">${safeMilestoneStatus}</td></tr>` : ''}
    </table>
    ${safeNotes ? `
      <p><strong>Update Notes:</strong></p>
      <blockquote style="background: #1e293b; padding: 12px; border-left: 4px solid #ea580c; color: #f8fafc;">
        ${safeNotes}
      </blockquote>
    ` : ''}
    <p>Log into your interactive project board to review progress updates or sign off on deliverables.</p>
  `;

  const html = renderEmailShell(title, bodyContent, 'View Interactive Timeline', 'https://gmdigitalstudio.app/client/projects');
  return await sendViaResend([projectData.clientEmail], title, html);
};

/**
 * 5. Send Studio Tool Request Email Alerts (Requests, Approvals, Rejections)
 */
export const sendToolRequestAlertEmail = async (data: ToolRequestAlertData): Promise<SendEmailResponse> => {
  const safeClientName = escapeHtml(data.clientName);
  const safeClientEmail = escapeHtml(data.clientEmail);
  const safeToolName = escapeHtml(data.toolName);
  const safeNotes = data.notes ? escapeHtml(data.notes) : '';

  let title = `Studio Tool Access: ${safeToolName}`;
  let recipient = data.clientEmail;
  let bodyContent = '';

  if (data.status === 'requested') {
    title = `New Studio Tool Requested: ${safeToolName}`;
    recipient = ADMIN_EMAIL;
    bodyContent = `
      <p>Client <strong>${safeClientName}</strong> (${safeClientEmail}) has requested access to the studio tool: <strong>${safeToolName}</strong>.</p>
      <table class="info-table">
        <tr><td class="label">Client Name</td><td class="value">${safeClientName}</td></tr>
        <tr><td class="label">Client Email</td><td class="value">${safeClientEmail}</td></tr>
        <tr><td class="label">Requested Tool</td><td class="value"><span class="badge">${safeToolName}</span></td></tr>
        <tr><td class="label">Status</td><td class="value">Pending Admin Review</td></tr>
      </table>
      <p>Please log into the Admin Control Center to grant or decline tool access.</p>
    `;
  } else if (data.status === 'approved') {
    title = `Studio Tool Access Unlocked: ${safeToolName}`;
    bodyContent = `
      <p>Hello <strong>${safeClientName}</strong>,</p>
      <p>Your access request for <strong>${safeToolName}</strong> has been approved by the Admin team!</p>
      <table class="info-table">
        <tr><td class="label">Studio Tool</td><td class="value">${safeToolName}</td></tr>
        <tr><td class="label">Access Status</td><td class="value"><span class="badge" style="background: #16a34a; color: #fff;">Unlocked & Active</span></td></tr>
      </table>
      <p>You can now launch and use this tool directly inside your private Client Portal workspace.</p>
    `;
  } else {
    title = `Studio Tool Access Request Update: ${safeToolName}`;
    bodyContent = `
      <p>Hello <strong>${safeClientName}</strong>,</p>
      <p>Your access request for <strong>${safeToolName}</strong> was reviewed by the Admin team and could not be approved at this time.</p>
      <table class="info-table">
        <tr><td class="label">Studio Tool</td><td class="value">${safeToolName}</td></tr>
        <tr><td class="label">Request Status</td><td class="value"><span class="badge" style="background: #dc2626; color: #fff;">Declined</span></td></tr>
      </table>
      ${safeNotes ? `<p><strong>Admin Feedback:</strong> ${safeNotes}</p>` : ''}
    `;
  }

  const html = renderEmailShell(title, bodyContent, 'Access Client Tools', 'https://gmdigitalstudio.app/client/tools');
  const res = await sendViaResend([recipient], title, html);
  return {
    success: res.success,
    message: `Studio tool ${data.status} notification sent successfully.`,
  };
};

/**
 * 6. Send Project Completion Client Feedback Alert to Admin
 */
export const sendProjectFeedbackAlertEmail = async (data: {
  projectTitle: string;
  clientName: string;
  clientEmail: string;
  rating: number;
  comment: string;
}): Promise<SendEmailResponse> => {
  const safeTitle = escapeHtml(data.projectTitle);
  const safeClientName = escapeHtml(data.clientName);
  const safeClientEmail = escapeHtml(data.clientEmail);
  const safeComment = escapeHtml(data.comment);

  const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
  const title = `New Client Feedback Received: ${safeTitle}`;
  const bodyContent = `
    <p>Client <strong>${safeClientName}</strong> (${safeClientEmail}) has submitted feedback for completed project <strong>${safeTitle}</strong>!</p>
    <table class="info-table">
      <tr><td class="label">Project Title</td><td class="value">${safeTitle}</td></tr>
      <tr><td class="label">Client Name</td><td class="value">${safeClientName}</td></tr>
      <tr><td class="label">Star Rating</td><td class="value" style="color: #eab308; font-size: 18px;">${stars} (${data.rating}/5)</td></tr>
    </table>
    <p><strong>Client Review Message:</strong></p>
    <div class="quote-box">
      ${safeComment}
    </div>
    <p>You can view all project feedback inside the Admin Control Center.</p>
  `;

  const html = renderEmailShell(title, bodyContent, 'View Admin Dashboard', 'https://gmdigitalstudio.app/admin/dashboard');
  const res = await sendViaResend([ADMIN_EMAIL], title, html);
  return {
    success: res.success,
    message: 'Project feedback alert email sent to admin successfully.',
  };
};

/**
 * 7. Send Custom Composed Email / Announcement from support@gmdigitalstudio.app
 */
export const sendCustomComposeEmail = async (data: CustomComposeEmailData): Promise<SendEmailResponse> => {
  const safeSubject = escapeHtml(data.subject);
  const safeRecipientName = data.recipientName ? escapeHtml(data.recipientName) : '';

  let html = '';
  if (data.rawHtml && data.rawHtml.trim()) {
    html = data.rawHtml.trim();
  } else {
    const formattedParagraphs = data.bodyMessage
      .split('\n')
      .filter((p) => p.trim())
      .map((p) => `<p style="margin-bottom: 12px; color: #334155; line-height: 1.6;">${escapeHtml(p)}</p>`)
      .join('');

    const bodyContent = `
      ${safeRecipientName ? `<p style="margin-bottom: 16px; font-size: 15px;">Dear <strong>${safeRecipientName}</strong>,</p>` : ''}
      ${formattedParagraphs}
    `;

    html = renderEmailShell(safeSubject, bodyContent, data.ctaText, data.ctaUrl);
  }

  const res = await sendViaResend(data.to, safeSubject, html, SUPPORT_SENDER, 'custom_compose');

  // Automatically record each dispatched recipient in Supabase database
  if (res.success) {
    for (const recipient of data.to) {
      await emailRecordService.recordSentEmail({
        sender: 'support@gmdigitalstudio.app',
        recipient_email: recipient,
        recipient_name: data.recipientName,
        subject: data.subject,
        body_message: data.bodyMessage,
        raw_html: html,
        cta_text: data.ctaText,
        cta_url: data.ctaUrl,
        status: 'sent',
      });
    }
  }

  return {
    success: res.success,
    message: `Custom email sent successfully to ${data.to.join(', ')} from support@gmdigitalstudio.app.`,
  };
};
