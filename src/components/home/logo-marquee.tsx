const badges = [
  "100% Genuine",
  "12-Month Warranty",
  "Free Nairobi Delivery",
  "M-Pesa & Cards",
  "15-Day Returns",
  "24/7 WhatsApp Support",
  "2.4M+ Products Sold",
];

export function LogoMarquee() {
  const row = [...badges, ...badges];
  return (
    <div className="border-y border-border bg-surface py-4">
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
          {row.map((b, i) => (
            <span key={i} className="flex items-center gap-3 whitespace-nowrap text-sm font-semibold text-muted">
              <span className="size-1.5 rounded-full bg-brand-500" /> {b}
            </span>
          ))}
        </div>
        <div aria-hidden className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
          {row.map((b, i) => (
            <span key={i} className="flex items-center gap-3 whitespace-nowrap text-sm font-semibold text-muted">
              <span className="size-1.5 rounded-full bg-brand-500" /> {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
