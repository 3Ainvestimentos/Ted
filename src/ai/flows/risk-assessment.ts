'use server';

/**
 * @fileOverview Um agente de IA que analisa dados de projeto de quadros Focalboard para identificar riscos e atrasos potenciais.
 *
 * - riskAssessment - Uma função que lida com o processo de análise de risco.
 * - RiskAssessmentInput - O tipo de entrada para a função riskAssessment.
 * - RiskAssessmentOutput - O tipo de retorno para a função riskAssessment.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RiskAssessmentInputSchema = z.object({
  boardData: z.string().describe('Dados do projeto de quadros Focalboard.'),
});
export type RiskAssessmentInput = z.infer<typeof RiskAssessmentInputSchema>;

const RiskAssessmentOutputSchema = z.object({
  risks: z
    .array(z.string())
    .describe('Lista de riscos e atrasos potenciais identificados nos dados do projeto.'),
  summary: z.string().describe('Um resumo da análise de risco.'),
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
