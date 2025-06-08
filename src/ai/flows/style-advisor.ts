'use server';

/**
 * @fileOverview Provides AI-driven style suggestions based on user input.
 *
 * - getStyleRecommendations - A function that generates accessory recommendations.
 * - StyleAdvisorInput - The input type for the getStyleRecommendations function.
 * - StyleAdvisorOutput - The return type for the getStyleRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleAdvisorInputSchema = z.object({
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of the outfit, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  occasion: z.string().optional().describe('The occasion for which the accessories are needed.'),
  preferences: z.string().optional().describe('The user preferences for accessories.'),
});
export type StyleAdvisorInput = z.infer<typeof StyleAdvisorInputSchema>;

const StyleAdvisorOutputSchema = z.object({
  recommendations: z.array(
    z.string().describe('Accessory recommendations that match the outfit and occasion.')
  ).describe('A list of recommended accessories.'),
  reasoning: z.string().describe('The AI reasoning behind the recommendations.'),
});
export type StyleAdvisorOutput = z.infer<typeof StyleAdvisorOutputSchema>;

export async function getStyleRecommendations(input: StyleAdvisorInput): Promise<StyleAdvisorOutput> {
  return styleAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleAdvisorPrompt',
  input: {schema: StyleAdvisorInputSchema},
  output: {schema: StyleAdvisorOutputSchema},
  prompt: `You are a personal style advisor, recommending accessories based on user input.

  Consider the user's outfit (if provided as a photo), the occasion, and any stated preferences to recommend the perfect accessories.

  Output the recommendations as a list of strings, and include a brief explanation of your reasoning.

  {{#if photoDataUri}}
  Outfit Photo: {{media url=photoDataUri}}
  {{/if}}

  {{#if occasion}}
  Occasion: {{occasion}}
  {{/if}}

  {{#if preferences}}
  User Preferences: {{preferences}}
  {{/if}}
  `,
});

const styleAdvisorFlow = ai.defineFlow(
  {
    name: 'styleAdvisorFlow',
    inputSchema: StyleAdvisorInputSchema,
    outputSchema: StyleAdvisorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
