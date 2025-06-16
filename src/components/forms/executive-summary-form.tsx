"use client";

import { useState }_ from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateExecutiveSummary } from "@/ai/flows/executive-summary";
import type { ExecutiveSummaryOutput } from "@/ai/flows/executive-summary";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  projectDescription: z.string().min(30, "Description must be at least 30 characters.").max(2000, "Max 2000 characters."),
  keyMetrics: z.string().min(20, "Key metrics must be at least 20 characters.").max(1000, "Max 1000 characters."),
  progressDetails: z.string().min(30, "Progress details must be at least 30 characters.").max(2000, "Max 2000 characters."),
});

export function ExecutiveSummaryForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExecutiveSummaryOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      projectDescription: "",
      keyMetrics: "",
      progressDetails: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const summaryResult = await generateExecutiveSummary(data);
      setResult(summaryResult);
    } catch (error) {
      console.error("Executive summary generation failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate executive summary. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">AI-Generated Executive Summaries</CardTitle>
          <CardDescription>
            Provide project details below, and the AI will generate a concise executive summary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="projectDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the project, its goals, and scope."
                        className="min-h-[100px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="keyMetrics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Metrics</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List key performance indicators (KPIs), targets, and current values. E.g., User Adoption: 75% (Target: 80%), Budget Spent: $50k/$70k."
                        className="min-h-[100px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="progressDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Summarize recent progress, milestones achieved, and any significant challenges or blockers."
                        className="min-h-[120px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Summary"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-primary">Generated Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap p-4 bg-secondary/30 rounded-md">
              {result.executiveSummary}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
