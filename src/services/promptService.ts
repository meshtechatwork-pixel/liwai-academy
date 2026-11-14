import { PromptGeneratorRequest, PromptGeneratorResponse } from '../types/learning';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export async function generateStructuredPrompt(
  payload: PromptGeneratorRequest,
): Promise<PromptGeneratorResponse> {
  const response = await fetch(`${API_BASE}/api/prompts/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      'The AI Prompt Generator backend API is unavailable on static hosting. Open the full-stack Learn It With AI app URL or configure VITE_API_BASE_URL.',
    );
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate structured prompt.');
  }

  return data as PromptGeneratorResponse;
}
