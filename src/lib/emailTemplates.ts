// ============================================================
// FATHOM Email Templates
// Premium, branded HTML email templates for all transactional emails.
// ============================================================

const BRAND_COLOR = '#B8860B'; // Dark goldenrod
const BRAND_COLOR_LIGHT = '#D4A843';
const DARK_BG = '#1a1a1a';
const LIGHT_BG = '#f8f6f1';
const BORDER_COLOR = '#e8e4dc';
const TEXT_PRIMARY = '#1a1a1a';
const TEXT_SECONDARY = '#6b6560';
const TEXT_MUTED = '#999990';
const YEAR = new Date().getFullYear();

// ============================================================
// Shared layout components
// ============================================================

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FATHOM</title>
</head>
<body style="margin:0;padding:0;background-color:${LIGHT_BG};font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${LIGHT_BG};">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background-color:#ffffff;border-radius:2px;overflow:hidden;">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function headerSection(badgeText: string): string {
  return `
<!-- Gold top bar -->
<tr>
  <td style="background:linear-gradient(90deg, ${BRAND_COLOR}, ${BRAND_COLOR_LIGHT}, ${BRAND_COLOR});height:5px;font-size:0;line-height:0;">&nbsp;</td>
</tr>
<!-- Logo -->
<tr>
  <td align="center" style="padding:40px 40px 15px 40px;">
    <img src="https://www.fathomstore.in/images/fathom-logo-transparent.png" alt="FATHOM" width="180" style="display:block; margin:0 auto; border:none;" />
    <div style="width:80px;height:2px;background-color:${BRAND_COLOR};margin:12px auto 0 auto;border-radius:2px;"></div>
  </td>
</tr>
<!-- Badge -->
<tr>
  <td align="center" style="padding:0 40px 10px 40px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="border:1px solid ${BRAND_COLOR};border-radius:20px;padding:6px 22px;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:3px;color:${BRAND_COLOR};text-transform:uppercase;font-weight:600;">${badgeText}</span>
        </td>
      </tr>
    </table>
  </td>
</tr>
<!-- Divider -->
<tr>
  <td style="padding:10px 40px 0 40px;">
    <div style="border-top:1px solid ${BORDER_COLOR};"></div>
  </td>
</tr>`;
}

function footerSection(refCode: string, bottomNote: string): string {
  return `
<!-- Support box -->
<tr>
  <td style="padding:10px 40px 20px 40px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${LIGHT_BG};border-radius:6px;border:1px solid ${BORDER_COLOR};">
      <tr>
        <td align="center" style="padding:16px 20px;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${TEXT_SECONDARY};">Requires dedicated assistance? Contact <strong style="color:${TEXT_PRIMARY};">FATHOM Support</strong> at</span><br/>
          <a href="mailto:fathom.support@gmail.com" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND_COLOR};text-decoration:underline;">fathom.support@gmail.com</a>
        </td>
      </tr>
    </table>
  </td>
</tr>
<!-- Footer links -->
<tr>
  <td align="center" style="padding:20px 40px 8px 40px;">
    <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:2px;color:${TEXT_SECONDARY};text-transform:uppercase;">
      Privacy Charter &nbsp;&bull;&nbsp; Security Center &nbsp;&bull;&nbsp; Terms of Membership
    </span>
  </td>
</tr>
<tr>
  <td align="center" style="padding:4px 40px;">
    <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${TEXT_SECONDARY};">&copy; ${YEAR} FATHOM. All rights reserved.</span>
  </td>
</tr>


<tr>
  <td align="center" style="padding:4px 40px 25px 40px;">
    <span style="font-family:Arial,Helvetica,sans-serif;font-size:9px;color:${TEXT_MUTED};">${bottomNote}</span>
  </td>
</tr>`;
}

