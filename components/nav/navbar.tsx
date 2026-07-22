'use client'
import { Bell } from 'lucide-react'
import { SearchIcon } from "lucide-react"
import { Avatar, AvatarImage} from '../ui/avatar'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger} from '../ui/dropdown-menu'
import { Field } from '../ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { SidebarTrigger } from '../ui/sidebar'

const Navbar = () => {
  return (
    <header className='flex h-16 items-center justify-between px-4'>
      
      {/* BOTÃO DE FECHAR/ABRIR A SIDEBAR*/}
      <SidebarTrigger/>
      
      {/* INPUT */}
      <div className="flex-1 ml-2">
        <Field className="w-full max-w-1/3">
          <InputGroup className='bg-gray-100'>
            <InputGroupInput id="inline-start-input" placeholder="Pesquise um cliente, um produto ou uma campanha..." />
            <InputGroupAddon align="inline-start">
              <SearchIcon className="text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </div>

      {/* SINO + NOME + AVATAR */}
      <div className='flex items-center gap-4'>

        {/* SINO */}
        <Bell className='h-5 w-5 text-gray-500' />

        {/* NOME */}
        <div className='flex flex-col'>
          <span className='text-sm font-bold select-none'>Nome do usuário</span>
          <span className='self-end text-xs text-gray-600 select-none'>Cargo</span>
        </div>

        {/* AVATAR */}
        <DropdownMenu>
            <DropdownMenuTrigger render={
                <Button variant='ghost' size='icon' className='rounded-full'>
                    <Avatar>
                        <AvatarImage src='https://github.com/shadcn.png' alt='shadcn' />
                    </Avatar>
                </Button>
            }/>
            <DropdownMenuContent className='w-36'>
                <DropdownMenuGroup>
                    <DropdownMenuItem className='data-highlighted:bg-indigo-100 data-highlighted:text-indigo-700'>Minha Loja</DropdownMenuItem>
                    <DropdownMenuItem className='data-highlighted:bg-indigo-100 data-highlighted:text-indigo-700'>Integrações</DropdownMenuItem>
                    <DropdownMenuItem className='data-highlighted:bg-indigo-100 data-highlighted:text-indigo-700'>Adicionar Crédito</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem variant='destructive'>Sair</DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  )
}

export default Navbar