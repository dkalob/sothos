import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@base-ui/react';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Home = () => {
  return (
    <div className="h-screen flex justify-center items-center gap-4">
      <Card className="w-lg p-4 bg-gray-100">
        <Input placeholder="Digite algo..."/>
        <Separator className="my-2"/>
        <Button><Plus/>Cadastrar</Button>
      </Card>
    </div>
  );
};

export default Home;