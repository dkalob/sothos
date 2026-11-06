
import { Mail } from "lucide-react";

interface EmailPreviewProps {
  assunto: string;
  imagem?: string | null;
  nome: string;
  mensagem: string;
  textoBotao: string;
  usuario: string;
}

export function MoldeEmail({
  assunto,
  nome,
  imagem,
  mensagem,
  textoBotao,
  usuario,
}: EmailPreviewProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-[#ddd6ef] bg-white text-black shadow-sm">

      {/* CABEÇALHO DO E-MAIL */}
      <div className="border-b border-[#ddd6ef] bg-primary/10 px-4 py-4">
        <div className="flex flex-col gap-2 text-sm leading-relaxed">
          <div className="flex gap-2">
            <span className="shrink-0 font-semibold ">
              Assunto:
            </span>
            <span className="text-muted-foreground">{assunto}</span>
          </div>
        </div>
      </div>

      {/* CORPO DO E-MAIL */}
      <div className="px-5 py-5 sm:px-8">

        {/* IMAGEM */}
        {imagem && (
          <div className="mb-5 overflow-hidden rounded-md">
            <img src={imagem} alt="Imagem da campanha" className="h-auto max-h-65 w-full object-cover" />
          </div>
        )}

        {/* MENSAGEM */}
        <div className="space-y-4 text-sm leading-[1.6] text-[#35324f]">

          <p className="font-semibold text-[#29264a]">
            Olá, {nome}!
          </p>

          <div className="whitespace-pre-line">
            {mensagem}
          </div>

        </div>

        {/* BOTÃO CTA */}
        {textoBotao.trim() && (
          <div className="my-7 flex justify-center">
            <button type="button" className="rounded-md bg-primary px-7 py-2.5 text-sm font-semibold text-white shadow-sm">
              {textoBotao}
            </button>
          </div>
        )}

        {/* ASSINATURA */}
        <div className="space-y-1 text-sm leading-relaxed text-[#35324f]">
          <p>Atenciosamente,</p>
          <p className="font-bold">
            Equipe {usuario}
          </p>
        </div>

      </div>

      {/* RODAPÉ */}
      <div className="border-t border-[#ddd6ef] bg-primary/10 px-4 py-4 text-center text-sm leading-relaxed text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {usuario}. Todos os direitos reservados.
        </p>

        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="mt-1 inline-block text-primary underline"
        >
          Descadastrar-se desta lista
        </a>
      </div>

    </div>
  );
}
