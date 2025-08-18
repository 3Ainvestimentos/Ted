
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NAV_ITEMS_CONFIG } from '@/lib/constants';
import { Textarea } from '@/components/ui/textarea';
import { SlidersHorizontal, UserX } from 'lucide-react';

// Mock data for collaborators
const initialCollaborators = [
  { id: 1, name: 'Patricia M. Oliveira', email: 'pmo@tedapp.com', area: 'PMO', cargo: 'Gerente de Projetos' },
  { id: 2, name: 'Leo Dirigente', email: 'lider@tedapp.com', area: 'Liderança', cargo: 'Diretor de Estratégia' },
  { id: 3, name: 'Carlos Contribuidor', email: 'colaborador@tedapp.com', area: 'Desenvolvimento', cargo: 'Desenvolvedor Sênior' },
  { id: 4, name: 'Ana Silva', email: 'ana.silva@tedapp.com', area: 'Marketing', cargo: 'Analista de Marketing' },
];

// Mock data for permissions
const initialPermissions = initialCollaborators.reduce((acc, user) => {
  acc[user.id] = NAV_ITEMS_CONFIG.reduce((userPermissions, navItem) => {
    userPermissions[navItem.href] = true; // All enabled by default
    return userPermissions;
  }, {} as Record<string, boolean>);
  return acc;
}, {} as Record<number, Record<string, boolean>>);


export default function SettingsPage() {
  const { userRole } = useAuth(); 
  const userName = userRole === "PMO" ? "Patricia M. Oliveira" : userRole === "Líder" ? "Leo Dirigente" : "Carlos Contribuidor";
  const userEmail = userRole.toLowerCase().replace('ç', 'c').replace('í', 'i') + "@tedapp.com";
  
  const [collaborators, setCollaborators] = useState(initialCollaborators);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("A plataforma está temporariamente indisponível para manutenção. Voltaremos em breve!");

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  const handleAddCollaborator = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newCollaborator = {
      id: collaborators.length + 1,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      area: formData.get('area') as string,
      cargo: formData.get('cargo') as string,
    };
    setCollaborators([...collaborators, newCollaborator]);
    
    // Set default permissions for new user
    const newUserPermissions = NAV_ITEMS_CONFIG.reduce((acc, navItem) => {
        acc[navItem.href] = true;
        return acc;
    }, {} as Record<string, boolean>);
    setPermissions({...permissions, [newCollaborator.id]: newUserPermissions});

    event.currentTarget.reset();
  };
  
  const handlePermissionChange = (userId: number, pageHref: string, isEnabled: boolean) => {
      setPermissions(prev => ({
          ...prev,
          [userId]: {
              ...prev[userId],
              [pageHref]: isEnabled
          }
      }));
  };

  const pagesForPermissions = NAV_ITEMS_CONFIG.filter(item => item.href !== '/dashboard');

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-headline font-semibold tracking-tight">Configurações</h1>

      <Tabs defaultValue="collaborators">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="collaborators">Gerenciar Colaboradores</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
          <TabsTrigger value="maintenance">Modo de Manutenção</TabsTrigger>
        </TabsList>

        {/* Collaborators Tab */}
        <TabsContent value="collaborators" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Colaborador</CardTitle>
              <CardDescription>Insira os detalhes abaixo para adicionar um novo usuário ao sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCollaborator} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="space-y-1 lg:col-span-1">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" name="name" placeholder="Nome do Colaborador" required />
                </div>
                <div className="space-y-1 lg:col-span-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="email@tedapp.com" required />
                </div>
                <div className="space-y-1 lg:col-span-1">
                  <Label htmlFor="area">Área</Label>
                  <Input id="area" name="area" placeholder="Ex: Marketing" required />
                </div>
                 <div className="space-y-1 lg:col-span-1">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" name="cargo" placeholder="Ex: Analista" required />
                </div>
                <Button type="submit" className="w-full lg:w-auto">Adicionar</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Colaboradores Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Cargo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collaborators.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.area}</TableCell>
                      <TableCell>{user.cargo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permissões de Acesso</CardTitle>
              <CardDescription>Controle o acesso de cada colaborador às diferentes seções da aplicação.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Colaborador</TableHead>
                            {/* O Dashboard é fixo, não pode ser desabilitado */}
                            {pagesForPermissions.map(page => (
                                <TableHead key={page.href} className="text-center">{page.title}</TableHead>
                            ))}
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {collaborators.map(user => (
                            <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            {pagesForPermissions.map(page => (
                                <TableCell key={page.href} className="text-center">
                                    <Switch
                                        checked={permissions[user.id]?.[page.href] ?? false}
                                        onCheckedChange={(checked) => handlePermissionChange(user.id, page.href, checked)}
                                        aria-label={`Permissão para ${user.name} em ${page.title}`}
                                    />
                                </TableCell>
                            ))}
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button>Salvar Permissões</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Maintenance Mode Tab */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <SlidersHorizontal className="h-6 w-6 text-foreground" />
                    <div>
                        <CardTitle>Modo de Manutenção</CardTitle>
                        <CardDescription>Ative para suspender o acesso, exceto para Super Admins e usuários autorizados.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className={`p-4 rounded-lg flex items-center justify-between ${isMaintenanceMode ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                    <div>
                        <h4 className={`font-semibold ${isMaintenanceMode ? 'text-orange-800 dark:text-orange-200' : 'text-green-800 dark:text-green-200'}`}>
                            {isMaintenanceMode ? 'MANUTENÇÃO ATIVA' : 'MANUTENÇÃO INATIVA'}
                        </h4>
                        <p className={`text-sm ${isMaintenanceMode ? 'text-orange-700 dark:text-orange-300' : 'text-green-700 dark:text-green-300'}`}>
                            {isMaintenanceMode ? 'Acesso limitado a usuários autorizados.' : 'Acesso liberado para todos os colaboradores.'}
                        </p>
                    </div>
                    <Switch
                        checked={isMaintenanceMode}
                        onCheckedChange={setIsMaintenanceMode}
                        aria-label="Ativar modo de manutenção"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="maintenance-message">Mensagem de Manutenção</Label>
                    <Textarea 
                        id="maintenance-message"
                        value={maintenanceMessage}
                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                        placeholder="A plataforma está temporariamente indisponível..."
                        rows={3}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="authorized-users">Usuários Autorizados na Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                       Estes usuários poderão acessar a plataforma mesmo com o modo de manutenção ativo. Super Admins sempre têm acesso.
                    </p>
                    <div className="border rounded-lg p-4 flex items-center justify-center text-sm text-muted-foreground bg-secondary/30">
                        <UserX className="h-5 w-5 mr-3"/>
                        Nenhum usuário extra autorizado.
                    </div>
                    {/* Placeholder for adding users */}
                    <Button variant="outline" size="sm" className="mt-2">Adicionar Usuário</Button>
                </div>

                <div className="flex justify-end">
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white">Salvar Detalhes da Manutenção</Button>
                </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
