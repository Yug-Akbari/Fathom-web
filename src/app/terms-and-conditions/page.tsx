import { Metadata } from "next";
import PolicyPageClient from "@/components/policies/PolicyPageClient";

export const metadata: Metadata = {
  title: "Terms and Conditions | FATHOM",
  description:
    "Terms and Conditions governing access to and use of fathomstore.in and purchases arranged through the FATHOM team, operated by Shivam Enterprises.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
  openGraph: {
    title: "Terms and Conditions | FATHOM",
    description:
      "Read the Terms and Conditions for using the FATHOM website and purchasing products.",
    url: "https://www.fathomstore.in/terms-and-conditions",
    siteName: "FATHOM",
    type: "website",
  },
};

const sections = [
  {
    title: "1. About FATHOM",
    content: `FATHOM showcases appliances and related products.

<strong>Brand:</strong> FATHOM
<strong>Legal Business Name:</strong> Shivam Enterprises
<strong>Website:</strong> https://www.fathomstore.in/
<strong>Business Address:</strong> 126, Green Plaza Shopping, Mota Varachha, Surat, Gujarat 394105
<strong>Customer Support Email:</strong> fathom.support@gmail.com
<strong>Phone:</strong> +91 82385 43000
<strong>WhatsApp:</strong> +91 82385 43000`,
  },
  {
    title: "2. Product Enquiries and Purchases",
    content: `Our website allows customers to browse products and obtain information.

To purchase a product, customers must contact our team through WhatsApp or another official communication channel. Our team will discuss relevant details, including product availability, price, applicable shipping charges, payment method and delivery arrangements.

A website visit or product enquiry does not itself constitute a completed purchase.

An order will be treated as confirmed when the purchase details and acceptance are communicated through the agreed official channel. Our team will communicate the applicable payment and fulfilment instructions.

Customers should verify the product specifications, accessories, final price, shipping charges and delivery details before confirming the order.`,
  },
  {
    title: "3. Product Information",
    content: `We make reasonable efforts to ensure that product descriptions, images, specifications and other information are accurate.

Minor variations in colour, appearance or presentation may occur due to screen settings, lighting or manufacturer updates.

Product specifications and included accessories will be as stated in the applicable product information and confirmed purchase details.

If a customer identifies a material discrepancy, they should contact our team for clarification before finalising the purchase.`,
  },
  {
    title: "4. Pricing and Payment",
    content: `Prices displayed on the website are provided for product information and may require confirmation by our team before an order is finalised.

The final product price, applicable taxes, shipping charges and payment arrangements will be communicated before purchase confirmation.

Payment must be made using a method agreed with our team. Customers should verify payment instructions through our official communication channel.

FATHOM will not ask customers to disclose passwords, OTPs, UPI PINs or other confidential payment authentication credentials.`,
  },
  {
    title: "5. Order Confirmation and Cancellation",
    content: `Orders are coordinated with our team rather than placed through website checkout.

Customers should review all order details before confirmation. Requests to amend or cancel an order should be raised as soon as possible through our official communication channels.

Whether an order can be cancelled or amended may depend on its fulfilment status and the circumstances of the request.

Nothing in this section removes cancellation, refund or other rights that apply under applicable law.`,
  },
  {
    title: "6. Shipping and Delivery",
    content: `Orders are generally processed within 1–3 business days after order confirmation and successful payment verification, where payment is required in advance.

Estimated delivery is generally 3–7 business days after dispatch, depending on the destination and courier service.

These timelines are estimates and may vary because of courier operations, public holidays, weather or other circumstances.

Shipping charges and delivery arrangements will be communicated before the purchase is finalised.

Further details are available in our Shipping Policy.`,
  },
  {
    title: "7. Returns, Repairs and Replacements",
    content: `FATHOM does not offer a standard change-of-mind return policy. Returns are considered for verified delivery-related problems, subject to applicable law.

For product faults or performance problems, our team may initially provide troubleshooting guidance or instructions for safe repair steps.

If the problem cannot be resolved remotely, an authorised FATHOM executive will assess the product condition and determine the appropriate next steps.

Applicable repair, inspection, component or transportation charges will be communicated before chargeable work proceeds.

If the authorised executive determines that the product is not reasonably repairable, FATHOM will arrange a replacement in accordance with the applicable purchase terms, warranty and legal requirements.

Further details are available in our Return, Repair and Replacement Policy.`,
  },
  {
    title: "8. Manufacturer Warranty",
    content: `Warranty coverage, where available, is as specified on the relevant product page and is subject to the manufacturer's warranty terms.

Customers should consult the applicable product information and contact our team for assistance with warranty-related problems.

Nothing in these terms excludes any rights or remedies that cannot legally be excluded.`,
  },
  {
    title: "9. Acceptable Use",
    content: `You agree not to:`,
    bullets: [
      "Use the website for unlawful or fraudulent activities.",
      "Attempt to gain unauthorised access to our systems.",
      "Introduce malicious software or interfere with website operations.",
      "Copy or misuse website content for unlawful purposes.",
      "Submit false, misleading or abusive information.",
    ],
    afterBullets:
      "We may take reasonable measures to protect our website, systems and customers from misuse.",
  },
  {
    title: "10. Intellectual Property",
    content: `Unless otherwise stated, website content, branding, logos, graphics, text, designs and original materials are owned by or licensed to FATHOM or Shivam Enterprises.

You may not reproduce, distribute or commercially exploit these materials without prior permission, except where permitted by applicable law.

Third-party trademarks and product names remain the property of their respective owners.`,
  },
  {
    title: "11. Third-Party Services",
    content: `Our website and customer support operations may rely on third-party communication services, payment providers, logistics providers and technology platforms.

Their services may be subject to separate terms and policies. Shivam Enterprises remains responsible for obligations applicable to it under law.`,
  },
  {
    title: "12. Limitation of Liability",
    content: `To the extent permitted by applicable law, Shivam Enterprises will not be liable for indirect or consequential losses arising from website interruptions or circumstances beyond its reasonable control.

Nothing in this section excludes liability for fraud, wilful misconduct, mandatory consumer remedies or any liability that cannot legally be excluded or limited.`,
  },
  {
    title: "13. Privacy",
    content: `Your use of our website and communications with our team are also governed by our Privacy Policy, which explains how personal information is collected and processed.`,
  },
  {
    title: "14. Changes to These Terms",
    content: `We may update these Terms and Conditions to reflect changes in our business, services or legal obligations.

Updated terms will be published on this page with a revised effective date. Changes will not retrospectively remove rights that customers have acquired under applicable law.`,
  },
  {
    title: "15. Governing Law and Disputes",
    content: `These terms are governed by the laws of India, subject to applicable consumer protection legislation.

Disputes will be handled by competent courts or forums having jurisdiction under applicable law. Nothing in these terms prevents customers from exercising statutory rights before the appropriate consumer dispute resolution authorities.`,
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
  grievanceEmail: "fathom.support@gmail.com",
  grievancePhone: "+91 82385 43000",
};

export default function TermsAndConditionsPage() {
  return (
    <PolicyPageClient
      heroTitle="Terms &amp; Conditions"
      heroSubtitle="Fair and transparent"
      heroDescription="These Terms and Conditions govern your access to and use of fathomstore.in and purchases arranged through our team."
      introParagraph="Welcome to FATHOM, operated by Shivam Enterprises. By using our website or proceeding with a purchase, you agree to the applicable terms, subject to your rights under applicable law. Our website serves as a product showcase and enquiry platform. Customers cannot complete purchases directly through website checkout. To purchase a product, you must contact our team, discuss the product and purchase terms, and finalise the order through WhatsApp or another official communication channel."
      sections={sections}
      contactInfo={contactInfo}
      contactTitle="16. Contact Information"
    />
  );
}
