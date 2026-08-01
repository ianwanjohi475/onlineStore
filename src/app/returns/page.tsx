import type { Metadata } from "next";
import { InfoPage } from "@/components/ui/info-page";

export const metadata: Metadata = { title: "Returns & warranty", description: "Our 15-day returns policy and warranty on genuine products." };

export default function ReturnsPage() {
  return (
    <InfoPage
      eyebrow="Peace of mind"
      title="Returns &"
      accent="warranty"
      description="Straightforward returns and a warranty we actually honour."
      sections={[
        { heading: "15-day returns", paragraphs: [
          "Changed your mind? Unopened items in their original packaging can be returned within 15 days of delivery for a full refund. Start a return from your account or over WhatsApp and we'll arrange collection.",
        ] },
        { heading: "12-month warranty", paragraphs: [
          "Every product carries a 12-month manufacturer warranty against defects. Audio and wearables add a 15-day no-questions replacement window on top.",
        ], bullets: [
          "Faulty on arrival: we cover return shipping and send a replacement immediately.",
          "Develops a fault within 12 months: we repair or replace it.",
          "Claims are handled in-app or on WhatsApp — most resolve the same day.",
        ] },
        { heading: "How refunds work", paragraphs: [
          "Approved refunds are issued to your original payment method within 3–5 working days. M-Pesa refunds are usually instant once approved.",
        ] },
        { heading: "What's not covered", paragraphs: [
          "Accidental damage, water damage beyond the product's rating, and normal wear (like frayed non-braided cables) aren't covered by warranty — but we'll always help you find an affordable fix.",
        ] },
      ]}
    />
  );
}
