"use client";

import { InitiativeCard } from "@/components/dashboard/initiative-card";
import { ProjectStatusChart } from "@/components/dashboard/project-status-chart";
import { MOCK_INITIATIVES } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function DashboardPage() {
  const { userRole } = useAuth(); 

  const initiativesToShow = MOCK_INITIATIVES; 

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-semibold tracking-tight">Painel</h1>
        { (userRole === 'PMO' || userRole === 'Líder') && (
          <Button asChild>
            <Link href="/initiatives/new"> 
              <PlusCircle className="mr-2 h-4 w-4" /> Criar Iniciativa
            </Link>
          </Button>
        )}
      </div>

      <section>
        <ProjectStatusChart initiatives={MOCK_INITIATIVES} />
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold tracking-tight mb-4">Iniciativas Chave</h2>
        {initiativesToShow.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {initiativesToShow.map((initiative) => (
              <InitiativeCard key={initiative.id} initiative={initiative} showDetailsLink={false} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhuma iniciativa chave para exibir.</p>
        )}
      </section>
      
      <section>
          <h2 className="text-2xl font-headline font-semibold tracking-tight mb-4">Atividade Recente</h2>
          <div className="p-6 bg-card border rounded-lg shadow-sm">
            <p className="text-muted-foreground">Feed de atividades em breve...</p>
            <ul className="mt-4 space-y-2 text-sm">
                <li><span className="font-medium">Alice Wonderland</span> atualizou o status de <span className="text-primary">Transformação Digital T4</span> para '{MOCK_INITIATIVES[0].status}'.</li>
                <li><span className="font-medium">Bob The Builder</span> adicionou um comentário em <span className="text-primary">Expansão para Novos Mercados</span>.</li>
            </ul>
          </div>
      </section>
    </div>
  );
}
