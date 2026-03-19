"use client";

import { useParams } from "next/navigation";
import NewInvoicePage from "../../new/page";

export default function EditInvoicePage() {
  const params = useParams();
  const invoiceId = params.id as string;

  return <NewInvoicePage editId={invoiceId} />;
}
