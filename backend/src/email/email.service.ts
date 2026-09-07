import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('EMAIL_HOST'),
      port: Number(this.config.get<string>('EMAIL_PORT')),
      secure: false,
      auth: {
        user: this.config.get<string>('EMAIL_USER'),
        pass: this.config.get<string>('EMAIL_PASS'),
      },
    });
  }

  async enviarRecuperacaoSenha(destinatario: string, token: string) {
    const urlBase = this.config.get<string>('FRONTEND_URL');
    const link = `${urlBase}/password?token=${token}`;

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #9445ef; font-size: 28px; margin: 0 0 24px 0;">Sothos</h1>
        <h2 style="color: #0a0a0a; font-size: 20px; margin: 0 0 12px 0;">Recuperação de senha</h2>
        <p style="color: #0a0a0a; font-size: 15px; line-height: 1.5;">
          Recebemos um pedido para redefinir a senha da sua conta no Sothos.
        </p>
        <p style="margin: 28px 0;">
          <a href="${link}"
             style="background-color: #9445ef; color: #fafafa; padding: 14px 28px;
                    text-decoration: none; border-radius: 10px; display: inline-block;
                    font-size: 16px; font-weight: 500;">
            Redefinir senha
          </a>
        </p>
        <p style="color: #737373; font-size: 14px; line-height: 1.5;">
          Este link expira em 1 hora e só pode ser usado uma vez.
        </p>
        <p style="color: #737373; font-size: 14px; line-height: 1.5;">
          Se você não solicitou a alteração, ignore este e-mail.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('EMAIL_FROM'),
        to: destinatario,
        subject: 'Recuperação de senha - Sothos',
        html,
      });
    } catch (erro) {
      this.logger.error('Falha ao enviar email de recuperação', erro);
      throw erro;
    }
  }
}