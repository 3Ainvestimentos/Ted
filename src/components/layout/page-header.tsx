
"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
}

export function PageHeader({ title, description, className, children, ...props }: PageHeaderProps) {
    return (
        <div className={cn("space-y-2", className)} {...props}>
            <h1 className="font-headline text-3xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
            {children}
        </div>
    );
}
