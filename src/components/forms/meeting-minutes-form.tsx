"use client";

import { useState }_ from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateMeetingMinutes } from "@/ai/flows/meeting-minutes";
import type { MeetingMinutesOutput } from "@/ai/flows/meeting-minutes";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  cardUpdates: z.string().min(30, "Card updates must be at least 30 characters.").max(3000, "Max 3000 characters."),
  discussionSummary: z.string().min(30, "Discussion summary must be at least 30 characters.").max(3000, "Max 3000 characters."),
});

export function MeetingMinutesForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MeetingMinutesOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      cardUpdates: "",
      discussionSummary: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const minutesResult = await generateMeetingMinutes(data);
      setResult(minutesResult);
    } catch (error) {
      console.error("Meeting minutes generation failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate meeting minutes. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">AI-Assisted Meeting Minutes</CardTitle>
          <CardDescription>
            Input summaries of card updates and discussions, and the AI will help structure your meeting minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="cardUpdates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Updates Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Summarize updates from Focalboard cards or tasks discussed. E.g., Task A: Completed by John. Task B: Blocked, needs input from Design. Task C: Progress 70%."
                        className="min-h-[150px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discussionSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discussion Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Summarize key discussion points, decisions made, and action items. E.g., Decision: Proceed with Option X. Action Item: Sarah to follow up on budget by EOD Friday."
                        className="min-h-[150px] resize-y"
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
                  "Generate Minutes"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-primary">Generated Meeting Minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap p-4 bg-secondary/30 rounded-md">
              {result.minutes}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
