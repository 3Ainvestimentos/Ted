
"use client";

import { useState } from 'react';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import type { Collaborator } from '@/types';
import { CollaboratorsTable } from './collaborators-table';
import { UpsertCollaboratorModal } from './upsert-collaborator-modal';

export function TeamManager() {
  const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);

  const handleOpenCreateModal = () => {
    setSelectedCollaborator(null);
    setIsUpsertModalOpen(true);
  };

  const handleOpenEditModal = (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator);
    setIsUpsertModalOpen(true);
  };

  return (
    <>
      <UpsertCollaboratorModal
        isOpen={isUpsertModalOpen}
        onOpenChange={setIsUpsertModalOpen}
        collaborator={selectedCollaborator}
      />
      <CardHeader>
        <CardTitle>Gerenciamento da Equipe</CardTitle>
        <CardDescription>
          Gerencie os colaboradores que aparecerão no Controle de Equipe. Os dados aqui não concedem acesso ao sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end gap-2 mb-4">
          <Button onClick={handleOpenCreateModal}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Colaborador
          </Button>
        </div>
        <CollaboratorsTable onEdit={handleOpenEditModal} />
      </CardContent>
    </>
  );
}
