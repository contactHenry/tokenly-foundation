import { PDFDocument, rgb, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fontAsset from "@/assets/invoice-sans.ttf.asset.json";
import type { InvoiceStatus } from "./billing-store";

export type InvoiceDetails = {
  number: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
  workspace: string;
};

// Fixed print palette: invoices stay legible on white paper in either app theme.
const ink = rgb(0.08, 0.08, 0.09);
const secondary = rgb(0.40, 0.40, 0.43);
const rule = rgb(0.86, 0.86, 0.88);
const paper = rgb(1, 1, 1);
const wash = rgb(0.96, 0.96, 0.97);
let fontBytes: Promise<ArrayBuffer> | undefined;

export async function createInvoicePdf(invoice: InvoiceDetails): Promise<Blob> {
  fontBytes ??= fetch(fontAsset.url).then((response) => {
    if (!response.ok) throw new Error("Invoice font could not be loaded");
    return response.arrayBuffer();
  }).catch((error: unknown) => { fontBytes = undefined; throw error; });
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(await fontBytes, { subset: true });
  pdf.setTitle(`${invoice.number} | Tokenly`);
  pdf.setAuthor("Tokenly");
  pdf.setSubject("Preview billing invoice");
  const page = pdf.addPage([595.28, 841.89]);
  const left = 48, right = 547.28;
  const fit = (value: string, size: number, width: number, face: PDFFont = font) => {
    if (face.widthOfTextAtSize(value, size) <= width) return value;
    let trimmed = value;
    while (trimmed.length && face.widthOfTextAtSize(`${trimmed}…`, size) > width) trimmed = trimmed.slice(0, -1);
    return `${trimmed}…`;
  };
  const text = (value: string, x: number, top: number, size = 10, color = ink, width = right - x) =>
    page.drawText(fit(value, size, width), { x, y: 841.89 - top - size, size, font, color });
  const endText = (value: string, top: number, size = 10, color = ink) =>
    text(value, right - font.widthOfTextAtSize(value, size), top, size, color);
  const line = (top: number, x = left, end = right) =>
    page.drawLine({ start: { x, y: 841.89 - top }, end: { x: end, y: 841.89 - top }, thickness: 0.6, color: rule });
  const money = (amount: number) => amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const date = new Date(`${invoice.date}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

  // The same five-bar geometry as Tokenly's in-app logo, rendered as crisp vectors.
  page.drawSvgPath("M4 0 H32 Q36 0 36 4 V32 Q36 36 32 36 H4 Q0 36 0 32 V4 Q0 0 4 0 Z", { x: left, y: 794, color: ink });
  for (const bar of [{ x: 160, y: 190, h: 340 }, { x: 247, y: 241, h: 183 }, { x: 335, y: 347, h: 183 }, { x: 422, y: 280, h: 182 }, { x: 510, y: 190, h: 340 }]) {
    page.drawRectangle({ x: left + bar.x / 20, y: 794 - (bar.y + bar.h) / 20, width: 2.5, height: bar.h / 20, color: paper });
  }
  text("tokenly", left + 47, 49, 23);
  text("AI usage & credits", left, 98, 10, secondary);
  endText("INVOICE", 45, 25);
  endText(invoice.number, 84, 10, secondary);
  line(132);

  text("BILL TO", left, 159, 9, secondary);
  text(invoice.workspace, left, 180, 14, ink, 255);
  text("Workspace billing account", left, 207, 10, secondary);
  text("Invoice date", 352, 159, 9, secondary);
  endText(date, 180, 10);
  text("Currency", 352, 209, 9, secondary);
  endText("USD", 209, 10);
  text("Payment status", 352, 236, 9, secondary);
  endText(invoice.status === "paid" ? "Paid" : invoice.status === "failed" ? "Payment failed" : "Payment due", 236, 10);

  page.drawRectangle({ x: left, y: 841.89 - 323, width: right - left, height: 34, color: wash });
  text("DESCRIPTION", left + 12, 301, 9, secondary);
  text("QTY", 351, 301, 9, secondary);
  endText("AMOUNT (USD)", 301, 9, secondary);
  text("AI usage & credit services", left + 12, 344, 11);
  text("Workspace billing summary", left + 12, 366, 9, secondary);
  text("1", 358, 344, 11);
  endText(money(invoice.amount), 344, 11);
  line(400);
  text("Subtotal", 352, 425, 10, secondary);
  endText(money(invoice.amount), 425, 10);
  line(454, 352);
  text("Invoice total", 352, 469, 11);
  endText(money(invoice.amount), 469, 15);
  text("Amount paid", 352, 506, 10, secondary);
  endText(money(invoice.status === "paid" ? invoice.amount : 0), 506, 10);
  line(536, 352);
  text("Balance due", 352, 550, 11);
  endText(money(invoice.status === "paid" ? 0 : invoice.amount), 550, 15);

  text("BILLING NOTES", left, 625, 9, secondary);
  text(invoice.status === "paid" ? "Payment recorded. No balance remains on this invoice." : invoice.status === "failed" ? "Payment was unsuccessful. Review this invoice in Billing to retry." : "This invoice has an outstanding balance. Review it in Billing.", left, 647, 10);
  text("Tax details and payment terms have not been supplied.", left, 670, 9, secondary);
  line(744);
  text("Preview invoice · Sample billing data · Not a tax invoice", left, 761, 8, secondary);
  endText("1 / 1", 761, 8, secondary);
  const bytes = await pdf.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

export async function downloadInvoice(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: "application/pdf" });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return; }
    catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}