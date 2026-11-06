# BuzzBro checkout setup

Shopify hosts the checkout, so a theme can't restyle it. On the **Basic** plan the look is set by
hand in the checkout editor. Checkout styling through the API, and custom blocks such as the
"Why over 2 million customers" panel, need **Shopify Plus**.

Values below come from the Figma frames *CHECK OUT PAGE WITH CARD / WITH PAYPAL / WITH DIFFERENT
BILLING ADDRESS* (nodes 125:6224, 125:6527, 125:6811).

## Already done in your store

| What | Where | Status |
|---|---|---|
| Free gifts with the kit (Soft Face Sponge, Nose & Ear Hair Trimmer, Facial Cleaning Brush, Sideburns Trimmer) | Discounts → *Free gifts with the SmoothShave Kit 2.0* (automatic, buy 1 kit → those 4 at 100% off, once per order) | Active |
| Which products are the kit's gifts | Products → BuzzBro SmoothShave Kit 2.0 → Metafields → **Free gifts** | Set, editable |
| Gifts go into the cart with the kit | BuzzBro theme (product page, "+" buttons) | In the latest theme |

In checkout, each gift shows at **$0.00** and the order summary shows the
*Free gifts with the SmoothShave Kit 2.0* discount. That matches the design's "Free" and "FREE GIFT (-$9.95)" lines.

## 1. Checkout editor: Settings → Checkout → Customize

Open the editor, then the brush icon (**Styling**) in the left column.

**Header**
- Logo: upload `buzzbro-shopify/theme/assets/buzzbro-logo-white.png` (white BuzzBro logo).
- Logo size: **Large** (design: 359 × 88).
- Position: **Center**.
- Header background: **Solid colour `#000000`**.
  - If your editor only offers an image here, use a plain black image.

**Main area (left column)**
- Background: **`#FFFFFF`**.
- Form fields: **Solid**, border **`#C2C2C2`**.
- Corner radius: **Small** (design: 0–8 px).

**Order summary (right column)**
- Background: **`#FFFFFF`**.

**Typography**
- Headings: **Inter**.
- Body: **Inter**.

**Colours**
- Accent (links, selected options): **`#14103B`** (BuzzBro navy).
- Buttons: **`#F41E1E`** (design "PAY NOW" red), button text white.
  - The editor applies one button colour to every primary button in checkout.
- Errors: leave default.

Click **Save**. The editor shows a live preview.

## 2. Checkout content

**Settings → Checkout**
- **Customer contact method:** Email.
- **Marketing:** turn on *Show a sign-up option at checkout* and pre-check it. This is the design's checked "Email me with news and offers".
- **Customer information:** set *Company name* to Don't include, *Address line 2* to Optional, and *Shipping address phone number* to Optional. This matches the Apartment (Optional) and Phone (Optional) fields.
- **Order processing:** keep *Use the shipping address as the billing address by default* on. This is the design's checked "Use shipping address as billing address", and shoppers can still choose a different billing address as in the third frame.

**Settings → Payments**
- **Express checkout:** keep **Shop Pay**, activate **PayPal** and **Google Pay**. These are the three buttons above "Or continue with credit card".
- **Shop Pay:** turn on *Shop account remember me*. This is the "Save my information for a faster checkout with a Shop account" box.

**Settings → Policies**
Fill in each policy. The checkout footer lists every one you create, matching the design's footer links:
- Refund Policy
- Shipping policy
- Privacy policy
- Terms of service
- Cancellation policy (needed once subscriptions are on)

## 3. Not possible on Basic (needs Plus or an app)

| Figma element | Why | Options |
|---|---|---|
| "30 Days Risk Free Trial · Life Time Warranty" and the beige "OVER 2 MILLION HAPPY CUSTOMERS" bar in the header | Extra header content needs checkout UI extensions (Plus) | A logo image that includes the text, made in Figma at 572 × 213. Not recommended, because it shrinks on phones. |
| "Why Over 2 Million+ Customers Choose BUZZBRO" panel with the two trust points | Order-summary blocks need checkout UI extensions (Plus) | Trust-badge apps from the Shopify App Store that support checkout on your plan |
| Review card ("No more razor burns or nicks…") | Same as above | Same as above |
| Gift icons and green "Free" pills on line items | Checkout renders its own line items | Gifts already show $0.00 with the discount name |
| Subscription wording ("you agree to the future charges…", Cancellation policy) | Appears automatically once a subscription plan is on the kit | Install Shopify Subscriptions and add a blade-refill plan |

## Notes

- **Remove all four gifts** from the kit's **Free gifts** field to stop them being added. Pause the discount too.
- **If a shopper removes the kit,** the gifts stay in the cart at their normal price, since the discount only applies with the kit. The shopper can remove them, or you can ask me to make the cart remove them automatically.
- **Free shipping** ("Fast & Free Shipping" in the design): add a free rate in **Settings → Shipping and delivery**, or a free-shipping discount.
- **Typo fixed:** the design's "COUSTOMERS" is spelled "CUSTOMERS" in the suggestions above.
