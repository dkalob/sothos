"use client"
import { ChartSpline, User, ShoppingBasket, Brain, Megaphone, PictureInPicture, CircleQuestionMark, LogOut } from 'lucide-react';
import { Button } from '../ui/button';

const menuItems = [
  { label: 'INDICADORES', icon: ChartSpline },
  { label: 'CLIENTES', icon: User },
  { label: 'PRODUTOS', icon: ShoppingBasket },
  { label: 'IA', icon: Brain },
  { label: 'CAMPANHAS', icon: Megaphone },
  { label: 'POP-UPS', icon: PictureInPicture },
]

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r bg-gray-100 p-4">
      
      {/* LOGO */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center">
          Logo
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold">Sothos</span>
          <span className="text-xs text-gray-500">Venda com IA</span>
        </div>
      </div>

      {/* MENU */}
      <nav className="mt-12 flex flex-col gap-3">
        {menuItems.map(({ label, icon: Icon }) => (
          <Button
            key={label}
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-indigo-100 hover:text-indigo-700"
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Button>
        ))}
      </nav>

      {/* Espaçador: empurra o rodapé pro final */}
      <div className="flex-1" />

      {/* RODAPÉ */}
      <div className="flex flex-col gap-4">
        
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
          UPGRADE DE PLANO
        </Button>

        <div className="flex flex-col gap-3 border-t pt-4">
          <Button variant="ghost" className="justify-start gap-2 text-sm text-gray-600">
            <CircleQuestionMark className="h-5 w-5" />
            <span>Ajuda</span>
          </Button>
          <Button variant="ghost" className="justify-start gap-2 text-sm text-gray-600">
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </Button>
        </div>
      </div>

    </aside>
  )
}

export default Sidebar