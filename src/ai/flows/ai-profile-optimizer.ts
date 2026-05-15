'use server';
/**
 * @fileOverview An AI agent that optimizes user profiles for a Christian matrimonial site.
 *
 * - optimizeProfile - A function that optimizes a user's bio for the matrimonial site.
 * - AIProfileOptimizerInput - The input type for the optimizeProfile function.
 * - AIProfileOptimizerOutput - The return type for the optimizeProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIProfileOptimizerInputSchema = z.object({
  rawBio: z
    .string()
    .describe("The user's current bio or a draft they want to optimize."),
  faithDetails: z
    .string()
    .describe(
      'Details about the user\'s denomination, church involvement, and faith journey.'
    ),
  personalityTraits: z
    .array(z.string())
    .describe('A list of personality traits the user wants to emphasize.'),
  targetAudienceDescription: z
    .string()
    .optional()
    .describe(
      'An optional description of the type of person the user wants to attract.'
    ),
});
export type AIProfileOptimizerInput = z.infer<
  typeof AIProfileOptimizerInputSchema
>;

const AIProfileOptimizerOutputSchema = z.object({
  optimizedBio: z
    .string()
    .describe('The AI-generated, compelling, and authentic bio.'),
  improvementSuggestions: z
    .array(z.string())
    .describe(
      'Suggestions for further improvements or additional details the user might consider adding to their profile.'
    ),
});
export type AIProfileOptimizerOutput = z.infer<
  typeof AIProfileOptimizerOutputSchema
>;

export async function optimizeProfile(
  input: AIProfileOptimizerInput
): Promise<AIProfileOptimizerOutput> {
  return aiProfileOptimizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiProfileOptimizerPrompt',
  input: {schema: AIProfileOptimizerInputSchema},
  output: {schema: AIProfileOptimizerOutputSchema},
  prompt: `You are an AI profile optimizer specializing in creating compelling and authentic biographies for a Christian matrimonial website called "Will You Marry Me". Your goal is to help users present themselves effectively, highlighting their deep faith and unique personality, to attract suitable matches.

Optimize the following user information into a captivating bio. Focus on making the bio sound genuine, spiritually grounded, and personally engaging.

User's Current Bio Draft:
{{{rawBio}}}

Details about their faith journey, denomination, and church involvement:
{{{faithDetails}}}

Key personality traits to emphasize:
{{#each personalityTraits}}- {{{this}}}
{{/each}}

{{#if targetAudienceDescription}}
The user is looking to attract someone who matches this description:
{{{targetAudienceDescription}}}
{{/if}}

Please craft an optimized bio and provide any additional suggestions for improving their overall profile.

Output must be in JSON format, matching the output schema.`,
});

const aiProfileOptimizerFlow = ai.defineFlow(
  {
    name: 'aiProfileOptimizerFlow',
    inputSchema: AIProfileOptimizerInputSchema,
    outputSchema: AIProfileOptimizerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
