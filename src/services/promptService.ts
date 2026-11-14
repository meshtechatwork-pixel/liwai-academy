import { PromptGeneratorRequest, PromptGeneratorResponse } from '../types/learning';

export async function generateStructuredPrompt(
  payload: PromptGeneratorRequest,
): Promise<PromptGeneratorResponse> {
  const response = await fetch('/api/prompts/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate structured prompt.');
  }

  return data as PromptGeneratorResponse;
}
