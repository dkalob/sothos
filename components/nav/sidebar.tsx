"use client";
import { useUsuario } from "@/hooks/use-usuario";
import {
  CreditCard,
  ChartSpline,
  ShoppingBasket,
  Brain,
  Megaphone,
  PictureInPicture,
  User2,
  ChevronUp,
  Settings2,
  LogOutIcon,
  Users,
  Store,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "../ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Avatar, AvatarImage } from "../ui/avatar";

const items = [
  {
    label: "Indicadores",
    icon: ChartSpline,
    url: "/dashboard",
  },
  {
    label: "Clientes",
    icon: Users,
    url: "/clientes",
  },
  {
    label: "Produtos",
    icon: ShoppingBasket,
    url: "/produtos",
  },
    {
    label: "Pedidos",
    icon: Store,
    url: "/pedidos",
  },
    {
    label: "IA",
    icon: Brain,
    url: "#",
  },
  {
    label: "Campanhas",
    icon: Megaphone,
    url: "#",
  },
  {
    label: "Pop-ups",
    icon: PictureInPicture,
    url: "#",
  },
];

const SidebarComponent = () => {
  const { usuario, sair } = useUsuario();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link href="/">
                  {/*<Image scr='/logo.svg' alt='logo' width={20} height={20}/>*/}
                  <span className="font-bold text-primary">Sothos</span>
                </Link>
              }
            ></SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator style={{ width: "auto" }} />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="select-none">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        className="hover:bg-secondary hover:text-primary"
                        render={
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        }
                      ></SidebarMenuButton>
                    </SidebarMenuItem>
                  );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton className="hover:bg-secondary hover:text-primary">
                    <User2 /> Usuário <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                }
              ></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="shadcn"
                    />
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold select-none">
                      {usuario?.nome ?? "—"}
                    </span>
                    <span className="text-xs font-md select-none">
                      {usuario?.email ?? "—"}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="focus:bg-secondary focus:text-primary not-data-[variant=destructive]:focus:**:text-primary">
                  <CreditCard />
                  Adicionar crédito
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-secondary focus:text-primary not-data-[variant=destructive]:focus:**:text-primary">
                  <Settings2 />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={sair}>
                  <LogOutIcon />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarComponent;
