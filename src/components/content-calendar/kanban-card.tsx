
"use client";

import type { ContentItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDrag } from 'react-dnd';
import { Target, MessageSquare, Newspaper, Mic } from "lucide-react";

interface ContentKanbanCardProps {
  item: ContentItem;
}

const TAG_COLORS: Record<string, string> = {
    "WEBSITE": "bg-orange-200 text-orange-800",
    "BLOG": "bg-green-200 text-green-800",
    "EMAIL": "bg-red-200 text-red-800",
    "TWITTER": "bg-blue-200 text-blue-800",
    "PRESS-RELEASE": "bg-purple-200 text-purple-800",
};

const ICON_MAP: Record<string, React.ElementType> = {
    "target": Target,
    "tweet": MessageSquare,
    "news": Newspaper,
    "podcast": Mic,
};


export function ContentKanbanCard({ item }: ContentKanbanCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'content-item',
    item: { id: item.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const Icon = item.icon ? ICON_MAP[item.icon] : null;

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 bg-card border-border cursor-grab">
            <CardContent className="p-3 space-y-2">
                <div className="flex items-start space-x-2">
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />}
                    <h4 className="text-sm font-medium text-card-foreground flex-grow" title={item.title}>
                        {item.title}
                    </h4>
                </div>
                
                {item.tags && item.tags.length > 0 && (
                     <div className="flex flex-wrap gap-1">
                        {item.tags.map(tag => (
                            <Badge key={tag} variant="outline" className={cn("text-xs px-1.5 py-0.5 font-normal", TAG_COLORS[tag] || 'bg-gray-200 text-gray-800')}>
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
