import { Resend } from "resend";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { OrderConfirmationEmail, OrderConfirmationEmailProps } from "../emails/OrderConfirmationEmail";
import { OrderCancellationEmail, OrderCancellationEmailProps } from "../emails/OrderCancellationEmail";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn("Resend API key is missing. Skip sending email.");
    return;
  }

  return resend.emails.send({
    from: "StarShop <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
}

export async function sendOrderApprovalEmail(to: string, payload: OrderConfirmationEmailProps) {
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(OrderConfirmationEmail, payload));
  return sendEmail(to, `Order ${payload.orderId} approved`, html);
}

export async function sendOrderCancellationEmail(to: string, payload: OrderCancellationEmailProps) {
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(OrderCancellationEmail, payload));
  return sendEmail(to, `Order ${payload.orderId} cancelled`, html);
}
