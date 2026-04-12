import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER', ''),
        pass: this.configService.get('SMTP_PASS', ''),
      },
    });
  }

  private async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      const from = this.configService.get('SMTP_FROM', 'noreply@eventide.com');
      if (!this.configService.get('SMTP_USER')) {
        this.logger.warn(`Email not configured. Would send to ${to}: ${subject}`);
        return;
      }
      await this.transporter.sendMail({ from, to, subject, html });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #006FEE;">Welcome to Eventide!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining Eventide! We're excited to have you on board.</p>
        <p>Start exploring amazing events near you and book your next great experience.</p>
        <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}/events"
           style="display: inline-block; background: #006FEE; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
          Explore Events
        </a>
        <p style="color: #888; margin-top: 24px;">— The Eventide Team</p>
      </div>
    `;
    await this.sendMail(email, 'Welcome to Eventide!', html);
  }

  async sendBookingConfirmation(
    email: string, name: string, eventName: string, ticketName: string, bookingId: number,
  ): Promise<void> {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #006FEE;">Booking Confirmed!</h1>
        <p>Hi ${name},</p>
        <p>Your booking has been confirmed for <strong>${eventName}</strong>.</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Ticket:</strong> ${ticketName}</p>
          <p><strong>Booking ID:</strong> #${bookingId}</p>
        </div>
        <p>We look forward to seeing you at the event!</p>
        <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}/dashboard/my-tickets"
           style="display: inline-block; background: #006FEE; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
          View My Tickets
        </a>
        <p style="color: #888; margin-top: 24px;">— The Eventide Team</p>
      </div>
    `;
    await this.sendMail(email, `Booking Confirmed - ${eventName}`, html);
  }

  async sendBookingCancellation(email: string, name: string, eventName: string): Promise<void> {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f31260;">Booking Cancelled</h1>
        <p>Hi ${name},</p>
        <p>Your booking for <strong>${eventName}</strong> has been cancelled.</p>
        <p>If this was a mistake, you can book again from the event page.</p>
        <p style="color: #888; margin-top: 24px;">— The Eventide Team</p>
      </div>
    `;
    await this.sendMail(email, `Booking Cancelled - ${eventName}`, html);
  }

  async sendEventReminder(email: string, name: string, eventName: string, eventDate: Date): Promise<void> {
    const dateStr = eventDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #006FEE;">Event Reminder</h1>
        <p>Hi ${name},</p>
        <p>Just a friendly reminder that <strong>${eventName}</strong> is coming up!</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>When:</strong> ${dateStr}</p>
        </div>
        <p>Don't forget to plan ahead and enjoy the event!</p>
        <p style="color: #888; margin-top: 24px;">— The Eventide Team</p>
      </div>
    `;
    await this.sendMail(email, `Reminder: ${eventName} is coming up!`, html);
  }
}
