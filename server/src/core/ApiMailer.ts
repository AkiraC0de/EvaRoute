import nodemailer from "nodemailer"
import type { Transporter } from "nodemailer"
import { FailedEmailError, InternalError } from "./ApiError"

// NOTES: 
// - Do not touch the code above of the Public methods
// - You may only refactor the HTML format

const APP_NAME = "EvoRoute"

export class ApiMailer {
  private static transporter: Transporter | null = null

  /**
   * Lazy-loads the Nodemailer transporter to ensure process.env variables are loaded.
   */
  private static getTransporter(): Transporter {
    if (!this.transporter) {
      const user = process.env.MAILER_EMAIL_USER
      const pass = process.env.MAILER_EMAIL_PASS

      if (!user || !pass) {
        throw new Error("MAILER_EMAIL_USER or MAILER_EMAIL_PASS missing in .env file.")
      }

      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
        pool: true,
      })
    }

    return this.transporter
  }

  /**
   * Private base method to wrap and send all outbound emails.
   */
  private static async send(to: string, subject: string, htmlContent: string) {
    const sender = process.env.MAILER_EMAIL_USER
    if (!sender) {
      throw new Error("MAILER_EMAIL_USER missing in .env file.")
    }

    try {
      const transporter = this.getTransporter()
      return await transporter.sendMail({
        from: `${APP_NAME} <${sender}>`,
        to,
        subject,
        html: this.getBaseLayout(subject, htmlContent),
      })
    } catch (error) {
      throw new FailedEmailError(`Failed to send an email to <${to}>. Please try again later.`)
    }
  }

  // ---------------------------------------------------------------------
  // HTML template layer
  //
  // Neutral / grayscale only — no brand color is baked in, so this same
  // layout can be dropped into any project just by changing APP_NAME.
  // ---------------------------------------------------------------------

  /** Shared neutral palette. Swap these five values to re-theme everything. */
  private static readonly palette = {
    bg: "#f5f5f5",       // page background
    surface: "#ffffff",  // card background
    border: "#e2e2e2",   // hairlines / dividers
    text: "#1a1a1a",     // primary text
    muted: "#6b6b6b",    // secondary text
  }

  private static getBaseLayout(title: string, bodyContent: string): string {
    const { bg, surface, border, text, muted } = this.palette

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: ${bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 40px auto; background-color: ${surface}; border: 1px solid ${border};">
            <tr>
              <td style="padding: 28px 32px; border-bottom: 1px solid ${border}; text-align: center;">
                <span style="font-size: 15px; font-weight: 600; letter-spacing: 0.02em; color: ${text};">${APP_NAME}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px; color: ${text}; font-size: 15px; line-height: 1.65; text-align: center;">
                ${bodyContent}
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 32px; border-top: 1px solid ${border}; text-align: center;">
                <p style="margin: 0; color: ${muted}; font-size: 12px;">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  }

  // Public Email Methods
  // You can add new mailer methods here

  public static async sendOTP(receiver: string, otp: string, subject: string = "Verification Code") {
    const OTP_EXPIRATION_IN_MIN = 15
    const { border, text, muted } = this.palette

    const htmlContent = `
      <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: ${text};">${subject}</h2>
      <p style="margin: 0 0 24px; color: ${text};">Use the code below to complete your verification request:</p>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
        <tr>
          <td style="border: 1px solid ${border}; padding: 16px; text-align: center;">
            <span style="font-family: 'Courier New', monospace; font-size: 28px; font-weight: 700; letter-spacing: 8px; color: ${text};">${otp}</span>
          </td>
        </tr>
      </table>
      <p style="margin: 0; font-size: 13px; color: ${muted};">This code expires in <strong>${OTP_EXPIRATION_IN_MIN} minutes</strong>. If you did not request this code, please ignore this email.</p>
    `
    return this.send(receiver, subject, htmlContent)
  }

  public static async sendWelcome(receiver: string, name: string) {
    const { text, muted } = this.palette
    const subject = `Welcome aboard, ${name}!`
    const htmlContent = `
      <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: ${text};">Welcome to ${APP_NAME}, ${name}!</h2>
      <p style="margin: 0 0 16px; color: ${text};">We are thrilled to have you join us. Your account is active and ready to go.</p>
      <p style="margin: 0; font-size: 13px; color: ${muted};">This is auto-generated mail.</p>
    `
    return this.send(receiver, subject, htmlContent)
  }
}