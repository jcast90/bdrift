import { Inngest } from "inngest";
import config from "@/lib/config";

// Shared Inngest app — all ventures use the same app
// Events are scoped by venture name to avoid collisions
export const inngest = new Inngest({
  id: "venture-os",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// Helper to create venture-scoped event names
export function ventureEvent(eventName: string) {
  const slug = config.name.toLowerCase().replace(/\s+/g, "-");
  return `venture/${slug}/${eventName}`;
}
