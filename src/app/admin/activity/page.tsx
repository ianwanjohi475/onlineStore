"use client";

import { ActivityFeed } from "@/components/admin/activity-feed";
import { Card, PageHeader } from "@/components/admin/kit";

export default function ActivityPage() {
  return (
    <div>
      <PageHeader title="Activity log" subtitle="Everything happening in your store — sign-ups, sign-ins, orders, payments, M-Pesa and admin changes." />
      <Card className="overflow-hidden">
        <ActivityFeed />
      </Card>
    </div>
  );
}
