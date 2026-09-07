# WhatsApp Business (Cloud API) — order confirmations setup

This turns the shop into a **Powerhouse-style** WhatsApp flow: when a customer
places an order they instantly get a WhatsApp message like:

> **Respak Express**
> Dear WAQAR,
> Thank you for placing order # RE-00012 of Rs 3,730 from Respak Express.
> Please confirm your order so that we can process it.
>
> [ Confirm Order ]  [ Cancel Order ]

Tapping a button updates the order in the admin (confirmed / cancelled) and a
follow-up WhatsApp confirms the action.

---

## 1. Create a Meta developer app

1. Go to https://developers.facebook.com → **My Apps** → **Create App**.
2. Choose **Business** as the app type (needed for WhatsApp).
3. Add the **WhatsApp** product to the app.
4. In **WhatsApp → API Setup**, connect your **business phone number**
   (the number customers will message — e.g. your Respak Express number). You
   can start with a **test number** while developing.

## 2. Gather the credentials

In **WhatsApp → API Setup** you’ll find:

- **Phone number ID** → `WA_PHONE_ID`
- **Access token** → `WA_BUSINESS_TOKEN` (create one here, or generate a
  long-lived token from a System User in Business Settings).

## 3. Set up the webhook

1. In the app → **WhatsApp → Configuration → Webhook**, click **Edit**.
2. **Callback URL:** `https://<your-site>/api/whatsapp/webhook`
   - *Production:* your real domain (e.g. `https://respakexpress.pk`).
   - *Local testing:* a tunnel such as `ngrok http 3000` or Cloudflare Tunnel,
     then use the tunnel URL (Meta cannot reach `localhost`).
3. **Verify token:** any secret string you choose — put the same value in
   `WA_VERIFY_TOKEN`.
4. Click **Verify and save**, then under **Webhook fields** subscribe to
   **messages**.

## 4. Create the message template (required for business-initiated messages)

In WhatsApp Manager (or the **Message templates** tab):

1. **Create template** → category **Utility** → name it e.g. `order_placed`,
   language `English (en)`.
2. **Body** (must match the three variables our code sends, in this order):

   ```
   Dear {{1}},

   Thank you for placing order {{2}} of {{3}} from Respak Express.
   Please confirm your order so that we can process it.

   Thank you!
   ```

3. Add two **quick-reply buttons**:
   - Button text `Confirm Order` (any payload, e.g. `confirm`)
   - Button text `Cancel Order` (payload `cancel`)
4. Submit — Meta must **approve** the template before it can be sent.

> If you prefer different wording or fewer/more variables, tell us and we’ll
> adjust the parameters sent in `src/lib/notify/whatsapp-ba.ts`.

## 5. Configure the site

Add to `.env.local` (and to the server env):

```dotenv
WA_BUSINESS_TOKEN=EAAG…            # your access token
WA_PHONE_ID=123456789012345        # phone number ID
WA_VERIFY_TOKEN=choose-a-secret    # must match the webhook verify token
WA_API_VERSION=v21.0
WA_ORDER_TEMPLATE=order_placed
WA_ORDER_TEMPLATE_LANG=en
```

Nothing breaks if these are empty — the site falls back to the `wa.me` button.

## 6. How it behaves

- **On checkout** → order is saved and the template is sent to the customer’s
  phone (auto-converted to `92…` format) with order ref + total.
- **Customer taps Confirm** → Meta posts to `/api/whatsapp/webhook` → the
  matching pending order becomes **confirmed** and a thank-you WhatsApp is
  returned.
- **Customer taps Cancel** → the order becomes **cancelled** and a cancellation
  WhatsApp is returned.
- Changes appear in **Admin → Orders** immediately.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| “template not approved / not in a sending state” | Wait for approval or fix the template (Utility category, buttons allowed). |
| Message not delivered to a real number | Your number must be verified/display in the WhatsApp Business account; test numbers can’t message real users until you add a real number. |
| Webhook “Verify” fails | Callback URL must be public **HTTPS** and `WA_VERIFY_TOKEN` must match exactly. |
| 24-hour window errors on follow-ups | Business-initiated messages must use an approved **template**. Customer replies (or Confirm/Cancel taps) reopen a 24h window in which free text is allowed. |
| Buttons don’t map to an order | Our webhook matches the **most recent pending/confirmed** order for that phone number. Keep payloads simple (`confirm`/`cancel`). |

## Security notes

- Keep `WA_BUSINESS_TOKEN` and `WA_VERIFY_TOKEN` out of Git (they live in
  `.env.local` / server env only).
- The webhook only trusts requests carrying the `WA_VERIFY_TOKEN` for the
  initial verification; for extra safety you can later add Meta’s signature
  header check.
