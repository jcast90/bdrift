import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
    });

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const email = session.customer_email;
        const customerId = session.customer as string;

        if (email) {
          // Find user by email and update their plan
          const { data: users } = await supabase.auth.admin.listUsers();
          const user = users?.users?.find((u) => u.email === email);
          if (user) {
            await supabase
              .from("profiles")
              .update({ plan: "pro", stripe_customer_id: customerId })
              .eq("id", user.id);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        await supabase
          .from("profiles")
          .update({ plan: "free" })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        if (status === "active") {
          await supabase
            .from("profiles")
            .update({ plan: "pro" })
            .eq("stripe_customer_id", customerId);
        } else if (status === "canceled" || status === "unpaid") {
          await supabase
            .from("profiles")
            .update({ plan: "free" })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Webhook failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
