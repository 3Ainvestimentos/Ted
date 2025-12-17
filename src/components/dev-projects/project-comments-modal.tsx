"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useProjectComments } from '@/contexts/project-comments-context';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ProjectCommentsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  itemId?: string;
  itemTitle?: string;
  subItemId?: string;
  subItemTitle?: string;
}

export function ProjectCommentsModal({
  isOpen,
  onOpenChange,
  projectId,
  projectName,
  itemId,
  itemTitle,
  subItemId,
  subItemTitle,
}: ProjectCommentsModalProps) {
  const { addComment, markAsRead, getCommentsForEntity, isLoading } = useProjectComments();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState<string | null>(null);

  const comments = getCommentsForEntity(projectId, itemId, subItemId);
  const unreadComments = comments.filter(c => !c.readByAdmin);

  const entityTitle = subItemTitle || itemTitle || projectName;
  const entityType = subItemId ? 'Sub-item' : itemId ? 'Item' : 'Projeto';

  useEffect(() => {
    if (!isOpen) {
      setNewComment('');
    }
  }, [isOpen]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsSaving(true);
    try {
      await addComment({
        projectId,
        itemId,
        subItemId,
        authorId: user.uid,
        authorName: user.name || 'Usuário',
        authorEmail: user.email || '',
        content: newComment.trim(),
      });
      setNewComment('');
      toast({
        title: "Comentário Adicionado",
        description: "Seu comentário foi salvo com sucesso.",
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Erro",
        description: "Não foi possível adicionar o comentário.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAsRead = async (commentId: string) => {
    setIsMarkingAsRead(commentId);
    try {
      await markAsRead(commentId);
      toast({
        title: "Comentário Marcado como Lido",
        description: "A notificação foi removida.",
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Erro",
        description: "Não foi possível marcar o comentário como lido.",
      });
    } finally {
      setIsMarkingAsRead(null);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Data desconhecida';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } catch {
      return 'Data desconhecida';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comentários - {entityType}: {entityTitle}
          </DialogTitle>
          <DialogDescription>
            Adicione comentários sobre este {entityType.toLowerCase()}. {unreadComments.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadComments.length} não lido{unreadComments.length > 1 ? 's' : ''}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Lista de comentários */}
          <ScrollArea className="flex-1 pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner className="h-6 w-6" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg border ${
                      !comment.readByAdmin ? 'bg-muted/50 border-primary/50' : 'bg-background'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{comment.authorName}</span>
                          {!comment.readByAdmin && (
                            <Badge variant="destructive" className="text-xs">
                              Não lido
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(comment.timestamp)}
                        </p>
                      </div>
                      {isAdmin && !comment.readByAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(comment.id)}
                          disabled={isMarkingAsRead === comment.id}
                          className="h-8"
                        >
                          {isMarkingAsRead === comment.id ? (
                            <LoadingSpinner className="h-4 w-4" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Marcar como lido
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum comentário ainda.</p>
                <p className="text-xs mt-1">Seja o primeiro a comentar!</p>
              </div>
            )}
          </ScrollArea>

          <Separator />

          {/* Campo para novo comentário */}
          <div className="space-y-2">
            <Textarea
              placeholder="Adicione um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSaving}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Salvando...
                  </>
                ) : (
                  'Adicionar Comentário'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


