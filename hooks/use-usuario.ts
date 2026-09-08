"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type UsuarioLogado = {
  id: string;
  nome: string;
  email: string;
  papel: string;
  conta: { id: string; nome: string; ramo: string };
};

export function useUsuario() {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const router = useRouter();

  useEffect(() => {
    const salvo = localStorage.getItem("sothos_usuario");
    if (!salvo) return;

    try {
      setUsuario(JSON.parse(salvo));
    } catch {
      localStorage.removeItem("sothos_usuario");
    }
  }, []);

  function sair() {
    localStorage.removeItem("sothos_token");
    localStorage.removeItem("sothos_usuario");
    router.replace("/login");
  }

  return { usuario, sair };
}