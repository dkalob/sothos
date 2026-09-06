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
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Recuperação de senha</h2>
        <p>Recebemos um pedido para redefinir a senha da sua conta no Sothos.</p>
        <p style="margin: 24px 0;">
          <a href="${link}"
             style="background: #1a1a1a; color: #fff; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Redefinir senha
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Este link expira em 1 hora e só pode ser usado uma vez.
        </p>
        <p style="color: #666; font-size: 14px;">
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