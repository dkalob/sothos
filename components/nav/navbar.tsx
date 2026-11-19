"use client";
import { useUsuario } from "@/hooks/use-usuario";
import { Bell, Settings2 } from "lucide-react";
import { SearchIcon } from "lucide-react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Field } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { SidebarTrigger } from "../ui/sidebar";
import Link from "next/link";

const Navbar = () => {
  const { usuario, sair } = useUsuario();

  return (
    <header className="flex h-16 w-full items-center gap-2 px-3 sm:px-4">
      {/* BOTÃO DE FECHAR/ABRIR A SIDEBAR*/}
      <SidebarTrigger className="shrink-0" />

      {/* INPUT */}
      <div className="flex-1 min-w-0">
        <Field className="w-full">
          <InputGroup className="bg-gray-100">
            <InputGroupInput
              placeholder="Pesquise um cliente, um produto ou uma campanha..."
              className="text-xs sm:text-sm"
            />
            <InputGroupAddon align="inline-start">
              <SearchIcon className="text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </div>

      {/* SINO + NOME + AVATAR */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {/* SINO */}
        <Button variant="ghost" size="icon" className="shrink-0">
          <Bell className="h-5 w-5 text-gray-500" />
        </Button>

        {/* NOME */}
        <div className="hidden flex-col items-end sm:flex">
          <span className="max-w-32 truncate text-sm font-bold select-none">
            {usuario?.nome ?? "—"}
          </span>
          <span className="self-end text-xs text-gray-600 select-none">
            {usuario?.papel === "ADMIN" ? "Administrador" : "Operador"}
          </span>
        </div>

        {/* AVATAR */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="shadcn"
                  />
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent className="w-36">
            <DropdownMenuGroup>
              <DropdownMenuItem className="focus:bg-secondary focus:text-primary not-data-[variant=destructive]:focus:**:text-primary">
                <Link
                  href="/configuracoes"
                  className="flex w-full items-center gap-2"
                >
                  <Settings2 />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onClick={sair}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
