import { type ReactElement } from "react";
import { render } from "@react-email/render";
import { eq } from "drizzle-orm";

import { db } from "./db";
import { user } from "../db/schema";
import { sendEmail, isEmailConfigured } from "./mail";
import { isSmsConfigured, sendSms } from "./sms";

// ── Types ───────────────────────────────────────────────────────────

export type ChannelStatus = "sent" | "skipped" | "failed" | "not_requested";

export interface NotificationStatus {
  email: ChannelStatus;
  sms: ChannelStatus;
}

export interface EmailNotification {
  to: string;
  subject: string;
  template: ReactElement;
}

export interface SmsNotification {
  to: string;
  text: string;
}

export interface NotifyUserAndAdminsOptions {
  user?: {
    email: string;
    phone?: string;
    subject: string;
    template: ReactElement;
    smsText?: string;
  };
  admins?: {
    subject: string;
    template: ReactElement;
    smsText?: string;
    phones?: string[];
  };
}

// ── Core senders ────────────────────────────────────────────────────

// Never throws: channel failures are caught, logged, and reported via
// NotificationStatus so a broken notification can't fail the caller's
// request. Throws only if the DB query for admins fails.
export async function sendNotification(channels: {
  email?: EmailNotification;
  sms?: SmsNotification;
}): Promise<NotificationStatus> {
  const status: NotificationStatus = { email: "not_requested", sms: "not_requested" };

  if (channels.email) {
    status.email = await sendEmailNotification(channels.email);
  }

  if (channels.sms) {
    if (!isSmsConfigured()) {
      console.warn("[notifications] sms skipped: SURGE_API_KEY/SURGE_ACCOUNT_ID not set");
      status.sms = "skipped";
    } else {
      try {
        await sendSms(channels.sms.to, channels.sms.text);
        status.sms = "sent";
      } catch (err) {
        console.error(`[notifications] sms to ${channels.sms.to} failed:`, err);
        status.sms = "failed";
      }
    }
  }

  return status;
}

async function sendEmailNotification(
  notification: EmailNotification
): Promise<ChannelStatus> {
  if (!isEmailConfigured()) {
    console.warn("[notifications] email skipped: EMAIL_USER/EMAIL_PASS not set");
    return "skipped";
  }

  try {
    const html = await render(notification.template);
    await sendEmail(notification.to, notification.subject, html);
    return "sent";
  } catch (err) {
    console.error(`[notifications] email to ${notification.to} failed:`, err);
    return "failed";
  }
}

// ── Admin fan-out ───────────────────────────────────────────────────

export async function getAdminEmails(): Promise<string[]> {
  const rows = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.role, "admin"));
  return rows.map((row) => row.email);
}

// ── User + admin convenience ────────────────────────────────────────

export async function notifyUserAndAdmins(
  options: NotifyUserAndAdminsOptions
): Promise<{ user?: NotificationStatus; admins?: NotificationStatus }> {
  const result: { user?: NotificationStatus; admins?: NotificationStatus } = {};

  if (options.user) {
    const { email, phone, subject, template, smsText } = options.user;
    result.user = await sendNotification({
      email: { to: email, subject, template },
      sms: phone && smsText ? { to: phone, text: smsText } : undefined,
    });
  }

  if (options.admins) {
    const { subject, template, smsText, phones } = options.admins;
    const adminEmails = await getAdminEmails();

    if (adminEmails.length === 0) {
      console.warn("[notifications] no admins found in user table");
    }

    let emailStatus: ChannelStatus =
      adminEmails.length > 0 ? "sent" : "skipped";

    if (adminEmails.length > 0) {
      try {
        const html = await render(template);
        for (const email of adminEmails) {
          await sendEmail(email, subject, html);
        }
      } catch (err) {
        console.error("[notifications] admin email failed:", err);
        emailStatus = "failed";
      }
    }

    let smsStatus: ChannelStatus = "not_requested";
    if (phones?.length && smsText) {
      if (!isSmsConfigured()) {
        smsStatus = "skipped";
      } else {
        for (const phone of phones) {
          try {
            await sendSms(phone, smsText);
            smsStatus = "sent";
          } catch (err) {
            console.error(`[notifications] sms to ${phone} failed:`, err);
            smsStatus = "failed";
          }
        }
      }
    }

    result.admins = { email: emailStatus, sms: smsStatus };
  }

  return result;
}
