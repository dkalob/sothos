
import { ImageOff, Package } from "lucide-react";
import HistoricoCard from "./HistoricoCard";

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  foto: string | null;
}

interface ProdutoListProps {
  produtos: Produto[];
}

const ProdutoList = ({ produtos }: ProdutoListProps) => {
  return (
    <HistoricoCard title="Produtos que o cliente já comprou">
      {produtos.length > 0 ? (
        <div className="space-y-1">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                {produto.foto ? (
                  <img
                    src={produto.foto}
                    alt={produto.nome}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageOff
                    size={22}
                    className="text-muted-foreground/50"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-semibold">
                  {produto.nome}
                </p>

                <div className="flex items-center gap-1.5">
                  <Package
                    size={13}
                    className="text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    {produto.categoria}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <Package className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            Nenhum produto encontrado
          </p>
          <p className="text-xs text-muted-foreground">
            Os produtos comprados aparecerão aqui.
          </p>
        </div>
      )}
    </HistoricoCard>
  );
};

export default ProdutoList;
