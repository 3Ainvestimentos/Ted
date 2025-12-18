
"use client";

import { STATUS_ICONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronDown, ChevronRight, Filter, CornerDownRight, ChevronsUpDown, Archive, Undo, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState, useMemo } from "react";
import type { Initiative, InitiativePriority, InitiativeStatus } from "@/types";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { useInitiatives } from "@/contexts/initiatives-context";
import { parseISO, startOfMonth, endOfMonth, addMonths, eachDayOfInterval, isWithinInterval, getMonth, getYear, format, isToday, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InitiativesTableProps {
    initiatives: Initiative[];
    onInitiativeClick: (initiative: Initiative) => void;
    onStatusChange?: (initiativeId: string, newStatus: InitiativeStatus) => void;
}

const sortInitiatives = (initiatives: Initiative[]) => {
    return initiatives.sort((a, b) => {
        const aParts = a.topicNumber.split('.').map(Number);
        const bParts = b.topicNumber.split('.').map(Number);
        const len = Math.max(aParts.length, bParts.length);
        for (let i = 0; i < len; i++) {
            const aVal = aParts[i] || 0;
            const bVal = bParts[i] || 0;
            if (aVal !== bVal) return aVal - bVal;
        }
        return 0;
    });
};

export function InitiativesTable({ initiatives, onInitiativeClick, onStatusChange }: InitiativesTableProps) {
  const { updateSubItem, archiveInitiative, unarchiveInitiative } = useInitiatives();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [archiveFilter, setArchiveFilter] = useState<string>("active");
  
  const parentInitiativeIds = useMemo(() => 
    new Set(initiatives.filter(i => i.subItems && i.subItems.length > 0).map(i => i.id))
  , [initiatives]);

  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [areAllExpanded, setAreAllExpanded] = useState(false);

  const toggleAllTopics = () => {
    if (areAllExpanded) {
        setExpandedTopics(new Set());
    } else {
        setExpandedTopics(new Set(parentInitiativeIds));
    }
    setAreAllExpanded(prev => !prev);
  };


  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const filteredInitiatives = useMemo(() => {
    const filtered = initiatives.filter(initiative => {
      const matchesSearch = initiative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (initiative.owner && initiative.owner.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            initiative.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || initiative.status === statusFilter;
      const matchesArchive = archiveFilter === 'all' || (archiveFilter === 'active' && !initiative.archived) || (archiveFilter === 'archived' && initiative.archived)
      return matchesSearch && matchesStatus && matchesArchive;
    });
    return sortInitiatives(filtered);
  }, [searchTerm, statusFilter, archiveFilter, initiatives]);
  
  const initiativeStatuses: (string | InitiativeStatus)[] = ["all", "Pendente", "Em execução", "Concluído", "Suspenso"];

  const hasAuc = useMemo(() => initiatives.some(i => i.auc !== undefined && i.auc !== null), [initiatives]);

  // Calcular datas do Gantt
  const { dateHeaders, monthHeaders } = useMemo(() => {
    const today = new Date();
    const chartStartDate = startOfMonth(today);
    const chartEndDate = endOfMonth(addMonths(today, 5)); // 5 meses à frente = 6 meses total

    const dates = eachDayOfInterval({ start: chartStartDate, end: chartEndDate });
    
    const months: { name: string; colSpan: number }[] = [];
    if (dates.length > 0) {
        let currentMonth = -1;
        dates.forEach(date => {
            const month = getMonth(date);
            if (month !== currentMonth) {
                currentMonth = month;
                months.push({ name: format(date, 'MMM yyyy', { locale: ptBR }), colSpan: 1 });
            } else {
                months[months.length - 1].colSpan++;
            }
        });
    }
    
    return { dateHeaders: dates, monthHeaders: months };
  }, []);

  // Função para calcular datas de uma iniciativa
  const getInitiativeDates = (initiative: Initiative) => {
    let startDate: Date;
    try {
        startDate = initiative.lastUpdate 
            ? (parseISO(initiative.lastUpdate).toString() !== 'Invalid Date' ? parseISO(initiative.lastUpdate) : new Date())
            : new Date();
    } catch {
        startDate = new Date();
    }
    
    let endDate: Date;
    try {
        endDate = initiative.deadline 
            ? (parseISO(initiative.deadline).toString() !== 'Invalid Date' ? parseISO(initiative.deadline) : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000))
            : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    } catch {
        endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    
    return { startDate, endDate };
  };

  // Função para calcular datas de um subitem
  const getSubItemDates = (initiative: Initiative, subItem: any) => {
    const { startDate: initiativeStart, endDate: initiativeEnd } = getInitiativeDates(initiative);
    let subItemEndDate: Date;
    try {
        subItemEndDate = subItem.deadline 
            ? (parseISO(subItem.deadline).toString() !== 'Invalid Date' ? parseISO(subItem.deadline) : initiativeEnd)
            : initiativeEnd;
    } catch {
        subItemEndDate = initiativeEnd;
    }
    
    return { startDate: initiativeStart, endDate: subItemEndDate };
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-[10px]"
            />
          </div>
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-[10px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent className="text-[10px]">
                {initiativeStatuses.map(status => (
                  <SelectItem key={status} value={status} className="capitalize text-[10px]">{status === "all" ? "Todos os Status" : status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={archiveFilter} onValueChange={setArchiveFilter}>
              <SelectTrigger className="h-8 text-[10px]">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent className="text-[10px]">
                <SelectItem value="active" className="text-[10px]">Ativas</SelectItem>
                <SelectItem value="archived" className="text-[10px]">Arquivadas</SelectItem>
                <SelectItem value="all" className="text-[10px]">Todas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
      <Card className="shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-[10px]">
                  <div className="flex items-center gap-2">
                      #
                       <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleAllTopics} disabled={parentInitiativeIds.size === 0}>
                          <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                  </div>
              </TableHead>
              <TableHead className="w-[17.5%] text-[10px]">Título da Iniciativa</TableHead>
              { hasAuc && <TableHead className="text-[10px]">AUC</TableHead> }
              <TableHead className="w-32 text-[10px]">Responsável</TableHead>
              <TableHead className="w-32 text-[10px]">Status</TableHead>
              <TableHead className="w-32 text-[10px]">Progresso</TableHead>
              {monthHeaders.map((month, index) => (
                <TableHead 
                  key={index} 
                  colSpan={month.colSpan} 
                  className="text-center text-[10px] font-semibold whitespace-nowrap"
                  style={{ padding: '0 1px' }}
                >
                  {month.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        <TableBody>
          {filteredInitiatives.length > 0 ? (
            filteredInitiatives.map((initiative: Initiative) => {
              const StatusIcon = STATUS_ICONS[initiative.status];
              const hasSubItems = initiative.subItems && initiative.subItems.length > 0;
              const isExpanded = expandedTopics.has(initiative.id);
              const isArchivable = initiative.status === 'Concluído' || initiative.status === 'Suspenso';

              return (
                <React.Fragment key={initiative.id}>
                <TableRow className={cn(initiative.archived && 'bg-muted/30 text-muted-foreground hover:bg-muted/50')}>
                  <TableCell className="font-medium text-[10px] w-12">
                      <div className="flex items-center gap-1">
                       {initiative.topicNumber}
                      </div>
                  </TableCell>
                  <TableCell className="font-medium font-body w-[17.5%]">
                     <div className="flex items-start gap-1">
                        {hasSubItems && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 -ml-2 flex-shrink-0" onClick={(e) => {
                            e.stopPropagation();
                            toggleTopic(initiative.id);
                          }}>
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        )}
                        <span 
                          className={cn("cursor-pointer text-current text-[10px] hover:underline whitespace-normal break-words")} 
                          onClick={() => onInitiativeClick(initiative)}
                        >
                          {initiative.title}
                       </span>
                     </div>
                  </TableCell>
                  {hasAuc && (
                    <TableCell className="text-[10px]">
                      {initiative.auc ? (
                         <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground"/>
                            {initiative.auc.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                         </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="font-body text-current text-[10px] w-32">{initiative.owner}</TableCell>
                  <TableCell className="text-[10px] w-32">
                    {onStatusChange ? (
                      <Select 
                        value={initiative.status} 
                        onValueChange={(newStatus: InitiativeStatus) => onStatusChange(initiative.id, newStatus)}
                      >
                        <SelectTrigger className="h-8 text-[10px] px-2 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-[10px]">
                          <SelectItem value="Pendente" className="text-[10px]">Pendente</SelectItem>
                          <SelectItem value="Em execução" className="text-[10px]">Em execução</SelectItem>
                          <SelectItem value="Concluído" className="text-[10px]">Concluído</SelectItem>
                          <SelectItem value="Suspenso" className="text-[10px]">Suspenso</SelectItem>
                          <SelectItem value="A Fazer" className="text-[10px]">A Fazer</SelectItem>
                          <SelectItem value="Em Dia" className="text-[10px]">Em Dia</SelectItem>
                          <SelectItem value="Em Risco" className="text-[10px]">Em Risco</SelectItem>
                          <SelectItem value="Atrasado" className="text-[10px]">Atrasado</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={initiative.archived ? 'outline' : initiative.status === 'Concluído' ? 'default' : initiative.status === 'Em Risco' || initiative.status === 'Atrasado' ? 'destructive' : 'secondary'} className="capitalize flex items-center w-fit text-[10px]">
                        {StatusIcon && <StatusIcon className="mr-1.5 h-3.5 w-3.5" />}
                        {initiative.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-[10px] w-32">
                    <div className="flex items-center gap-2">
                      <Progress value={initiative.progress} className="w-24 h-2" aria-label={`Progresso de ${initiative.title}`} />
                      <span className="text-current">{initiative.progress}%</span>
                    </div>
                  </TableCell>
                  {dateHeaders.map((day, dayIndex) => {
                    const { startDate, endDate } = getInitiativeDates(initiative);
                    const isInRange = !initiative.archived && isWithinInterval(day, { start: startDate, end: endDate });
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isTodayMarker = isToday(day);
                    const isOverdue = initiative.deadline && isBefore(parseISO(initiative.deadline), startOfDay(new Date())) && initiative.status !== 'Concluído';

                    return (
                      <TableCell 
                        key={dayIndex} 
                        className={cn("relative", isWeekend && "bg-muted/50", isTodayMarker && "bg-red-100/50 dark:bg-red-900/20")}
                        style={{ 
                          width: '1px', 
                          minWidth: '1px', 
                          maxWidth: '1px',
                          padding: '0',
                          margin: '0',
                          border: 'none'
                        }}
                      >
                        {isTodayMarker && <div className="absolute inset-y-0 left-0 w-px bg-red-500"></div>}
                        {isInRange && (
                          <div 
                            className={cn("h-full w-full opacity-70", isOverdue ? "bg-red-800" : "bg-blue-800")} 
                            title={`${initiative.title}: ${format(startDate, 'dd/MM')} - ${format(endDate, 'dd/MM')}`}
                          >
                            &nbsp;
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
                 {isExpanded && hasSubItems && initiative.subItems.map(subItem => {
                   const { startDate, endDate } = getSubItemDates(initiative, subItem);
                   return (
                    <TableRow key={subItem.id} className="bg-secondary hover:bg-secondary/80">
                      <TableCell></TableCell>
                      <TableCell className="pl-12">
                         <div className="flex items-center gap-2">
                              <CornerDownRight className="h-4 w-4 text-muted-foreground" />
                              <Checkbox 
                                  id={`subitem-${subItem.id}`} 
                                  checked={subItem.completed}
                                  onCheckedChange={(checked) => updateSubItem(initiative.id, subItem.id, !!checked)}
                              />
                              <label htmlFor={`subitem-${subItem.id}`} className={cn("text-[10px]", subItem.completed && "line-through text-muted-foreground")}>
                                {subItem.title}
                              </label>
                         </div>
                      </TableCell>
                      {hasAuc && <TableCell></TableCell>}
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      {dateHeaders.map((day, dayIndex) => {
                        const isInRange = !initiative.archived && isWithinInterval(day, { start: startDate, end: endDate });
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                        const isTodayMarker = isToday(day);
                        const isOverdue = subItem.deadline && isBefore(parseISO(subItem.deadline), startOfDay(new Date())) && !subItem.completed;

                        return (
                          <TableCell 
                            key={dayIndex} 
                            className={cn("relative", isWeekend && "bg-muted/50", isTodayMarker && "bg-red-100/50 dark:bg-red-900/20")}
                            style={{ 
                              width: '1px', 
                              minWidth: '1px', 
                              maxWidth: '1px',
                              padding: '0',
                              margin: '0',
                              border: 'none'
                            }}
                          >
                            {isTodayMarker && <div className="absolute inset-y-0 left-0 w-px bg-red-500"></div>}
                            {isInRange && (
                              <div 
                                className={cn("h-full w-full opacity-70", isOverdue ? "bg-red-400" : "bg-blue-400")} 
                                title={`${subItem.title}: ${format(startDate, 'dd/MM')} - ${format(endDate, 'dd/MM')}`}
                              >
                                &nbsp;
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                   );
                 })}
                </React.Fragment>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={(hasAuc ? 6 : 5) + dateHeaders.length} className="text-center h-48">
                <p className="text-muted-foreground text-[10px]">Nenhuma iniciativa encontrada.</p>
                <p className="text-muted-foreground text-[10px] mt-1">Tente ajustar sua busca ou filtros.</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
    </div>
  );
}
