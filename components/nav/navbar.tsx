'use client'
import { Bell } from 'lucide-react'
import { SearchIcon } from "lucide-react"
import { Input } from '../ui/input'
import { Avatar, AvatarImage} from '../ui/avatar'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger} from '../ui/dropdown-menu'
import { Field } from '../ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'

const Navbar = () => {
  return (
    <header className='fixed left-64 right-0 top-0 flex h-16 items-center justify-between px-6'>
      
      {/* INPUT */}
      <div className="flex-1">
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
          <span className='text-sm font-bold'>Nome do usuário</span>
          <span className='self-end text-xs text-gray-600'>Cargo</span>
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
                    <DropdownMenuItem>Minha Loja</DropdownMenuItem>
                    <DropdownMenuItem>Integrações</DropdownMenuItem>
                    <DropdownMenuItem>Adicionar Crédito</DropdownMenuItem>
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