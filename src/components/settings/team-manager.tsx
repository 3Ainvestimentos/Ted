
"use client";

import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function TeamManager() {
  
  return (
    <>
      <CardHeader>
        <CardTitle>Gerenciamento da Equipe</CardTitle>
        <CardDescription>Gerencie os colaboradores que aparecerão no Controle de Equipe.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
            Esta seção está em desenvolvimento. Em breve, você poderá gerenciar os dados da equipe aqui.
        </p>
      </CardContent>
    </>
  );
}
