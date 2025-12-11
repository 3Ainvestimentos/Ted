
"use client";

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';

interface GanttTimelineProps {
    months: { name: string, days: number }[];
    totalDays: number;
}

export function GanttTimeline({ months, totalDays }: GanttTimelineProps) {
    return (
        <Card className="border-b-0 rounded-none rounded-tr-lg">
            <CardContent className="p-0 flex">
                {months.map((month, index) => {
                    const widthPercentage = (month.days / totalDays) * 100;
                    return (
                        <div 
                            key={index}
                            className="text-center text-xs font-semibold py-2 border-r"
                            style={{ width: `${widthPercentage}%` }}
                        >
                            {month.name}
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    );
}
