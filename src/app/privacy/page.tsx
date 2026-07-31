import type { Metadata } from "next";
import { InfoPage } from "@/components/ui/info-page";

export const metadata: Metadata = { title: "Privacy policy", description: "How the Oraimo Store demo handles your information." };

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Your data"
      title="Privacy"
      accent="policy"
      description="What we collect, why, and the control you have over it."
      updated="July 2026"
      sections={[
        { heading: "What we collect", bullets: [
          "Contact details you provide (name, email, phone, delivery address).",
          "Order history and preferences to power your account and recommendations.",
          "Basic device and usage data to keep the store fast and secure.",
        ] },
        { heading: "How we use it", paragraphs: [
          "We use your information to process and deliver orders, provide support and warranty service, and — only if you opt in — send you deals and updates. We never sell your personal data.",
        ] },
        { heading: "Your choices", paragraphs: [
          "You can view and update your details from your account, unsubscribe from marketing at any time, and request a copy or deletion of your data by contacting us.",
        ] },
        { heading: "This is a demo", paragraphs: [
          "This site is a design showcase and not a live commercial store. No real orders are processed and any details entered are not stored on a production server.",
        ] },
      ]}
    />
  );
}
