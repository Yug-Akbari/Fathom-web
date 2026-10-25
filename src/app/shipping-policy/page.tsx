import { Metadata } from "next";
import PolicyPageClient from "@/components/policies/PolicyPageClient";

export const metadata: Metadata = {
  title: "Shipping Policy | FATHOM",
  description:
    "FATHOM's shipping policy covering order processing, dispatch timelines, delivery locations, tracking and shipment-related procedures across India.",
  alternates: {
    canonical: "/shipping-policy",
  },
  openGraph: {
    title: "Shipping Policy | FATHOM",
    description:
      "Learn about FATHOM's order processing, delivery timelines and shipping procedures across India.",
    url: "https://www.fathomstore.in/shipping-policy",
    siteName: "FATHOM",
    type: "website",
  },
};

const sections = [
  {
    title: "1. Delivery Locations",
    content: `We arrange delivery to serviceable locations within India, subject to product availability and courier service coverage.

Delivery availability for a particular PIN code depends on the courier partner and the product ordered.

Our team will confirm delivery availability and arrangements when finalising the purchase.`,
  },
  {
    title: "2. Order Confirmation and Processing Time",
    content: `Orders are generally processed within <strong>1–3 business days</strong> after the order has been confirmed and successful payment verification has been completed, where payment is required in advance.

The processing period begins after the order details have been agreed upon through our official communication channel.

Processing times may be longer during public holidays, promotional periods, stock shortages or other exceptional circumstances.

Our team will communicate any material changes to the expected processing timeline where reasonably possible.`,
  },
  {
    title: "3. Estimated Delivery Time",
    content: `Estimated delivery is generally <strong>3–7 business days after dispatch</strong>, depending on the destination and courier service.

Remote locations may require additional time.

Delivery estimates are indicative and are not guaranteed unless expressly stated otherwise. We will make reasonable efforts to communicate material delays.`,
  },
  {
    title: "4. Shipping Charges",
    content: `Shipping charges, if applicable, will be communicated by our team before the purchase is finalised.

Any free-shipping offer will be subject to the conditions communicated to the customer.

The agreed shipping charges and delivery arrangements will be confirmed through the applicable official communication channel.`,
  },
  {
    title: "5. Order Tracking",
    content: `Where tracking is available, customers may receive a tracking number or shipment link by WhatsApp, email, SMS or another agreed communication channel.

Tracking information may take some time to appear after the courier collects the package.

Customers may contact our support team if they need assistance understanding tracking updates.`,
  },
  {
    title: "6. Incorrect Address or Failed Delivery",
    content: `Customers are responsible for providing a complete and accurate delivery address and reachable contact details when confirming their purchase.

If delivery fails because of an incorrect address, an unavailable recipient or repeated unsuccessful delivery attempts, the courier may arrange another attempt or return the shipment.

Please contact us promptly if you notice an error in your delivery details.

Any additional charges or refund deductions arising from failed delivery will be assessed transparently and in accordance with applicable law.`,
  },
  {
    title: "7. Damaged Packages, Wrong Products or Missing Items",
    content: `Please inspect the package and product upon delivery where reasonably possible.

If the product arrives damaged, the wrong product is delivered, or the product or advertised accessories are missing, contact us at fathom.support@gmail.com or through our official WhatsApp number as soon as possible.

Please provide:`,
    bullets: [
      "Your order reference.",
      "A description of the delivery problem.",
      "Photographs or videos of the package and product, where available.",
    ],
    afterBullets: `Retain the packaging and accessories until the issue has been reviewed.

Our team will assess the circumstances and communicate an appropriate resolution under our Return, Repair and Replacement Policy and applicable law.`,
  },
  {
    title: "8. Product Problems After Delivery",
    content: `If a product develops a fault or does not function as expected, customers should contact our support team.

We may initially provide troubleshooting guidance or instructions for safe repair steps. If the issue cannot be resolved remotely, an authorised FATHOM executive will assess the product and determine the appropriate next steps.

Where repair is necessary, applicable charges will be communicated before chargeable work proceeds.

If the authorised executive determines that the product is not reasonably repairable, FATHOM will arrange a replacement in accordance with the applicable purchase terms, warranty and legal requirements.`,
  },
  {
    title: "9. Delays, Lost Shipments and Undelivered Orders",
    content: `Delivery may be affected by courier delays, severe weather, transport disruptions, operational issues or other circumstances beyond our reasonable control.

If tracking indicates an unusual delay or a shipment appears lost, contact our support team. We will coordinate with the courier and communicate the available resolution.

Where an order cannot be delivered, any cancellation, replacement or refund will be handled in accordance with our applicable policies and legal obligations.`,
  },
  {
    title: "10. Delivery Confirmation",
    content: `A shipment may be marked as delivered by the courier. If you have not received the package despite a delivered status, contact us promptly with your order reference so we can investigate.`,
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

export default function ShippingPolicyPage() {
  return (
    <PolicyPageClient
      heroTitle="Shipping Policy"
      heroSubtitle="Reliable delivery across India"
      heroDescription="This policy explains our order processing, dispatch, delivery and shipment-related procedures."
      introParagraph="FATHOM, operated by Shivam Enterprises, showcases appliances and related products through fathomstore.in. Purchases are not completed through direct website checkout. Customers must contact our team through WhatsApp or another official communication channel to discuss the product, confirm the order and finalise the shipping and payment arrangements."
      sections={sections}
      contactInfo={contactInfo}
      contactTitle="11. Contact Us"
      contactSubtitle="For shipping and delivery assistance:"
    />
  );
}
