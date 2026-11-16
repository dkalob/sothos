
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly configService: ConfigService) {}

  async enviarMensagem(
    destinatario: string,
    mensagem: string,
    imagemUrl?: string | null,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    if (!token) {
      throw new InternalServerErrorException(
        'Token do Telegram não configurado',
      );
    }

    const enviar = async (metodo: string, dados: Record<string, string>) => {
      const resposta = await fetch(
        `https://api.telegram.org/bot${token}/${metodo}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dados),
        },
      );

      const resultado = await resposta.json();

      if (!resposta.ok || !resultado.ok) {
        throw new Error(
          resultado.description || 'Falha ao enviar mensagem pelo Telegram',
        );
      }

      return resultado.result;
    };

    try {
      if (imagemUrl) {
        const dados: Record<string, string> = {
          chat_id: destinatario,
          photo: imagemUrl,
        };

        if (mensagem.length <= 1024) {
          dados.caption = mensagem;
          return await enviar('sendPhoto', dados);
        }

        await enviar('sendPhoto', dados);
      }

      return await enviar('sendMessage', {
        chat_id: destinatario,
        text: mensagem,
      });
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem pelo Telegram', error);
      throw error;
    }
  }
}
