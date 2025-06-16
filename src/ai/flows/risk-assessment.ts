'use server';

/**
 * @fileOverview An AI agent that analyzes project data from Focalboard boards to identify potential risks and delays.
 *
 * - riskAssessment - A function that handles the risk assessment process.
 * - RiskAssessmentInput - The input type for the riskAssessment function.
 * - RiskAssessmentOutput - The return type for the riskAssessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RiskAssessmentInputSchema = z.object({
  boardData: z.string().describe('Project data from Focalboard boards.'),
});
export type RiskAssessmentInput = z.infer<typeof RiskAssessmentInputSchema>;

const RiskAssessmentOutputSchema = z.object({
  risks: z
    .array(z.string())
    .describe('List of potential risks and delays identified in the project data.'),
  summary: z.string().describe('A summary of the risk assessment.'),
});
export type RiskAssessmentOutput = z.infer<typeof RiskAssessmentOutputSchema>;

export async function riskAssessment(input: RiskAssessmentInput): Promise<RiskAssessmentOutput> {
  return riskAssessmentFlow(input);
}

const riskAssessmentPrompt = ai.definePrompt({
  name: 'riskAssessmentPrompt',
  input: {schema: RiskAssessmentInputSchema},
  output: {schema: RiskAssessmentOutputSchema},
  prompt: `You are an AI expert in project management. Analyze the following project data from Focalboard boards to identify potential risks and delays. Provide a summary of the risk assessment and a list of potential risks and delays.

Project Data:
{{{boardData}}}`,
});

const riskAssessmentFlow = ai.defineFlow(
  {
    name: 'riskAssessmentFlow',
    inputSchema: RiskAssessmentInputSchema,
    outputSchema: RiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await riskAssessmentPrompt(input);
    return output!;
  }
);
