
"use client";

import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart2, HardHat } from 'lucide-react';
import { BusinessAreasManager } from '@/components/settings/business-areas-manager';
import { MaintenanceModeManager } from '@/components/settings/maintenance-mode-manager';


function MaintenanceModeTabContent() {
    return (
        <Card className="shadow-lg mt-6">
            <MaintenanceModeManager />
        </Card>
    );
}

function ContentGoalsTabContent() {
    return (
        <Card className="shadow-lg mt-6">
            <CardContent className="pt-6">
                <div className="mb-4">
                    <h3 className="text-lg font-medium">Conteúdo e Metas Estratégicas</h3>
                    <p className="text-muted-foreground text-sm">Gerencie as áreas de negócio, OKRs e KPIs que alimentam o Painel Estratégico.</p>
                </div>
                <BusinessAreasManager />
            </CardContent>
        </Card>
    )
}

const adminModules = [
    {
        name: "content",
        title: "Conteúdo e Metas",
        icon: BarChart2,
        component: <ContentGoalsTabContent />,
        disabled: false,
    },
    {
        name: "maintenance",
        title: "Modo Manutenção",
        icon: HardHat,
        component: <MaintenanceModeTabContent />,
        disabled: false,
    }
];

export default function SettingsHubPage() {
  return (
    <div className="space-y-6">
       <PageHeader
            title="Administração do Sistema"
            description="Gerencie os módulos e configurações da plataforma em um local central."
        />

        <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto">
                 {adminModules.map((mod) => (
                    <TabsTrigger key={mod.name} value={mod.name} className="py-2 flex-col h-auto" disabled={mod.disabled}>
                        <span>{mod.title}</span>
                    </TabsTrigger>
                 ))}
            </TabsList>

            {adminModules.map((mod) => (
                <TabsContent key={mod.name} value={mod.name}>
                    {mod.component}
                </TabsContent>
            ))}
        </Tabs>
    </div>
  );
}
