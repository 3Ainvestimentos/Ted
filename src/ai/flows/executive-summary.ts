'use server';

/**
 * @fileOverview Gera sumários executivos do progresso do projeto e métricas chave.
 *
 * - generateExecutiveSummary - Uma função que gera um sumário executivo.
 * - ExecutiveSummaryInput - O tipo de entrada para a função generateExecutiveSummary.
 * - ExecutiveSummaryOutput - O tipo de retorno para a função generateExecutiveSummary.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExecutiveSummaryInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('Uma descrição do projeto a ser resumido.'),
  keyMetrics: z.string().describe('Métricas chave do projeto.'),
  progressDetails: z.string().describe('Detalhes do progresso do projeto.'),
});

export type ExecutiveSummaryInput = z.infer<typeof ExecutiveSummaryInputSchema>;

const ExecutiveSummaryOutputSchema = z.object({
  executiveSummary: z
    .string()
    .describe('Um sumário executivo conciso do projeto.'),
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
