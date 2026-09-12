// M-Pesa Daraja integration architecture (STK Push).
// Works in sandbox without credentials by returning a simulated response.
// In production, set MPESA_* env vars and implement OAuth + STK push.

interface StkPushInput {
  phone: string; // 2547XXXXXXXX
  amount: number;
  orderNumber: string;
  callbackUrl?: string;
}

export function normalizePhone(phone: string): string {
  let p = phone.replace(/\s+/g, "").replace(/^\+/, "");
  if (/^0\d{9}$/.test(p)) p = "254" + p.slice(1);
  if (/^7\d{8}$/.test(p)) p = "254" + p;
  return p;
}

export function isSandbox(): boolean {
  return (
    !process.env.MPESA_CONSUMER_KEY || process.env.MPESA_ENV !== "production"
  );
}

async function getAccessToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY!;
  const secret = process.env.MPESA_CONSUMER_SECRET!;
  const env = process.env.MPESA_ENV === "production" ? "api" : "sandbox";
  const creds = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(
    `https://${env}.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${creds}` }, cache: "no-store" }
  );
  if (!res.ok) throw new Error("M-Pesa OAuth failed");
  const data = await res.json();
  return data.access_token as string;
}

function stkPassword(shortcode: string, passkey: string, timestamp: string) {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(
    d.getHours()
  )}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export async function stkPush(input: StkPushInput) {
  const phone = normalizePhone(input.phone);
  if (!/^254\d{9}$/.test(phone)) {
    throw new Error("Enter a valid Safaricom number e.g. 0712 345 678");
  }
  if (isSandbox()) {
    // Simulated STK push — lets the storefront + admin flow be tested end-to-end.
    return {
      simulated: true,
      checkoutRequestId: `ws_CO_${Date.now()}`,
      message: `STK push simulated to ${phone} for KES ${input.amount}. Approve on your phone to complete.`,
    };
  }
  const token = await getAccessToken();
  const env = "api";
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const ts = timestamp();
  const res = await fetch(
    `https://${env}.safaricom.co.ke/mpesa/stkpush/v1/processrequest`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: stkPassword(shortcode, passkey, ts),
        Timestamp: ts,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(input.amount),
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL:
          input.callbackUrl ?? process.env.MPESA_CALLBACK_URL ?? "",
        AccountReference: input.orderNumber,
        TransactionDesc: `PhoneLaptops ${input.orderNumber}`,
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.errorMessage ?? "STK push failed");
  return { simulated: false, ...data };
}
