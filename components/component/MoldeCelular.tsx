import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/components/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import {
  BatteryFull,
  Camera,
  Send,
  Signal,
  UserRound,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";


type Props = {
  mensagem: string;
  imagemUrl?: string | null;
  contato?: string;
  nome?: string;
};

export default function WhatsappMockup({
  mensagem,
  imagemUrl,
  contato = "(11) 99876-5432",
  nome,
}: Props) {
  
  const [mostrarResposta, setMostrarResposta] = useState(false);

  // animação que simula uma resposta do cliente
  useEffect(() => {
    if (imagemUrl && mensagem) {
      setMostrarResposta(false);

      const timer = setTimeout(() => {
        setMostrarResposta(true);
      }, 2000);

      return () => clearTimeout(timer);
    }

    setMostrarResposta(false);
  }, [imagemUrl, mensagem]);


  return (
    <div className="flex w-full items-center justify-center p-4">
      {/* IPHONE */}
      <div className="relative h-175 w-90 rounded-[42px] border-[5px] border-[#c9cbd1] bg-[#e5e5e5] p-0.75 shadow-xl">
        {/* TELA */}
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[34px] bg-white">
          {/* STATUS BAR */}
          <div className="relative flex h-9 shrink-0 items-center justify-between px-5 pt-1 text-[10px] font-semibold text-gray-700">
            <span>10:55</span>
            <div className="absolute left-1/2 top-1 h-5.5 w-21.25 -translate-x-1/2 rounded-full bg-[#f5f5f7]" />
            <div className="flex items-center gap-1">
              <Signal size={12} />
              <Wifi size={12} />
              <BatteryFull size={14} />
            </div>
          </div>

          {/* HEADER CONTATO */}
          <div className="flex h-20 shrink-0 flex-col items-center justify-center gap-1 border-b border-gray-100 bg-[#f7f7f8]">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#dedee7]">
              <UserRound size={18} className="text-white" />
            </div>
            <span className="text-[12px] font-bold text-black">{nome}</span>
            <span className="text-[11px] font-semibold text-gray-700">
              {contato}
            </span>
          </div>

          {/* CONVERSA */}
          <div className="flex-1 overflow-y-auto bg-white px-2">
            <div className="flex w-full flex-col gap-3 py-4">
              {/* RECEBIDA */}
              <Message>
                <MessageAvatar>
                  <Avatar>
                    <AvatarImage src="/avatars/03.png" alt="@avatar" />
                    <AvatarFallback>R</AvatarFallback>
                  </Avatar>
                </MessageAvatar>
                <MessageContent>
                  <Bubble variant="muted">
                    <BubbleContent>
                      Olá, gostaria de receber promoções
                    </BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>

              {/* ENVIADA (a que a IA gera) */}
              {imagemUrl && mensagem && (
                <Message align="end">
                  <MessageAvatar>
                    <Avatar>
                      <AvatarImage src="/avatars/10.png" alt="@avatar" />
                      <AvatarFallback>R</AvatarFallback>
                    </Avatar>
                  </MessageAvatar>
                  <MessageContent>
                    <BubbleGroup>
                      {imagemUrl && (
                        <Bubble>
                          <BubbleContent>
                            <img
                              src={imagemUrl}
                              alt="Imagem da campanha"
                              className="w-full rounded-md object-cover"
                            />
                          </BubbleContent>
                        </Bubble>
                      )}
                      {mensagem && (
                        <Bubble>
                          <BubbleContent className="whitespace-pre-line">
                            {mensagem}
                          </BubbleContent>
                        </Bubble>
                      )}
                    </BubbleGroup>
                  </MessageContent>
                </Message>
              )}

              {/* RESPOSTA */}

              {mostrarResposta && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
                  <Message>
                    <MessageAvatar>
                      <Avatar>
                        <AvatarImage src="/avatars/03.png" alt="@avatar" />
                        <AvatarFallback>R</AvatarFallback>
                      </Avatar>
                    </MessageAvatar>
                    <MessageContent>
                      <Bubble variant="muted">
                        <BubbleContent>Eu quero comprar!!</BubbleContent>
                        <BubbleReactions aria-label="Reactions: thumbs up">
                      <span>❤️</span>
                    </BubbleReactions>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </div>
              )}
            </div>
          </div>

          {/* CAMPO DE MENSAGEM */}
          <div className="flex h-12 shrink-0 items-center gap-2 bg-white px-3 pb-2">
            <Camera size={17} className="text-gray-400" />
            <div className="flex h-8 flex-1 items-center rounded-full border border-gray-200 px-3">
              <span className="text-[10px] text-gray-400">Enviar mensagem</span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#aeb4c0]">
              <Send size={13} className="fill-white text-white" />
            </div>
          </div>

          {/* HOME INDICATOR */}
          <div className="absolute bottom-0.75 left-1/2 h-1 w-22.5 -translate-x-1/2 rounded-full bg-gray-400/70" />
        </div>
      </div>
    </div>
  );
}
