import type { Metadata } from "next";
import { InfoPage } from "@/components/ui/info-page";

export const metadata: Metadata = { title: "Terms of service", description: "The terms that apply to using SIR VERT ENTERPRISE." };

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="The fine print"
      title="Terms of"
      accent="service"
      description="The basics of using this store, kept short and readable."
      updated="July 2026"
      sections={[
        { heading: "Using the store", paragraphs: [
          "By browsing or ordering you agree to use the store lawfully and to provide accurate information at checkout. You must be able to form a binding contract to place an order.",
        ] },
        { heading: "Pricing & availability", paragraphs: [
          "We work hard to keep prices and stock accurate, but errors happen. If a genuine pricing error affects your order we'll contact you before charging or shipping.",
        ] },
        { heading: "Orders & payment", paragraphs: [
          "An order is confirmed once payment is authorised. We accept M-Pesa, major cards, and pay-on-delivery in eligible areas. We may cancel and refund orders we can't fulfil.",
        ] },
        { heading: "Warranty & liability", paragraphs: [
          "Products are covered by the warranty described on our Returns & Warranty page. To the extent permitted by law, our liability is limited to the value of the product purchased.",
        ] },
        { heading: "This is a demo", paragraphs: [
          "These terms govern your use of the SIR VERT ENTERPRISE website and services.",
        ] },
      ]}
    />
  );
}
