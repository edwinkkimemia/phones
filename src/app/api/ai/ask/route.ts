import { NextResponse } from "next/server";
import { z } from "zod";
import { adviseLocal, toApiProducts } from "@/lib/ai-advisor";
import { PRODUCTS } from "@/data/catalog";

export const dynamic = "force-dynamic";

// AI shopping assistant. Uses OpenAI when OPENAI_API_KEY is set,
// otherwise the built-in Kenyan-tech recommendation engine (zero cost).
const SYSTEM = `You are the PhoneLaptops.co.ke shopping assistant — a friendly Kenyan tech expert.
Rules: prices in KES; recommend ONLY from the product list provided; never invent products or prices;
mention warranty, M-Pesa checkout and countrywide delivery; keep replies under 120 words;
if asked about delivery/warranty/payments use: Nairobi same-day/next-day, 1-3 days countrywide;
12-month warranty new (6 months pre-owned); M-Pesa STK, card, pay-on-delivery; WhatsApp 0715 135 141.`;

async function askOpenAI(message: string, history: { role: string; content: string }[]) {
  const catalog = PRODUCTS.slice(0, 40).map(
    (p) => `- ${p.name} | ${p.brand} | ${p.category} | KES ${p.price} | rating ${p.rating} | /product/${p.slug}`
  );
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL ?? "gpt-4o-mini",
      max_tokens: 400,
      messages: [
        { role: "system", content: `${SYSTEM}\n\nCATALOG:\n${catalog.join("\n")}` },
        ...history.slice(-8),
        { role: "user", content: message },
      ],
    }),
  });
  if (!res.ok) throw new Error("AI provider failed");
  const data = await res.json();
  const reply: string = data.choices?.[0]?.message?.content ?? "Sorry, try again.";
  // attach products mentioned via /product/slug links
  const slugs = [...reply.matchAll(/\/product\/([a-z0-9-]+)/g)].map((m) => m[1]);
  const products = PRODUCTS.filter((p) => slugs.includes(p.slug)).slice(0, 3);
  return { reply, products };
}

export async function POST(req: Request) {
  const Body = z.object({
    message: z.string().min(1).max(500),
    history: z.array(z.object({ role: z.string(), content: z.string() })).max(20).optional(),
  });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Say something first." }, { status: 400 });

  try {
    if (process.env.OPENAI_API_KEY) {
      const { reply, products } = await askOpenAI(parsed.data.message, parsed.data.history ?? []);
      return NextResponse.json({ reply, products: toApiProducts(products), engine: "openai" });
    }
  } catch {
    /* fall through to local engine */
  }
  const { reply, products } = adviseLocal(parsed.data.message);
  return NextResponse.json({ reply, products: toApiProducts(products), engine: "local" });
}
