import { inngest } from "@/lib/inngest";
import config from "@/lib/config";

const productName = config.name;
const domain = config.domain;

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; }
    .container { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border-radius: 12px; padding: 40px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    h1 { font-size: 24px; font-weight: 700; color: #18181b; margin: 0 0 16px 0; line-height: 1.3; }
    h2 { font-size: 20px; font-weight: 600; color: #18181b; margin: 24px 0 12px 0; }
    p { font-size: 16px; line-height: 1.6; color: #3f3f46; margin: 0 0 16px 0; }
    .highlight { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0; }
    .highlight p { margin: 0; color: #1e40af; }
    .cta { display: inline-block; background: #3b82f6; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0; }
    .footer { text-align: center; padding: 24px 0; font-size: 13px; color: #a1a1aa; }
    .footer a { color: #a1a1aa; }
    ul { padding-left: 20px; }
    li { font-size: 16px; line-height: 1.6; color: #3f3f46; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      ${content}
    </div>
    <div class="footer">
      <p>${productName} &mdash; ${domain || "our website"}</p>
    </div>
  </div>
</body>
</html>`;
}

const fromAddress = `${productName} <hello@${domain || "example.com"}>`;

export const welcomeDrip = inngest.createFunction(
  {
    id: "welcome-drip-campaign",
    name: "Welcome Drip Campaign",
    triggers: [{ event: "waitlist/signup" }],
  },
  async ({ event, step }) => {
    const email = event.data.email as string;

    // Day 0: Welcome email
    await step.run("send-welcome-email", async () => {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: fromAddress,
        to: email,
        subject: `You're on the list — welcome to ${productName}!`,
        html: emailWrapper(`
          <h1>You're officially on the list.</h1>
          <p>Thank you for your interest in ${productName}. We're building something we think you're going to love, and we're thrilled to have you along for the ride.</p>
          <div class="highlight">
            <p>You've secured your spot. We'll keep you updated on our progress and let you know the moment early access opens up.</p>
          </div>
          <p>Over the next few days, we'll share more about what ${productName} can do for you and why we built it.</p>
          <p>In the meantime, if you have any questions, just reply to this email. We read every message.</p>
          <p style="margin-top: 32px;">Welcome aboard,<br/><strong>The ${productName} Team</strong></p>
        `),
      });
    });

    // Wait 2 days
    await step.sleep("wait-for-value-email", "2 days");

    // Day 2: Value proposition email
    await step.run("send-value-email", async () => {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: fromAddress,
        to: email,
        subject: `Here's what ${productName} can do for you`,
        html: emailWrapper(`
          <h1>Built for the way you actually work.</h1>
          <p>We didn't build ${productName} to be another tool that collects dust. We built it to solve real problems that slow you down every day.</p>
          <h2>What makes ${productName} different:</h2>
          <ul>
            <li><strong>Save hours every week</strong> — Automate the repetitive tasks that drain your time and energy.</li>
            <li><strong>Stay focused on what matters</strong> — A clean, intentional interface that keeps you in flow.</li>
            <li><strong>Get results faster</strong> — Purpose-built workflows designed around outcomes, not features.</li>
            <li><strong>Scale with confidence</strong> — Infrastructure that grows with you, not against you.</li>
          </ul>
          <div class="highlight">
            <p>We're putting the finishing touches on early access. You'll be among the first to experience it.</p>
          </div>
          <p>More details coming soon. Stay tuned.</p>
          <p style="margin-top: 32px;">Best,<br/><strong>The ${productName} Team</strong></p>
        `),
      });
    });

    // Wait 3 more days (Day 5 total)
    await step.sleep("wait-for-social-proof-email", "3 days");

    // Day 5: Social proof email
    await step.run("send-social-proof-email", async () => {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: fromAddress,
        to: email,
        subject: `You're in great company`,
        html: emailWrapper(`
          <h1>People are paying attention.</h1>
          <p>Since you signed up, our waitlist has been growing fast. Teams and professionals across industries are excited about what ${productName} can unlock for them.</p>
          <h2>Why people are joining:</h2>
          <ul>
            <li><strong>Founders</strong> are looking for tools that help them move faster without hiring a bigger team.</li>
            <li><strong>Teams</strong> want a single platform that eliminates the tool sprawl they've been dealing with.</li>
            <li><strong>Professionals</strong> want to reclaim their time and focus on high-impact work.</li>
          </ul>
          <div class="highlight">
            <p>The demand has been incredible. We're finalizing early access — and as an early sign-up, you'll get priority.</p>
          </div>
          <p>We can't wait to show you what we've been building.</p>
          <p style="margin-top: 32px;">Cheers,<br/><strong>The ${productName} Team</strong></p>
        `),
      });
    });

    // Wait 2 more days (Day 7 total)
    await step.sleep("wait-for-urgency-email", "2 days");

    // Day 7: Urgency email
    await step.run("send-urgency-email", async () => {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: fromAddress,
        to: email,
        subject: `Early access spots are limited — don't miss out`,
        html: emailWrapper(`
          <h1>We're almost ready to open the doors.</h1>
          <p>Early access to ${productName} is right around the corner, and we want to make sure you don't miss your window.</p>
          <div class="highlight">
            <p>We're offering a limited number of early access spots with exclusive benefits — including discounted pricing that won't be available after launch.</p>
          </div>
          <h2>Early access members get:</h2>
          <ul>
            <li><strong>Founding member pricing</strong> — locked in for life, significantly below our planned retail price.</li>
            <li><strong>Direct access to the team</strong> — share feedback and shape the product roadmap.</li>
            <li><strong>First look at every new feature</strong> — before anyone else sees it.</li>
          </ul>
          <p>Spots are limited because we want to onboard members thoughtfully and ensure a great experience for everyone.</p>
          <p>Keep an eye on your inbox — your invitation is coming soon.</p>
          <p style="margin-top: 32px;">Talk soon,<br/><strong>The ${productName} Team</strong></p>
        `),
      });
    });

    return { success: true, email };
  }
);