function darkFooterSection(bottomNote: string): string {
  return `
<!-- Dark footer -->
<tr>
  <td style="background-color:${DARK_BG};padding:25px 40px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding-bottom:10px;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:3px;color:${BRAND_COLOR};text-transform:uppercase;font-weight:600;">Quality &bull; Design &bull; Experience</span>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:10px;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#888888;">
            <a href="https://www.fathomstore.in/privacy-policy" style="color:#888888;text-decoration:none;">Privacy Policy</a>
            &nbsp;&bull;&nbsp;
            <a href="https://www.fathomstore.in/terms" style="color:#888888;text-decoration:none;">Terms of Service</a>
            &nbsp;&bull;&nbsp;
            <a href="https://www.fathomstore.in/contact" style="color:#888888;text-decoration:none;">Contact Us</a>
          </span>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:6px;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:9px;color:#888888;">${bottomNote}</span>
        </td>
      </tr>
      <tr>
        <td align="center">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#666666;">&copy; ${YEAR} FATHOM. All rights reserved.</span>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

// ============================================================
// 1. OTP Email Template
// ============================================================

export function otpEmailTemplate(otp: string): string {
  const digits = otp.split('');
  const firstHalf = digits.slice(0, 3);
  const secondHalf = digits.slice(3, 6);

  const digitCellStyle = `
    width:48px;height:56px;
    border:1px solid ${BORDER_COLOR};
    border-radius:6px;
    text-align:center;vertical-align:middle;
    font-family: Arial, Helvetica, sans-serif;
    font-size:28px;font-weight:bold;color:${TEXT_PRIMARY};
    background-color:#ffffff;
  `.replace(/\n/g, '');

  const firstDigits = firstHalf.map(d => `<td style="${digitCellStyle}">${d}</td>`).join('');
  const secondDigits = secondHalf.map(d => `<td style="${digitCellStyle}">${d}</td>`).join('');

  const refCode = `AUTH_REF: FTM-${Math.floor(10000 + Math.random() * 90000)}-SEC-OTP &bull; ENCRYPTED SESSION`;

  const content = `
    ${headerSection('Client Authentication &bull; One-Time Passcode')}
    <!-- Title -->
    <tr>
      <td align="center" style="padding:35px 40px 5px 40px;">
        <h2 style="margin:0;font-family: Arial, Helvetica, sans-serif;font-size:26px;font-weight:normal;color:${TEXT_PRIMARY};letter-spacing:2px;text-transform:uppercase;">Welcome to Fathom</h2>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:8px 0;">
        <div style="width:40px;height:2px;background-color:${BRAND_COLOR};margin:0 auto;"></div>
      </td>
    </tr>
    <!-- Body text -->
    <tr>
      <td align="center" style="padding:10px 50px 25px 50px;">
        <p style="margin:0;font-family: Arial, Helvetica, sans-serif;font-size:14px;line-height:22px;color:${TEXT_SECONDARY};">
          Thank you for initiating your registration with us. Please use the following One-Time Password (OTP) to authenticate your identity and complete your account setup.
        </p>
      </td>
    </tr>
    <!-- OTP Box -->
    <tr>
      <td align="center" style="padding:0 50px 25px 50px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDER_COLOR};border-radius:10px;padding:25px 30px 18px 30px;background-color:#fafaf8;">
          <tr>
            <td align="center" style="padding-bottom:15px;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:3px;color:${TEXT_MUTED};text-transform:uppercase;">Temporary Access Key</span>
            </td>
          </tr>
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="6" border="0">
                <tr>
                  ${firstDigits}
                  <td style="width:16px;text-align:center;vertical-align:middle;">
                    <span style="font-size:20px;color:${BRAND_COLOR};">&bull;</span>
                  </td>
                  ${secondDigits}
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:14px;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${TEXT_MUTED};">&#9201; Expires in <strong style="color:${TEXT_PRIMARY};">10 minutes</strong></span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Security notices -->
    <tr>
      <td style="padding:10px 50px 8px 50px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:top;padding-right:10px;">
              <span style="font-size:14px;">&#128274;</span>
            </td>
            <td>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:${TEXT_SECONDARY};">
                <strong style="color:${TEXT_PRIMARY};">Strict Confidentiality:</strong> Never share this verification code with anyone. FATHOM representatives will never ask for your code.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 50px 25px 50px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:top;padding-right:10px;">
              <span style="font-size:14px;">&#9432;</span>
            </td>
            <td>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:${TEXT_SECONDARY};">
                If you did not request this registration, please safely disregard this email or notify our security advisory team immediately.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${footerSection(refCode, 'To ensure continued delivery of FATHOM security notices, add fathom.support@gmail.com to your address book.')}
  `;

  return emailWrapper(content);
}

// ============================================================
// 2. Welcome Email Template (after successful registration)
// ============================================================

export function welcomeEmailTemplate(data: {
  memberName: string;
  memberEmail: string;
  memberId: string;
}): string {
  const content = `
    <!-- Top dark bar with subtle glow/gradient -->
    <tr>
      <td style="background:linear-gradient(90deg, #111111, ${BRAND_COLOR}, #111111);height:4px;font-size:0;line-height:0;">&nbsp;</td>
    </tr>
    <!-- Logo -->
    <tr>
      <td align="center" style="padding:40px 40px 20px 40px;">
        <img src="https://www.fathomstore.in/images/fathom-logo-transparent.png" alt="FATHOM" width="120" style="display:block; margin:0 auto; border:none;" />
      </td>
    </tr>
    <!-- Welcome Header -->
    <tr>
      <td align="center" style="padding:10px 40px 15px 40px;">
        <h2 style="margin:0;font-family: Georgia, 'Times New Roman', Times, serif;font-size:24px;font-weight:normal;color:${TEXT_PRIMARY};letter-spacing:3px;text-transform:uppercase;">WELCOME TO FATHOM</h2>
      </td>
    </tr>
    <!-- Body Text -->
    <tr>
      <td align="center" style="padding:0 50px 30px 50px;">
        <p style="margin:0;font-family: Arial, Helvetica, sans-serif;font-size:11px;line-height:18px;color:${TEXT_SECONDARY};">
          Welcome to FATHOM. Your account has been successfully created and your email has been verified.
        </p>
      </td>
    </tr>
    <!-- Button -->
    <tr>
      <td align="center" style="padding:10px 40px 10px 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background-color:#111111;border:1px solid ${BRAND_COLOR};border-radius:2px;">
              <a href="https://www.fathomstore.in/" style="display:inline-block;padding:12px 30px;font-family: Arial, Helvetica, sans-serif;font-size:10px;letter-spacing:2px;color:#ffffff;text-decoration:none;text-transform:uppercase;font-weight:bold;">EXPLORE STORE</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Small note below button -->
    <tr>
      <td align="center" style="padding:0 40px 35px 40px;">
        <span style="font-family: Arial, Helvetica, sans-serif;font-size:10px;color:${TEXT_MUTED};">Discover the FATHOM collection.</span>
      </td>
    </tr>
    <!-- Support Box -->
    <tr>
      <td style="padding:0 30px 30px 30px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDER_COLOR};border-radius:6px;background-color:#fefefe;">
          <tr>
            <td align="center" style="padding:16px 20px;">
              <span style="font-family: Arial, Helvetica, sans-serif;font-size:11px;color:${TEXT_SECONDARY};">Need assistance? Contact Us at <a href="mailto:support@fathomstore.in" style="color:${BRAND_COLOR};text-decoration:none;">support@fathomstore.in</a></span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Footer line separator -->
    <tr>
      <td style="padding:0;border-top:1px solid ${BORDER_COLOR};"></td>
    </tr>
    <!-- Minimal Footer -->
    <tr>
      <td style="padding:25px 30px;background-color:#fcfcfc;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding-bottom:12px;">
              <span style="font-family: Arial, Helvetica, sans-serif;font-size:9px;letter-spacing:1px;color:${TEXT_MUTED};text-transform:uppercase;">
                <a href="https://www.fathomstore.in/privacy-policy" style="color:${TEXT_MUTED};text-decoration:none;">Privacy Policy</a> &nbsp;&nbsp;&nbsp; <a href="https://www.fathomstore.in/terms" style="color:${TEXT_MUTED};text-decoration:none;">Terms of Service</a> &nbsp;&nbsp;&nbsp; <a href="https://www.fathomstore.in/contact" style="color:${TEXT_MUTED};text-decoration:none;">Contact Us</a>
              </span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:6px;">
              <span style="font-family: Arial, Helvetica, sans-serif;font-size:9px;color:${TEXT_MUTED};">&copy; 2026 FATHOM. All rights reserved.</span>
            </td>
          </tr>
          <tr>
            <td align="center">
              <span style="font-family: Arial, Helvetica, sans-serif;font-size:8px;letter-spacing:2px;color:${TEXT_MUTED};text-transform:uppercase;">QUALITY &bull; DESIGN &bull; EXPERIENCE</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return emailWrapper(content);
}

