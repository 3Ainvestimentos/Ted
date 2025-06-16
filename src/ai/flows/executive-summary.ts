'use server';

/**
 * @fileOverview Generates executive summaries of project progress and key metrics.
 *
 * - generateExecutiveSummary - A function that generates an executive summary.
 * - ExecutiveSummaryInput - The input type for the generateExecutiveSummary function.
 * - ExecutiveSummaryOutput - The return type for the generateExecutiveSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExecutiveSummaryInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('A description of the project to be summarized.'),
  keyMetrics: z.string().describe('Key metrics of the project.'),
  progressDetails: z.string().describe('Details of the project progress.'),
});

export type ExecutiveSummaryInput = z.infer<typeof ExecutiveSummaryInputSchema>;

const ExecutiveSummaryOutputSchema = z.object({
  executiveSummary: z
    .string()
    .describe('A concise executive summary of the project.'),
});

export type ExecutiveSummaryOutput = z.infer<typeof ExecutiveSummaryOutputSchema>;

export async function generateExecutiveSummary(
  input: ExecutiveSummaryInput
): Promise<ExecutiveSummaryOutput> {
  return executiveSummaryFlow(input);
}

const executiveSummaryPrompt = ai.definePrompt({
  name: 'executiveSummaryPrompt',
  input: {schema: ExecutiveSummaryInputSchema},
  output: {schema: ExecutiveSummaryOutputSchema},
  prompt: `You are an AI assistant designed to generate executive summaries of projects.

  Based on the following project description, key metrics, and progress details, create a concise executive summary that highlights the project's status and key accomplishments.

  Project Description: {{{projectDescription}}}
  Key Metrics: {{{keyMetrics}}}
  Progress Details: {{{progressDetails}}}

  Executive Summary:`,
});

const executiveSummaryFlow = ai.defineFlow(
  {
    name: 'executiveSummaryFlow',
    inputSchema: ExecutiveSummaryInputSchema,
    outputSchema: ExecutiveSummaryOutputSchema,
  },
  async input => {
    const {output} = await executiveSummaryPrompt(input);
    return output!;
  }
);
