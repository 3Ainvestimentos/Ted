

"use client";

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { UserAuditSummaryData } from '@/types';
import { Skeleton } from '../ui/skeleton';
import { useAuditLog } from '@/contexts/audit-log-context';
import { format } from 'date-fns';

export function UserAuditSummary() {
    const { getLoginSummary, isLoadingSummary } = useAuditLog();
    const [summaryData, setSummaryData] = useState<UserAuditSummaryData[]>([]);

    useEffect(() => {
        const fetchSummary = async () => {
            const data = await getLoginSummary();
            setSummaryData(data);
        };
        fetchSummary();
    }, [getLoginSummary]);

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50%]">Usuário (Email)</TableHead>
                            <TableHead className="text-center">Quantidade de Acessos</TableHead>
                            <TableHead>Último Login</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingSummary ? (
                             [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-6 w-3/4" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-1/2 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-3/4" /></TableCell>
                                </TableRow>
                             ))
                        ) : summaryData.length > 0 ? (
                            summaryData.map((row) => (
                                <TableRow key={row.userEmail}>
                                    <TableCell className="font-medium">{row.userEmail}</TableCell>
                                    <TableCell className="text-center">{row.loginCount}</TableCell>
                                    <TableCell>{format(row.lastLogin, 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">Nenhum registro de login encontrado.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
