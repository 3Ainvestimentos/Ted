'use server';

/**
 * @fileOverview Agente de IA que gera atas de reunião estruturadas a partir de atualizações de cartões e discussões.
 *
 * - generateMeetingMinutes - Uma função para gerar atas de reunião.
 * - MeetingMinutesInput - O tipo de entrada para a função generateMeetingMinutes.
 * - MeetingMinutesOutput - O tipo de retorno para a função generateMeetingMinutes.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MeetingMinutesInputSchema = z.object({
  cardUpdates: z
    .string()
    .describe('Um resumo das atualizações dos cartões discutidos durante a reunião.'),
  discussionSummary: z
    .string()
    .describe('Um resumo das discussões ocorridas durante a reunião.'),
});
export type MeetingMinutesInput = z.infer<typeof MeetingMinutesInputSchema>;

const MeetingMinutesOutputSchema = z.object({
  minutes: z.string().describe('Atas de reunião estruturadas geradas pela IA.'),
});
export type MeetingMinutesOutput = z.infer<typeof MeetingMinutesOutputSchema>;

export async function generateMeetingMinutes(
  input: MeetingMinutesInput
): Promise<MeetingMinutesOutput> {
  return generateMeetingMinutesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'meetingMinutesPrompt',
  input: {schema: MeetingMinutesInputSchema},
  output: {schema: MeetingMinutesOutputSchema},
  prompt: `You are an AI assistant specializing in generating structured meeting minutes.
  Based on the card updates and discussion summaries provided, create detailed and well-organized meeting minutes.

  Card Updates: {{{cardUpdates}}}
  Discussion Summary: {{{discussionSummary}}}

  Meeting Minutes:
`,
});

const generateMeetingMinutesFlow = ai.defineFlow(
  {
    name: 'generateMeetingMinutesFlow',
    inputSchema: MeetingMinutesInputSchema,
    outputSchema: MeetingMinutesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
