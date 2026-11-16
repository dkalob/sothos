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

 
  async enviarCampanha(
    destinatario: string,
    assunto: string,
    conteudo: string,
    imagemUrl?: string | null,
    nomeLoja?: string,
    textoBotao?: string | null,
  ) {
    const escaparHtml = (texto: string) =>
      texto
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const nomeMarca = nomeLoja?.trim() || 'Sothos';
    const anoAtual = new Date().getFullYear();

    const conteudoSeguro = escaparHtml(conteudo).replace(/\n/g, '<br>');
    const textoBotaoSeguro = textoBotao?.trim()
  ? escaparHtml(textoBotao.trim())
  : null;

    // Só permite imagens de endereços HTTP ou HTTPS.
    const imagemValida =
      imagemUrl && /^https?:\/\/\S+$/i.test(imagemUrl)
        ? escaparHtml(imagemUrl)
        : null;

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light">
        </head>

        <body style="
          margin: 0;
          padding: 0;
          background-color: #f4f4f7;
          font-family: Arial, Helvetica, sans-serif;
          color: #333333;
        ">

          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="background-color: #f4f4f7; padding: 32px 12px;"
          >
            <tr>
              <td align="center">

                <table
                  role="presentation"
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    max-width: 600px;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                  "
                >

                  <!-- CABEÇALHO -->
                  <tr>
                    <td
                      align="center"
                      style="
                        background-color: #9445ef;
                        padding: 30px 24px;
                      "
                    >
                      <h1 style="
                        margin: 0;
                        color: #ffffff;
                        font-size: 28px;
                        font-weight: 700;
                        letter-spacing: 0.5px;
                      ">
                        ${escaparHtml(nomeMarca)}
                      </h1>

                      <p style="
                        margin: 8px 0 0;
                        color: #f1e6ff;
                        font-size: 13px;
                      ">
                        Novidades e ofertas especiais
                      </p>
                    </td>
                  </tr>

                  <!-- CONTEÚDO -->
                  <tr>
                    <td style="padding: 32px 28px;">

                      ${
                        imagemValida
                          ? `
                            <div style="
                              margin: 0 0 28px;
                              text-align: center;
                            ">
                              <img
                                src="${imagemValida}"
                                alt="Imagem da campanha"
                                width="544"
                                style="
                                  display: block;
                                  width: 100%;
                                  max-width: 544px;
                                  height: auto;
                                  margin: 0 auto;
                                  border: 0;
                                  border-radius: 10px;
                                "
                              />
                            </div>
                          `
                          : ''
                      }

                      <div style="
                        font-size: 15px;
                        line-height: 1.8;
                        color: #444444;
                        word-wrap: break-word;
                      ">
                        ${conteudoSeguro}
                      </div>

                      ${
                        textoBotaoSeguro
                          ? `
                            <div style="
                              margin-top: 28px;
                              text-align: center;
                            ">
                              <span style="
                                display: inline-block;
                                background-color: #9445ef;
                                color: #ffffff;
                                padding: 14px 32px;
                                border-radius: 8px;
                                font-size: 15px;
                                font-weight: 700;
                                text-align: center;
                              ">
                                ${textoBotaoSeguro}
                              </span>
                            </div>
                          `
                          : ''
                      }

                    </td>
                  </tr>

                  <!-- RODAPÉ -->
                  <tr>
                    <td style="
                      background-color: #faf9fc;
                      border-top: 1px solid #eeeeee;
                      padding: 24px;
                      text-align: center;
                    ">
                      <p style="
                        margin: 0 0 8px;
                        color: #555555;
                        font-size: 13px;
                      ">
                        Atenciosamente,
                        <strong>${escaparHtml(nomeMarca)}</strong>
                      </p>

                      <p style="
                        margin: 0;
                        color: #999999;
                        font-size: 12px;
                        line-height: 1.6;
                      ">
                        &copy; ${anoAtual} — Sothos.
                        Todos os direitos reservados.
                      </p>
                    </td>
                  </tr>

                </table>

                <p style="
                  margin: 18px 0 0;
                  color: #aaaaaa;
                  font-size: 11px;
                  text-align: center;
                ">
                  Mensagem enviada por ${escaparHtml(nomeMarca)}.
                </p>

              </td>
            </tr>
          </table>

        </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('EMAIL_FROM'),
        to: destinatario,
        subject: assunto,
        html,
      });
    } catch (erro) {
      this.logger.error(
        `Falha ao enviar campanha por e-mail para ${destinatario}`,
        erro,
      );
      throw erro;
    }
  }

}
