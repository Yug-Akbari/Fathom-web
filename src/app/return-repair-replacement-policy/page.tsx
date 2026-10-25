import { Metadata } from "next";
import PolicyPageClient from "@/components/policies/PolicyPageClient";

export const metadata: Metadata = {
  title: "Return, Repair & Replacement Policy | FATHOM",
  description:
    "FATHOM's policy on returns for delivery issues, product repairs, replacement procedures and manufacturer warranty coverage.",
  alternates: {
    canonical: "/return-repair-replacement-policy",
  },
  openGraph: {
    title: "Return, Repair & Replacement Policy | FATHOM",
    description:
      "Learn about FATHOM's return, repair and replacement procedures for kitchen appliances.",
    url: "https://www.fathomstore.in/return-repair-replacement-policy",
    siteName: "FATHOM",
    type: "website",
  },
};

const sections = [
  {
    title: "1. Return Policy",
    content: `FATHOM does not offer a standard change-of-mind return policy.

Returns are considered for delivery-related issues, including:`,
    bullets: [
      "A product delivered in damaged condition.",
      "The wrong product being delivered.",
      "Missing products, parts or accessories advertised as included.",
      "Other verified delivery discrepancies requiring a return or another appropriate remedy.",
    ],
    afterBullets: `Customers should contact our team as soon as possible after delivery and provide the order reference, a description of the problem and supporting photographs or videos where available.

Every reported issue will be reviewed based on the circumstances. Nothing in this policy removes rights or remedies available under applicable consumer protection laws.`,
  },
  {
    title: "2. Product Problems and Repair Assistance",
    content: `If a product develops a problem or does not function as expected, customers should contact our support team before attempting repairs.

Our initial support process may include:`,
    numberedList: [
      "Understanding the reported problem.",
      "Reviewing photographs, videos or other relevant information.",
      "Providing basic troubleshooting instructions or guidance for safe repair steps.",
      "Assessing whether the problem can be resolved through the guidance provided.",
      "Referring the product for further assessment if the problem cannot be resolved remotely.",
    ],
    afterBullets:
      "Customers should not open electrical appliances or attempt internal electrical repairs unless the work is specifically authorised and performed through an appropriate qualified service process.",
  },
  {
    title: "3. Repair Assessment",
    content: `If the problem cannot be resolved through remote guidance, an authorised FATHOM executive will assess the reported condition and determine the appropriate next steps.

Depending on the circumstances, this may involve further inspection, servicing, component replacement or other repair work.

The assessment may consider the nature of the fault, product condition, applicable manufacturer warranty, evidence provided and whether repair is reasonably possible.

The assessment and decision will be communicated to the customer.`,
  },
  {
    title: "4. Repair Charges",
    content: `Where applicable, diagnostic, inspection, repair, replacement-component or transportation charges may apply.

Charges may depend on factors such as:`,
    bullets: [
      "Whether the issue is covered by the applicable manufacturer warranty.",
      "Whether the problem results from misuse, accidental damage or unauthorised repair.",
      "Whether replacement parts or additional service work are required.",
      "The nature and extent of the repair.",
    ],
    afterBullets: `Any applicable charge will be communicated to the customer before chargeable work proceeds. We will seek the customer's agreement before undertaking such work.

Charges will be applied in accordance with disclosed terms and applicable law.`,
  },
  {
    title: "5. Replacement When a Product Cannot Be Repaired",
    content: `If our authorised executive assesses the product and determines that it is not reasonably repairable, FATHOM will arrange a replacement in accordance with the applicable warranty, purchase terms and legal requirements.

The decision about whether the product is repairable will be based on the assessment of its condition and the nature of the fault.

Where any charges may apply, our team will explain them and obtain the customer's agreement before proceeding, subject to applicable law and relevant warranty obligations.

The replacement process, product availability and applicable conditions will be communicated by our team.

This assessment process does not restrict any mandatory consumer remedies available under applicable law.`,
  },
  {
    title: "6. Manufacturer Warranty",
    content: `Warranty coverage, where available, is as specified on the relevant product page and is subject to the manufacturer's warranty terms.

Customers should review the warranty information provided for their product.

A warranty request may require the order reference, invoice, product details and a description of the fault.

Whether a particular problem is covered by a manufacturer warranty will be assessed against the applicable warranty terms. Any exclusions or charges will be explained to the customer where applicable.`,
  },
  {
    title: "7. Refunds",
    content: `Refunds are not the standard remedy for routine product servicing or repair requests.

For verified delivery-related issues, an appropriate resolution will be assessed according to the circumstances, the agreed purchase terms and applicable law. Where a refund is approved or legally required, it will generally be processed through the original payment method wherever possible.

Any applicable refund will be processed within the legally required timeframe or, where no specific statutory timeframe applies, within the timeframe communicated by our team.`,
  },
  {
    title: "8. How to Request Support",
    content: `To report a delivery problem or request repair or replacement assistance:`,
    numberedList: [
      "Contact us through our official WhatsApp number or email.",
      "Provide your order reference and product details.",
      "Explain the issue clearly.",
      "Share photographs or videos where available.",
      "Follow the instructions provided by our support team.",
    ],
    afterBullets:
      "Please do not dispatch a product for repair or replacement without receiving instructions from our team.",
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

export default function ReturnRepairReplacementPolicyPage() {
  return (
    <PolicyPageClient
      heroTitle="Return, Repair &amp; Replacement Policy"
      heroSubtitle="We stand behind every product"
      heroDescription="This policy explains how we handle delivery-related problems, product repairs, replacement requests and applicable charges."
      introParagraph="At FATHOM, operated by Shivam Enterprises, we aim to provide quality products and reliable after-sales support. Our website showcases products but does not provide direct checkout. Customers must contact our team through WhatsApp or another official communication channel to discuss product details and finalise a purchase."
      sections={sections}
      contactInfo={contactInfo}
      contactTitle="9. Contact Us"
    />
  );
}