// ============================================================
// 3. Invoice Email Template
// ============================================================

export function invoiceEmailTemplate(data: {
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  grandTotal: string;
  pdfSizeKB?: number;
}): string {
  const content = `
    ${headerSection('Official Tax Invoice')}
    <!-- Greeting -->
    <tr>
      <td style="padding:30px 50px 0 50px;">
        <p style="margin:0 0 12px 0;font-family: Arial, Helvetica, sans-serif;font-size:16px;color:${TEXT_PRIMARY};">
          <strong>Hello ${data.customerName},</strong>
        </p>
        <p style="margin:0 0 8px 0;font-family: Arial, Helvetica, sans-serif;font-size:14px;line-height:22px;color:${TEXT_SECONDARY};">
          Thank you for choosing <strong style="color:${TEXT_PRIMARY};">FATHOM</strong>.
        </p>
        <p style="margin:0;font-family: Arial, Helvetica, sans-serif;font-size:14px;line-height:22px;color:${TEXT_SECONDARY};">
          Your invoice for Order is attached to this email.
        </p>
      </td>
    </tr>
    <!-- Invoice details card -->
    <tr>
      <td style="padding:25px 50px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDER_COLOR};border-radius:8px;overflow:hidden;">
          <!-- Card header -->
          <tr>
            <td style="padding:14px 20px;border-bottom:1px solid ${BORDER_COLOR};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;color:${BRAND_COLOR};text-transform:uppercase;font-weight:700;">Invoice Details</span>
                  </td>
                  <td align="right">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:1px;color:${TEXT_SECONDARY};border:1px solid ${BORDER_COLOR};border-radius:3px;padding:4px 10px;text-transform:uppercase;">Paid Confirmation</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Invoice rows -->
          <tr>
            <td style="padding:14px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:6px 0;border-bottom:1px solid ${BORDER_COLOR};">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td><span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;color:${TEXT_SECONDARY};text-transform:uppercase;">Invoice Number</span></td>
                        <td align="right"><span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${TEXT_PRIMARY};font-weight:700;">${data.invoiceNumber}</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid ${BORDER_COLOR};">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td><span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;color:${TEXT_SECONDARY};text-transform:uppercase;">Order Date</span></td>
                        <td align="right"><span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${TEXT_PRIMARY};font-weight:700;">${data.invoiceDate}</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0 6px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td><span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${TEXT_PRIMARY};font-weight:bold;">Invoice Amount</span></td>
                        <td align="right"><span style="font-family:Arial,Helvetica,sans-serif;font-size:24px;color:${TEXT_PRIMARY};font-weight:bold;">&#8377;${data.grandTotal}</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Message -->
    <tr>
      <td style="padding:0 50px 20px 50px;">
        <p style="margin:0 0 10px 0;font-family: Arial, Helvetica, sans-serif;font-size:13px;color:${BRAND_COLOR};font-style:italic;">Please keep this invoice for your records.</p>
        <p style="margin:0 0 15px 0;font-family: Arial, Helvetica, sans-serif;font-size:14px;line-height:22px;color:${TEXT_SECONDARY};">
          We appreciate your trust in <strong style="color:${TEXT_PRIMARY};">FATHOM</strong> and look forward to serving you again.
        </p>
        <p style="margin:0;font-family: Arial, Helvetica, sans-serif;font-size:14px;color:${TEXT_SECONDARY};">
          Warm regards,<br/>
          <strong style="color:${TEXT_PRIMARY};">Team FATHOM</strong>
        </p>
      </td>
    </tr>

    <!-- Customer care box -->
    <tr>
      <td style="padding:0 50px 25px 50px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDER_COLOR};border-radius:6px;">
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:2px;color:${TEXT_PRIMARY};text-transform:uppercase;font-weight:700;">Customer Care &amp; Verification</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:3px 0;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${TEXT_MUTED};display:inline-block;width:60px;">Website:</span>
                    <a href="https://www.fathomstore.in/" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND_COLOR};text-decoration:none;">https://www.fathomstore.in/</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:3px 0;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${TEXT_MUTED};display:inline-block;width:60px;">Email:</span>
                    <a href="mailto:fathom.support@gmail.com" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND_COLOR};text-decoration:none;">fathom.support@gmail.com</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:3px 0;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${TEXT_MUTED};display:inline-block;width:60px;">Phone:</span>
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${TEXT_PRIMARY};">+91 82385 43000</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${darkFooterSection('To ensure continued delivery of FATHOM updates and invoices, add fathom.support@gmail.com to your address book.')}
  `;

  return emailWrapper(content);
}

