import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class CloudinaryImageService {
  async gerarImagem(imagemUrl: string, prompt: string): Promise<string> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Credenciais Cloudinary não configuradas');
    }

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v2/generate/${cloudName}/image_to_image`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${apiKey}:${apiSecret}`,
            ).toString('base64')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: {
              id: 'nano-banana-2-lite-edit',
            },
            prompt,
            reference_images: [
              {
                source_type: 'url',
                url: imagemUrl,
              },
            ],
            image_size: {
              aspect_ratio: '1:1',
              resolution: '1K',
            },
            target: {
              target_type: 'managed_asset',
            },
          }),
        },
      );

      if (!response.ok) {
        const erro = await response.text();
        throw new Error(`Erro Cloudinary (${response.status}): ${erro}`);
      }

      const resultado = (await response.json()) as {
        data?: {
          assets?: Array<{
            storage?: {
              secure_url?: string;
            };
          }>;
        };
      };

      const imagemGerada = resultado.data?.assets?.[0]?.storage?.secure_url;

      if (!imagemGerada) {
        throw new Error('Cloudinary não retornou a URL da imagem');
      }

      return imagemGerada;
    } catch (erro) {
      throw new InternalServerErrorException(
        erro instanceof Error
          ? erro.message
          : 'Falha desconhecida ao gerar imagem no Cloudinary',
      );
    }
  }
}
