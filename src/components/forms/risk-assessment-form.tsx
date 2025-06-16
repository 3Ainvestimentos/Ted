"use client";

import { useState }_ from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { riskAssessment } from "@/ai/flows/risk-assessment";
import type { RiskAssessmentOutput } from "@/ai/flows/risk-assessment";
import { Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  boardData: z.string().min(50, {
    message: "Project data must be at least 50 characters.",
  }).max(5000, {
    message: "Project data must not exceed 5000 characters."
  }),
});

export function RiskAssessmentForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RiskAssessmentOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      boardData: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const assessmentResult = await riskAssessment({ boardData: data.boardData });
      setResult(assessmentResult);
    } catch (error) {
      console.error("Risk assessment failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to perform risk assessment. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">AI-Powered Risk Assessment</CardTitle>
          <CardDescription>
            Paste your project data (e.g., from Focalboard, task lists, or project updates) below. 
            The AI will analyze it to identify potential risks and delays.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="boardData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Data</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste all relevant project information here. Include task statuses, deadlines, team member concerns, resource allocation, etc."
                        className="min-h-[200px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide as much detail as possible for an accurate assessment. (Min 50, Max 5000 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Assess Risks"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-primary">Assessment Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap">{result.summary}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Potential Risks & Delays</h3>
              {result.risks.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {result.risks.map((risk, index) => (
                    <li key={index} className="text-sm text-foreground/90 flex items-start">
                       <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-destructive flex-shrink-0" />
                       <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No specific risks identified based on the provided data.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
