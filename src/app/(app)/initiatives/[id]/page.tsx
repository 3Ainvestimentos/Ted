"use client";

import { useParams } from 'next/navigation';
import { MOCK_INITIATIVES, STATUS_ICONS, TREND_ICONS } from '@/lib/constants';
import type { Initiative } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit3, MessageSquare, Paperclip, Users, CalendarDays, BarChart3 } from 'lucide-react';
import Image from 'next/image';

export default function InitiativeDossierPage() {
  const params = useParams();
  const id = params.id as string;

  // In a real app, you'd fetch this data.
  const initiative = MOCK_INITIATIVES.find(init => init.id === id);

  if (!initiative) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <h1 className="text-2xl font-semibold">Initiative not found</h1>
        <Button asChild variant="link" className="mt-4">
          <Link href="/initiatives">Go back to initiatives</Link>
        </Button>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[initiative.status];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/initiatives">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Initiatives
          </Link>
        </Button>
        <Button size="sm">
          <Edit3 className="mr-2 h-4 w-4" /> Edit Initiative
        </Button>
      </div>

      <Card className="shadow-xl overflow-hidden">
        <div className="relative h-48 w-full">
          <Image 
            src={`https://placehold.co/1200x300.png`} // Placeholder image, could be dynamic
            alt={`${initiative.title} banner`}
            layout="fill"
            objectFit="cover"
            data-ai-hint="project banner"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <CardTitle className="text-3xl font-headline text-white">{initiative.title}</CardTitle>
            <div className="mt-1">
              <Badge variant={initiative.status === 'Completed' ? 'default' : initiative.status === 'At Risk' || initiative.status === 'Delayed' ? 'destructive' : 'secondary'} className="capitalize bg-opacity-80 backdrop-blur-sm">
                <StatusIcon className="mr-1 h-4 w-4" />
                {initiative.status}
              </Badge>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <section>
              <h3 className="text-xl font-semibold mb-2 text-foreground/90">Description</h3>
              <p className="text-foreground/80 whitespace-pre-line">{initiative.description}</p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2 text-foreground/90">Progress</h3>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-medium">{initiative.progress}%</span>
              </div>
              <Progress value={initiative.progress} aria-label={`${initiative.title} progress ${initiative.progress}%`} className="h-3"/>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2 text-foreground/90">Key Metrics</h3>
              {initiative.keyMetrics.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {initiative.keyMetrics.map(metric => {
                    const TrendIcon = TREND_ICONS[metric.trend];
                    return (
                      <Card key={metric.name} className="bg-secondary/50">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-xs">{metric.name}</CardDescription>
                          <CardTitle className="text-2xl">{metric.value}</CardTitle>
                        </CardHeader>
                        <CardFooter>
                           <TrendIcon className={`h-4 w-4 mr-1 ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : ''}`} />
                           <p className="text-xs text-muted-foreground">{metric.trend === 'up' ? 'Improving' : metric.trend === 'down' ? 'Declining' : 'Stable'}</p>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                 <p className="text-sm text-muted-foreground">No key metrics defined for this initiative.</p>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <Card className="bg-secondary/30">
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong className="text-foreground/80">Owner:</strong> {initiative.owner}</p>
                <p><strong className="text-foreground/80">Last Update:</strong> {new Date(initiative.lastUpdate).toLocaleDateString()}</p>
                {/* Add more details if available, e.g. start/end dates, budget */}
                 <p><strong className="text-foreground/80">Team Members:</strong> <span className="text-muted-foreground">John D., Jane S., Mike L.</span></p>
                 <p><strong className="text-foreground/80">Target Completion:</strong> <span className="text-muted-foreground">Dec 31, 2024</span></p>
              </CardContent>
            </Card>
            
            <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start"><Users className="mr-2 h-4 w-4" /> Team & Stakeholders</Button>
                <Button variant="outline" className="w-full justify-start"><BarChart3 className="mr-2 h-4 w-4" /> Detailed Reports</Button>
                <Button variant="outline" className="w-full justify-start"><Paperclip className="mr-2 h-4 w-4" /> Documents (3)</Button>
                <Button variant="outline" className="w-full justify-start"><MessageSquare className="mr-2 h-4 w-4" /> Discussions (12)</Button>
            </div>
          </aside>
        </CardContent>
      </Card>
    </div>
  );
}