// ============================================================
// 4. Quotation Email Template
// ============================================================

export function quotationEmailTemplate(data: {
  customerName: string;
  quotationDate: string;
  validUntil?: string;
  grandTotal: string;
  pdfSizeKB?: number;
}): string {
  // Calculate valid-until date (10 days from quotation date)
  let validUntilDate = data.validUntil;
  if (!validUntilDate && data.quotationDate) {
    try {
      const qDate = new Date(data.quotationDate);
      qDate.setDate(qDate.getDate() + 10);
      validUntilDate = qDate.toISOString().split('T')[0];
    } catch {
      validUntilDate = '';
    }
  }

  const content = `
    ${headerSection('Official Price Quotation')}
    <!-- Greeting -->
    <tr>
      <td style="padding:30px 50px 0 50px;">
        <p style="margin:0 0 12px 0;font-family: Arial, Helvetica, sans-serif;font-size:16px;color:${TEXT_PRIMARY};">
          <strong>Hello ${data.customerName},</strong>
        </p>
        <p style="margin:0 0 8px 0;font-family: Arial, Helvetica, sans-serif;font-size:14px;line-height:22px;color:${TEXT_SECONDARY};">
          Thank you for your interest in <strong style="font-family:Arial,Helvetica,sans-serif;color:${TEXT_PRIMARY};">FATHOM</strong>.
        </p>
        <p style="margin:0;font-family: Arial, Helvetica, sans-serif;font-size:14px;line-height:22px;color:${TEXT_SECONDARY};">
          Please find the quotation for your requested products attached to this email.
        </p>
      </td>
    </tr>
    <!-- Quotation details card -->
    <tr>
      <td style="padding:25px 50px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDER_COLOR};border-radius:8px;overflow:hidden;">
          <!-- Card header -->
          <tr>
            <td style="padding:14px 20px;border-bottom:1px solid ${BORDER_COLOR};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;color:${BRAND_COLOR};text-transform:uppercase;font-weight:700;">Quotation Details</span>
                  </td>
                  <td align="right">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:1px;color:${TEXT_SECONDARY};border:1px solid ${BORDER_COLOR};border-radius:3px;padding:4px 10px;text-transform:uppercase;">Valid Estimate</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Quotation rows -->
          <tr>
            <td style="padding:14px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:6px 0;border-bottom:1px solid ${BORDER_COLOR};">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td><span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;color:${TEXT_SECONDARY};text-transform:uppercase;">Quotation Date</span></td>
                        <td align="right"><span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${TEXT_PRIMARY};font-weight:700;">${data.quotationDate}</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid ${BORDER_COLOR};">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td><span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;color:${TEXT_SECONDARY};text-transform:uppercase;">Valid Until</span></td>
                        <td align="right">
                          <span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${TEXT_PRIMARY};font-weight:700;">${validUntilDate}</span><br/>
                          <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${TEXT_MUTED};">(Valid 10 days from issue)</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0 2px 0;">
                    <p style="margin:0 0 8px 0;font-family: Arial, Helvetica, sans-serif;font-size:11px;color:${TEXT_MUTED};font-style:italic;">* Prices and availability are subject to change after the validity period.</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td><span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${TEXT_PRIMARY};font-weight:bold;">Total Amount</span></td>
                        <td align="right"><span style="font-family:Arial,Helvetica,sans-serif;font-size:24px;color:${TEXT_PRIMARY};font-weight:bold;">&#8377;${data.grandTotal}</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Message -->
    <tr>
      <td style="padding:0 50px 20px 50px;">
        <p style="margin:0 0 12px 0;font-family: Arial, Helvetica, sans-serif;font-size:14px;line-height:22px;color:${TEXT_SECONDARY};">
          The attached quotation includes the product details, quantities, pricing, applicable taxes, and other relevant terms and conditions.
        </p>
        <p style="margin:0 0 12px 0;font-family: Arial, Helvetica, sans-serif;font-size:14px;line-height:22px;color:${TEXT_SECONDARY};">
          Please review the quotation and feel free to contact us if you have any questions or require any changes.
        </p>
        <p style="margin:0 0 15px 0;font-family: Arial, Helvetica, sans-serif;font-size:14px;line-height:22px;color:${TEXT_SECONDARY};">
          We look forward to serving you.
        </p>
        <p style="margin:0;font-family: Arial, Helvetica, sans-serif;font-size:14px;color:${TEXT_SECONDARY};">
          Warm regards,<br/>
          <strong style="color:${TEXT_PRIMARY};">Team FATHOM</strong>
        </p>
      </td>
    </tr>

    <!-- Customer care box -->
    <tr>
      <td style="padding:0 50px 25px 50px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BORDER_COLOR};border-radius:6px;">
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:2px;color:${TEXT_PRIMARY};text-transform:uppercase;font-weight:700;">Customer Care &amp; Verification</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:3px 0;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${TEXT_MUTED};display:inline-block;width:60px;">Website:</span>
                    <a href="https://www.fathomstore.in/" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND_COLOR};text-decoration:none;">https://www.fathomstore.in/</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:3px 0;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${TEXT_MUTED};display:inline-block;width:60px;">Email:</span>
                    <a href="mailto:fathom.support@gmail.com" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND_COLOR};text-decoration:none;">fathom.support@gmail.com</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:3px 0;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${TEXT_MUTED};display:inline-block;width:60px;">Phone:</span>
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${TEXT_PRIMARY};">+91 82385 43000</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${darkFooterSection('To ensure continued delivery of FATHOM updates and invoices, add fathom.support@gmail.com to your address book.')}
  `;

  return emailWrapper(content);
}
