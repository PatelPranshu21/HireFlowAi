import { AIProviderConfig } from '../types';

/**
 * AI Provider Abstraction Layer
 * Abstracts AI model calls so HireFlow AI can easily switch between:
 * - Google Gemini (default)
 * - OpenAI
 * - Claude (Anthropic)
 * - Azure OpenAI
 * - Local LLMs (Ollama / LocalAI)
 */

export class AiProviderService {
  private static config: AIProviderConfig = {
    provider: 'gemini',
    modelName: 'gemini-3.6-flash',
    isCustomKeySet: false
  };

  public static setConfig(newConfig: Partial<AIProviderConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public static getConfig(): AIProviderConfig {
    return this.config;
  }

  /**
   * Generic prompt runner through configured provider backend API
   */
  public static async generateContent(prompt: string, systemInstruction?: string): Promise<string> {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          providerConfig: this.config,
          systemInstruction
        })
      });
      if (!res.ok) throw new Error(`AI Provider HTTP Error: ${res.status}`);
      const data = await res.json();
      return data.reply || data.text || '';
    } catch (err) {
      console.warn('AI Provider fallback triggered:', err);
      return 'AI Career System actively monitoring and synchronizing user metrics across all modules.';
    }
  }

  /**
   * Analyzes resume text against target role
   */
  public static async analyzeResume(resumeText: string, targetRole: string) {
    try {
      const res = await fetch('/api/ai/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, targetRole, providerConfig: this.config })
      });
      if (!res.ok) throw new Error('Resume Analysis API error');
      return await res.json();
    } catch (err) {
      console.error('Error analyzing resume:', err);
      return null;
    }
  }

  /**
   * Evaluates job match score and missing skills
   */
  public static async matchJob(resumeText: string, jobDescription: string, jobTitle: string, company: string) {
    try {
      const res = await fetch('/api/ai/match-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription, jobTitle, company, providerConfig: this.config })
      });
      if (!res.ok) throw new Error('Job Match API error');
      return await res.json();
    } catch (err) {
      console.error('Error matching job:', err);
      return null;
    }
  }

  /**
   * Parses raw resume text into structured fields
   */
  public static async parseResume(resumeText: string) {
    try {
      const res = await fetch('/api/ai/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, providerConfig: this.config })
      });
      if (!res.ok) throw new Error('Resume Parse API error');
      return await res.json();
    } catch (err) {
      console.error('Error parsing resume:', err);
      return null;
    }
  }

  /**
   * Tailors a resume for a specific job description
   */
  public static async tailorResume(resumeContent: string, jobDescription: string, targetRole: string, company: string) {
    try {
      const res = await fetch('/api/ai/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent, jobDescription, targetRole, company, providerConfig: this.config })
      });
      if (!res.ok) throw new Error('Tailor Resume API error');
      return await res.json();
    } catch (err) {
      console.error('Error tailoring resume:', err);
      return null;
    }
  }
}
