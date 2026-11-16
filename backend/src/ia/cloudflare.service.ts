
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

@Injectable()
export class CloudflareService {

  async gerarImagem(prompt: string): Promise<Buffer> {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const token = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !token) {
      throw new Error('Credenciais Cloudflare não configuradas');
    }

    const model = '@cf/black-forest-labs/flux-1-schnell';

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          steps: 8,
        }),
      },
    );

    if (!response.ok) {
      const erro = await response.text();
      throw new InternalServerErrorException(
        `Erro Cloudflare: ${erro}`,
      );
    }

    const resultado = await response.json() as {
      result?: { image?: string };
      success?: boolean;
      errors?: unknown[];
    };

    const base64 = resultado.result?.image;

    if (!base64) {
      throw new Error('Cloudflare não retornou imagem');
    }

    return Buffer.from(base64, 'base64');
  }

  async testar(): Promise<string> {
    try {
      const imagem = await this.gerarImagem(
        'Professional ecommerce advertisement for a premium vitamin C facial serum, elegant orange and golden background, sophisticated studio lighting, realistic product photography, luxury commercial design, square composition, no text, no letters, no watermark.',
      );

      const pasta = join(process.cwd(), 'uploads');

      await mkdir(pasta, { recursive: true });

      const arquivo = join(pasta, 'teste-cloudflare.jpg');

      await writeFile(arquivo, imagem);

      return arquivo;
    } catch (error) {
      throw error;
    }
  }

  async prepararImagemReferencia(imagem: Buffer): Promise<Buffer> {
    return sharp(imagem)
        .resize({
        width: 511,
        height: 511,
        fit: 'inside',
        withoutEnlargement: true,
        })
        .jpeg({ quality: 90 })
        .toBuffer();
  }

  async gerarImagemComReferencia(
    imagem: Buffer,
    prompt: string,
    ): Promise<Buffer> {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const token = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !token) {
        throw new Error('Credenciais Cloudflare não configuradas');
    }

    const imagemPreparada = await this.prepararImagemReferencia(imagem);

    const form = new FormData();

    form.append('prompt', prompt);
    form.append(
        'input_image_0',
        new Blob([new Uint8Array(imagemPreparada)], {
        type: 'image/jpeg',
        }),
        'produto.jpg',
    );
    form.append('width', '1024');
    form.append('height', '1024');

    const model = '@cf/black-forest-labs/flux-2-klein-4b';

    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
        {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: form,
        },
    );

    if (!response.ok) {
        const erro = await response.text();
        throw new InternalServerErrorException(`Erro Cloudflare: ${erro}`);
    }

    const resultado = await response.json() as {
        result?: { image?: string };
    };

    const base64 = resultado.result?.image;

    if (!base64) {
        throw new Error('Cloudflare não retornou imagem');
    }

    return Buffer.from(base64, 'base64');
  }

  async testarComReferencia(imagemUrl: string): Promise<string> {
    const url = new URL(imagemUrl);

    if (
        url.protocol !== 'https:' ||
        url.hostname !== 'res.cloudinary.com'
    ) {
        throw new Error('URL inválida: use uma imagem do Cloudinary');
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Não foi possível baixar a imagem do Cloudinary');
    }

    const tipo = response.headers.get('content-type');

    if (!tipo?.startsWith('image/')) {
        throw new Error('O endereço não retornou uma imagem');
    }

    const imagemOriginal = Buffer.from(await response.arrayBuffer());

    const imagemGerada = await this.gerarImagem(
  'A simple landscape photograph of green hills under a blue sky.',
    );

    const pasta = join(process.cwd(), 'uploads');
    await mkdir(pasta, { recursive: true });

    const arquivo = join(pasta, 'teste-cloudflare-referencia.jpg');

    await sharp(imagemGerada).jpeg({ quality: 95 }).toFile(arquivo);

    return arquivo;
  }
}
