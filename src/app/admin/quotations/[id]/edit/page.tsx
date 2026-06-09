"use client";

import { useParams } from "next/navigation";
import NewquotationPage from "../../new/page";

export default function EditquotationPage() {
  const params = useParams();
  const quotationId = params.id as string;

  return <NewquotationPage editId={quotationId} />;
}
