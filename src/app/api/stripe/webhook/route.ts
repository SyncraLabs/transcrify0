import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Map Stripe price IDs to plan names
function getPlanFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_PRICE_ID_BASIC) return "basic";
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "pro";
  return "free";
}

function getDailyLimitForPlan(plan: string): number {
  switch (plan) {
    case "basic": return 30;
    case "pro": return 999999; // effectively unlimited
    default: return 5;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (!userId) break;

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);

        await supabaseAdmin.from("profiles").update({
          stripe_customer_id: session.customer as string,
          subscription_id: subscription.id,
          subscription_status: plan,
          daily_limit: getDailyLimitForPlan(plan),
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        }).eq("id", userId);

        console.log(`Checkout completed: user ${userId} -> ${plan}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) break;

        const priceId = subscription.items.data[0]?.price.id;
        const plan = subscription.status === "active"
          ? getPlanFromPriceId(priceId)
          : "free";

        await supabaseAdmin.from("profiles").update({
          subscription_status: subscription.status === "active" ? plan : "canceled",
          daily_limit: getDailyLimitForPlan(subscription.status === "active" ? plan : "free"),
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        }).eq("id", userId);

        console.log(`Subscription updated: user ${userId} -> ${plan} (${subscription.status})`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) break;

        await supabaseAdmin.from("profiles").update({
          subscription_status: "free",
          subscription_id: null,
          daily_limit: 5,
          current_period_end: null,
        }).eq("id", userId);

        console.log(`Subscription canceled: user ${userId} -> free`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;

        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) break;

        await supabaseAdmin.from("profiles").update({
          subscription_status: "past_due",
        }).eq("id", userId);

        console.log(`Payment failed: user ${userId} -> past_due`);
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
