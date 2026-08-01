import type { Metadata } from "next";
import { InfoPage } from "@/components/ui/info-page";

export const metadata: Metadata = { title: "Shipping & delivery", description: "Delivery times, costs and tracking for your orders across Kenya." };

export default function ShippingPage() {
  return (
    <InfoPage
      eyebrow="Delivery"
      title="Shipping &"
      accent="delivery"
      description="How and when your order reaches you, wherever you are in Kenya."
      sections={[
        { heading: "Delivery times", bullets: [
          "Nairobi: next working day for orders placed before 3pm.",
          "Major towns (Mombasa, Kisumu, Nakuru, Eldoret): 2 working days.",
          "Rest of Kenya: 2–4 working days via our courier partners.",
        ] },
        { heading: "Shipping costs", paragraphs: [
          "Standard delivery is a flat KES 300, and it's free on every order over KES 5,000. You'll always see the exact cost at checkout before you pay.",
        ] },
        { heading: "Tracking your order", paragraphs: [
          "The moment your parcel leaves our warehouse you'll get an SMS and email with a live tracking link. You can also follow progress any time from the Track Order page or your account.",
        ] },
        { heading: "Pay on delivery", paragraphs: [
          "Within Nairobi you can choose to pay on delivery with cash or M-Pesa when your order arrives. This option appears at checkout for eligible addresses.",
        ] },
      ]}
    />
  );
}
