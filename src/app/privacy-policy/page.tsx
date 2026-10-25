import { Metadata } from "next";
import PolicyPageClient from "@/components/policies/PolicyPageClient";

export const metadata: Metadata = {
  title: "Privacy Policy | FATHOM",
  description:
    "Learn how FATHOM (Shivam Enterprises) collects, uses, stores and protects your personal information when you visit our website or arrange a purchase.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | FATHOM",
    description:
      "Learn how FATHOM collects, uses, stores and protects your personal information.",
    url: "https://www.fathomstore.in/privacy-policy",
    siteName: "FATHOM",
    type: "website",
  },
};

const sections = [
  {
    title: "1. Information We Collect",
    content: `We may collect the following information:`,
    bullets: [
      "<strong>Personal Information:</strong> Name, email address, phone number and delivery address.",
      "<strong>Enquiry Information:</strong> Product interests, questions and information exchanged with our team through WhatsApp, email or other official channels.",
      "<strong>Order Information:</strong> Confirmed product details, order references, invoices, payment status and delivery information.",
      "<strong>Payment Information:</strong> Transaction references and payment status. Payments may be processed through third-party payment providers or other agreed payment methods.",
      "<strong>Technical Information:</strong> IP address, browser type, device information, cookies and website usage data.",
      "<strong>Support Information:</strong> Information, photographs, videos and descriptions you provide when reporting delivery problems, requesting repairs or contacting us about warranty coverage.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information to:`,
    bullets: [
      "Respond to product enquiries and provide purchase assistance.",
      "Communicate prices, availability, specifications and order details.",
      "Confirm orders and coordinate payments.",
      "Arrange shipping and delivery.",
      "Provide customer support and after-sales assistance.",
      "Guide customers through troubleshooting and repair procedures.",
      "Assess replacement and warranty requests.",
      "Improve our website, products and services.",
      "Prevent fraud, protect website security and comply with applicable legal obligations.",
    ],
    afterBullets:
      "We may send promotional communications where permitted by law and subject to applicable consent and communication preferences.",
  },
  {
    title: "3. Purchases and WhatsApp Communication",
    content: `Purchases are coordinated with our team rather than completed through website checkout.

When you contact us on WhatsApp, your messages and associated information may be processed by WhatsApp and its service providers under their applicable privacy terms.

We may use information you provide to discuss your order, confirm purchase details, arrange delivery and provide after-sales support.

Please do not share passwords, OTPs, UPI PINs or other confidential payment authentication credentials with anyone claiming to represent FATHOM.`,
  },
  {
    title: "4. Cookies and Analytics",
    content: `Our website may use cookies and similar technologies to maintain website functionality, understand website traffic, improve user experience and measure marketing performance.

You may be able to control certain cookies through your browser settings. Disabling some cookies may affect website functionality.`,
  },
  {
    title: "5. Sharing of Information",
    content: `We may share relevant information with trusted third parties where necessary, including:`,
    bullets: [
      "WhatsApp and communication service providers.",
      "Shipping and logistics providers.",
      "Payment processors.",
      "Website hosting and technology service providers.",
      "Analytics and security service providers.",
      "Professional advisers and government authorities where legally required.",
    ],
    afterBullets:
      "We do not sell personal information to third parties as a standalone commercial product.",
  },
  {
    title: "6. Data Retention and Security",
    content: `We retain personal information for as long as reasonably necessary to provide our services, manage customer enquiries, fulfil orders, resolve disputes and comply with applicable legal, tax and accounting requirements.

We take reasonable technical and organisational measures to protect personal information. However, no online system or electronic communication method can be guaranteed to be completely secure.`,
  },
  {
    title: "7. Your Privacy Rights",
    content: `Subject to applicable law, you may request access to, correction of or deletion of your personal information, or raise concerns about how your information is processed.

Certain information may need to be retained to comply with legal obligations or resolve disputes.

To submit a privacy-related request, contact us using the details below.`,
  },
  {
    title: "8. Third-Party Services and Links",
    content: `Our website may use third-party services or contain links to external websites. Their privacy practices are governed by their respective policies.

We encourage you to review the applicable policies before sharing information with third-party services.`,
  },
  {
    title: "9. Children's Privacy",
    content: `Our website is intended for general consumers and is not specifically directed at children. We do not knowingly collect children's personal information in violation of applicable law.`,
  },
  {
    title: "10. Changes to This Policy",
    content: `We may update this Privacy Policy to reflect changes in our business practices, website features or legal obligations. The revised policy will be published on this page with an updated effective date.`,
  },
];

const contactInfo = {
  brand: "FATHOM",
  legalName: "Shivam Enterprises",
  website: "https://www.fathomstore.in/",
  email: "fathom.support@gmail.com",
  phone: "+91 82385 43000",
  whatsapp: "+91 82385 43000",
  address: "126, Green Plaza Shopping, Mota Varachha, Surat, Gujarat 394105",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPageClient
      heroTitle="Privacy Policy"
      heroSubtitle="Your privacy matters to us"
      heroDescription="This Privacy Policy explains how we collect, use, store and protect your personal information when you visit our website, contact our team, arrange a purchase or request customer support."
      introParagraph="Welcome to FATHOM (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), operated by Shivam Enterprises. FATHOM operates https://www.fathomstore.in/ and showcases kitchen appliances and related products to customers in India. Our website does not provide direct checkout or online purchasing. Customers interested in purchasing a product must contact our team, discuss the product and purchase details, and finalise the order through WhatsApp or another official communication channel."
      sections={sections}
      contactInfo={contactInfo}
      contactTitle="11. Contact Us"
      contactSubtitle="For privacy-related questions or requests:"
    />
  );
}
