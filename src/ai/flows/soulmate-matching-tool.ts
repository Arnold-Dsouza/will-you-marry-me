'use server';
/**
 * @fileOverview A GenAI flow for suggesting compatible partners based on spiritual compatibility, values, and lifestyle preferences.
 *
 * - soulmateMatchingTool - A function that handles the soulmate matching process.
 * - SoulmateMatchingToolInput - The input type for the soulmateMatchingTool function.
 * - SoulmateMatchingToolOutput - The return type for the soulmateMatchingTool function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Defines the input schema for the soulmate matching tool, including spiritual compatibility, values, and lifestyle preferences.
 */
const SoulmateMatchingToolInputSchema = z.object({
  spiritualCompatibility: z
    .string()
    .describe(
      "A detailed description of the user's spiritual preferences, including denomination, church involvement, and faith journey details."
    ),
  values: z
    .string()
    .describe("A description of the user's core values and what they look for in a partner."),
  lifestylePreferences: z
    .string()
    .describe(
      "A description of the user's lifestyle, including hobbies, social life, career aspirations, and family goals."
    ),
});
export type SoulmateMatchingToolInput = z.infer<typeof SoulmateMatchingToolInputSchema>;

/**
 * Defines the schema for a single suggested partner, including name, compatibility score, reasoning, and profile summary.
 */
const SuggestedPartnerSchema = z.object({
  name: z.string().describe("The name of the suggested partner."),
  compatibilityScore: z
    .number()
    .int()
    .min(1)
    .max(100)
    .describe(
      "A compatibility score (1-100) indicating how well this partner aligns with the user's preferences."
    ),
  reasoning: z
    .string()
    .describe(
      "A detailed explanation of why this partner is compatible with the user, referencing their stated preferences."
    ),
  profileSummary: z
    .string()
    .describe("A brief summary of the suggested partner's key characteristics and interests."),
});

/**
 * Defines the output schema for the soulmate matching tool, which is an array of suggested partners.
 */
const SoulmateMatchingToolOutputSchema = z.object({
  suggestedPartners: z
    .array(SuggestedPartnerSchema)
    .min(1)
    .max(3)
    .describe('An array of 1 to 3 suggested compatible partners.'),
});
export type SoulmateMatchingToolOutput = z.infer<typeof SoulmateMatchingToolOutputSchema>;

/**
 * A wrapper function that executes the Genkit flow for soulmate matching.
 * @param input The user's preferences for spiritual compatibility, values, and lifestyle.
 * @returns A promise that resolves to an array of suggested compatible partners.
 */
export async function soulmateMatchingTool(
  input: SoulmateMatchingToolInput
): Promise<SoulmateMatchingToolOutput> {
  return soulmateMatchingToolFlow(input);
}

/**
 * Defines the Genkit prompt for generating compatible partner suggestions.
 */
const soulmateMatchingPrompt = ai.definePrompt({
  name: 'soulmateMatchingPrompt',
  input: {schema: SoulmateMatchingToolInputSchema},
  output: {schema: SoulmateMatchingToolOutputSchema},
  prompt: `You are an advanced AI-powered Christian dating assistant for the "Will You Marry Me" platform. Your task is to analyze a user's preferences and suggest highly compatible hypothetical partners.

The user has provided the following preferences:

Spiritual Compatibility: {{{spiritualCompatibility}}}
Values: {{{values}}}
Lifestyle Preferences: {{{lifestylePreferences}}}

Based on these details, generate 2-3 unique and highly compatible partner profiles. For each suggested partner, provide a name, a compatibility score (1-100), a detailed reasoning explaining the compatibility with the user's preferences, and a brief profile summary. Ensure the suggestions are diverse yet strongly align with the user's Christian beliefs and values.

Format your output strictly as a JSON object matching the provided output schema.`,
});

/**
 * Defines the Genkit flow for the soulmate matching tool.
 * It takes user preferences as input and returns suggested partners.
 */
const soulmateMatchingToolFlow = ai.defineFlow(
  {
    name: 'soulmateMatchingToolFlow',
    inputSchema: SoulmateMatchingToolInputSchema,
    outputSchema: SoulmateMatchingToolOutputSchema,
  },
  async (input) => {
    const {output} = await soulmateMatchingPrompt(input);
    if (!output) {
      throw new Error('Failed to generate soulmate suggestions.');
    }
    return output;
  }
);
