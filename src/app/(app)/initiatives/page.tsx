"use client";

import { InitiativeCard } from "@/components/dashboard/initiative-card";
import { MOCK_INITIATIVES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState, useMemo } from "react";
import type { Initiative } from "@/types";

export default function InitiativesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const filteredInitiatives = useMemo(() => {
    return MOCK_INITIATIVES.filter(initiative => {
      const matchesSearch = initiative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            initiative.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            initiative.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || initiative.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const initiativeStatuses = ["all", ...new Set(MOCK_INITIATIVES.map(i => i.status))];


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-headline font-semibold tracking-tight">Iniciativas Estratégicas</h1>
        <Button asChild>
          <Link href="/initiatives/new"> 
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Nova Iniciativa
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card shadow-sm">
        <Input 
          placeholder="Buscar iniciativas..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <div className="flex gap-2 items-center">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              {initiativeStatuses.map(status => (
                <SelectItem key={status} value={status} className="capitalize">{status === "all" ? "Todos os Status" : status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredInitiatives.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredInitiatives.map((initiative: Initiative) => (
            <InitiativeCard key={initiative.id} initiative={initiative} showDetailsLink={true} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">Nenhuma iniciativa encontrada com seus critérios.</p>
          <p className="text-sm text-muted-foreground mt-2">Tente ajustar sua busca ou filtros.</p>
        </div>
      )}
    </div>
  );
}
