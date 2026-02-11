export interface RuleTranslation {
  description: string;
  guidance?: string;
}

export type LocaleMap = Record<string, RuleTranslation>;
