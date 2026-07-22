'use client'
import { CreditCard, ChartSpline, User, ShoppingBasket, Brain, Megaphone, PictureInPicture, CircleQuestionMark, LogOut, User2, ChevronUp, Settings2, LogOutIcon, ChevronRight, Plus, Users } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarSeparator } from '../ui/sidebar';
import Link from 'next/link';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Avatar, AvatarImage } from '../ui/avatar';

const items = [
  { 
    label: 'Indicadores', 
    icon: ChartSpline, 
    url: '#'
  },
  { 
    label: 'Clientes', 
    icon: Users, 
    url: '#',
    subMenus: [
      { label: 'Ver Clientes', url: '#'},
      { label: 'Adicionar Cliente', icon: Plus, url: '#'},
    ]
  },
  { 
    label: 'Produtos', 
    icon: ShoppingBasket, 
    url: '#',
    subMenus: [
      { label: 'Ver Produtos', url: '#'},
      { label: 'Adicionar Produto', icon: Plus, url: '#'},
    ]
  },
  { 
    label: 'Campanhas', 
    icon: Megaphone, 
    url: '#',
    subMenus: [
      { label: 'Ver Campanhas', url: '#'},
      { label: 'Adicionar Campanha', icon: Plus, url: '#'},
    ]
  },
  { 
    label: 'IA', 
    icon: Brain, 
    url: '#'
  },  
  { 
    label: 'Pop-ups', 
    icon: PictureInPicture, 
    url: '#'
  }
]

const SidebarComponent = () => {
  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='py-4'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
            render={
              <Link href='/'>
                {/*<Image scr='/logo.svg' alt='logo' width={20} height={20}/>*/}
                <span className='font-bold text-indigo-500'>Sothos</span>
              </Link>
            }>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator style={{ width: 'auto' }}/>
      <SidebarContent >
      <SidebarGroup>
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map(item => {
              if (!item.subMenus) {
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      className='hover:bg-indigo-100 hover:text-indigo-700' 
                      render={
                        <Link href={item.url}>
                          <item.icon/>
                          <span>{item.label}</span>
                        </Link>
                        }
                  >
                </SidebarMenuButton>
              </SidebarMenuItem>
                )   
              }
                return (
                  <Collapsible key={item.label} className='group/collapsible'>
                    <SidebarMenuItem>
                      <CollapsibleTrigger
                        render={
                          <SidebarMenuButton className='hover:bg-indigo-100 hover:text-indigo-700'>
                            <item.icon />
                            <span>{item.label}</span>
                            <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                          </SidebarMenuButton>
                        }
                      />
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subMenus.map((sub, index) => (
                            <SidebarMenuSubItem key={`${item.label}-${index}`}>
                              <SidebarMenuSubButton
                                className='hover:bg-indigo-100 hover:text-indigo-700' 
                                render={
                                <Link href={sub.url} className='flex items-center gap-2'>
                                  {sub.icon && <sub.icon className='h-4 w-4' />}
                                  {sub.label}
                                </Link>}
                              />
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
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
                <SidebarMenuButton className='hover:bg-indigo-100 hover:text-indigo-700'>
                  <User2/> Usuário <ChevronUp className='ml-auto'/>
                </SidebarMenuButton>
              }>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <div className='flex items-center gap-4'>
                  <Avatar>
                        <AvatarImage src='https://github.com/shadcn.png' alt='shadcn' />
                  </Avatar>
                  <div className='flex flex-col'>
                    <span className='text-sm font-semibold select-none'>Nome do usuário</span>
                    <span className='text-xs font-md select-none'>usuario@email.com</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='data-highlighted:bg-indigo-100 data-highlighted:text-indigo-700'><CreditCard/>Adicionar crédito</DropdownMenuItem>
                <DropdownMenuItem className='data-highlighted:bg-indigo-100 data-highlighted:text-indigo-700'><Settings2/>Configurações</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant='destructive'><LogOutIcon/>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
};

export default SidebarComponent