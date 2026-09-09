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
        throw new InternalError("MAILER_EMAIL_USER or MAILER_EMAIL_PASS missing in .env file.")
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
      throw new InternalError("MAILER_EMAIL_USER missing in .env file.")
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
      throw new FailedEmailError(`Failed to send an email to <${to}>. Original error: ${error}`)
    }
  }

  private static getBaseLayout(title: string, bodyContent: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <tr>
              <td style="padding: 20px; background-color: #0f172a; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">${APP_NAME}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px; color: #334155; font-size: 16px; line-height: 1.6;">
                ${bodyContent}
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 30px; background-color: #f8fafc; text-align: center; color: #94a3b8; font-size: 12px;">
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
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
    const htmlContent = `
      <h2 style="margin-top: 0; color: #1e293b;">${subject}</h2>
      <p style="margin-bottom: 24px;">Use the code below to complete your verification request:</p>
      <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2563eb;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">This code expires in <strong>10 minutes</strong>. If you did not request this code, please ignore this email.</p>
    `
    return this.send(receiver, subject, htmlContent)
  }

  public static async sendWelcome(receiver: string, name: string) {
    const subject = `Welcome aboard, ${name}!`
    const htmlContent = `
      <h2 style="margin-top: 0; color: #1e293b;">Welcome to ${APP_NAME}, ${name}!</h2>
      <p>We are thrilled to have you join us. Your account is active and ready to go.</p>
      <p style="margin-bottom: 0;">This is auto-generated mail.</p>
    `
    return this.send(receiver, subject, htmlContent)
  }
}