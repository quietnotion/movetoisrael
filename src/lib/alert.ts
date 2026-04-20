const TOKEN = process.env.SLACK_ADMIN_TOKEN;
const CHANNEL = process.env.SLACK_ALERT_CHANNEL || "C0ATWQCKUDT";
const SITE = "movetoisrael.fyi";

const THROTTLE_MS = 30 * 60 * 1000;
const lastAlertAt = new Map<string, number>();
function shouldAlert(key: string): boolean {
  const now = Date.now();
  const prev = lastAlertAt.get(key) ?? 0;
  if (now - prev < THROTTLE_MS) return false;
  lastAlertAt.set(key, now);
  return true;
}

async function postToSlack(text: string, blocks?: unknown[]): Promise<void> {
  if (!TOKEN) return;
  try {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ channel: CHANNEL, text, blocks }),
    });
    const data = (await res.json()) as { ok: boolean; error?: string };
    if (!data.ok) {
      console.error(`[alert] Slack API error: ${data.error}`);
    }
  } catch (err) {
    console.error(`[alert] Slack fetch failed:`, err);
  }
}

export async function logError(area: string, err: unknown, context?: Record<string, unknown>): Promise<void> {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  console.error(`[${SITE}][${area}]`, message, context ?? "", stack ?? "");

  const throttleKey = `${area}::${message.slice(0, 80)}`;
  if (!shouldAlert(throttleKey)) return;

  const blocks: unknown[] = [
    { type: "header", text: { type: "plain_text", text: `🚨 ${SITE}: ${area}` } },
    { type: "section", text: { type: "mrkdwn", text: `*Error:* \`${message.slice(0, 500)}\`` } },
  ];
  if (context && Object.keys(context).length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Context:*\n\`\`\`${JSON.stringify(context, null, 2).slice(0, 1500)}\`\`\``,
      },
    });
  }
  if (stack) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*Stack:*\n\`\`\`${stack.slice(0, 1500)}\`\`\`` },
    });
  }
  blocks.push({
    type: "context",
    elements: [{ type: "mrkdwn", text: `Time: ${new Date().toISOString()}` }],
  });

  await postToSlack(`🚨 ${SITE} · ${area}`, blocks);
}

export async function logInfo(area: string, message: string): Promise<void> {
  console.log(`[${SITE}][${area}] ${message}`);
  await postToSlack(`ℹ️ ${SITE} · ${area}: ${message}`);
}
