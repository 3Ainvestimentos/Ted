"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { userRole } = useAuth(); 
  const userName = userRole === "PMO" ? "Patricia M. Oliveira" : userRole === "Líder" ? "Leo Dirigente" : "Carlos Contribuidor";
  const userEmail = userRole.toLowerCase().replace('ç', 'c').replace('í', 'i') + "@tedapp.com";
  
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-headline font-semibold tracking-tight">Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Gerencie suas informações pessoais.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`https://placehold.co/80x80.png?text=${getInitials(userName)}`} alt={userName} data-ai-hint="user avatar" />
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">Mudar Avatar</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input id="fullName" defaultValue={userName} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" defaultValue={userEmail} />
            </div>
          </div>
          <Button>Salvar Perfil</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>Configure suas preferências de notificação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications" className="font-medium">Notificações por E-mail</Label>
              <p className="text-sm text-muted-foreground">Receba atualizações por e-mail.</p>
            </div>
            <Switch id="emailNotifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="appNotifications" className="font-medium">Notificações no Aplicativo</Label>
              <p className="text-sm text-muted-foreground">Mostrar notificações dentro do aplicativo.</p>
            </div>
            <Switch id="appNotifications" defaultChecked />
          </div>
           <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weeklySummary" className="font-medium">E-mail de Resumo Semanal</Label>
              <p className="text-sm text-muted-foreground">Receba um resumo do progresso das iniciativas toda semana.</p>
            </div>
            <Switch id="weeklySummary" />
          </div>
          <Button>Salvar Configurações de Notificação</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>Personalize a aparência do aplicativo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="darkMode" className="font-medium">Modo Escuro</Label>
              <p className="text-sm text-muted-foreground">Alterne entre os temas claro e escuro.</p>
            </div>
            <Switch id="darkMode" />
          </div>
           <p className="text-sm text-muted-foreground">A troca completa de tema (claro/escuro) usando next-themes pode ser implementada aqui.</p>
          <Button>Salvar Configurações de Aparência</Button>
        </CardContent>
      </Card>

    </div>
  );
}
