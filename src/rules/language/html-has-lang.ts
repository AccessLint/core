import type { Rule } from "../types";
import { getSelector, getHtmlSnippet } from "../utils/selector";
import { isAriaHidden } from "../utils/aria";

export const htmlHasLang: Rule = {
  id: "html-has-lang",
  wcag: ["3.1.1"],
  level: "A",
  description: "The <html> element must have a lang attribute.",
  guidance: "Screen readers use the lang attribute to determine which language rules and pronunciation to use. Without it, content may be mispronounced. Set lang to the primary language of the page (e.g., lang='en' for English, lang='es' for Spanish).",
  prompt:
    "Determine the page's primary language and suggest the appropriate lang value.",
  run(doc) {
    const html = doc.documentElement;
    if (!html.getAttribute("lang")?.trim()) {
      return [{
        ruleId: "html-has-lang",
        selector: getSelector(html),
        html: getHtmlSnippet(html),
        impact: "serious" as const,
        message: "<html> element missing lang attribute.",
      }];
    }
    return [];
  },
};

const VALID_LANG_RE = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i;

export const htmlLangValid: Rule = {
  id: "html-lang-valid",
  wcag: ["3.1.1"],
  level: "A",
  description: "The lang attribute on <html> must have a valid value.",
  guidance: "The lang attribute must use a valid BCP 47 language tag. Use a 2 or 3 letter language code (e.g., 'en', 'fr', 'zh'), optionally followed by a region code (e.g., 'en-US', 'pt-BR'). Invalid tags prevent screen readers from correctly pronouncing content.",
  prompt:
    "Suggest the correct BCP 47 language tag based on the invalid value provided.",
  run(doc) {
    const lang = doc.documentElement.getAttribute("lang")?.trim();
    if (lang && !VALID_LANG_RE.test(lang)) {
      return [{
        ruleId: "html-lang-valid",
        selector: "html",
        html: getHtmlSnippet(doc.documentElement),
        impact: "serious" as const,
        message: `Invalid lang attribute value "${lang}".`,
      }];
    }
    return [];
  },
};

export const validLang: Rule = {
  id: "valid-lang",
  wcag: ["3.1.2"],
  level: "AA",
  description: "The lang attribute must have a valid value on all elements.",
  guidance: "When content in a different language appears within a page (e.g., a French quote in an English document), wrap it with a lang attribute to ensure correct pronunciation. The lang value must be a valid BCP 47 tag. Common codes: en, es, fr, de, zh, ja, pt, ar, ru.",
  prompt:
    "Identify the content's language and suggest the correct BCP 47 tag.",
  run(doc) {
    const violations = [];

    for (const el of doc.querySelectorAll("[lang]")) {
      if (isAriaHidden(el)) continue;
      if (el === doc.documentElement) continue; // Handled by html-lang-valid

      const lang = el.getAttribute("lang")?.trim();
      if (lang && !VALID_LANG_RE.test(lang)) {
        violations.push({
          ruleId: "valid-lang",
          selector: getSelector(el),
          html: getHtmlSnippet(el),
          impact: "serious" as const,
          message: `Invalid lang attribute value "${lang}".`,
        });
      }
    }

    return violations;
  },
};

export const htmlXmlLangMismatch: Rule = {
  id: "html-xml-lang-mismatch",
  wcag: ["3.1.1"],
  level: "A",
  description: "The lang and xml:lang attributes on <html> must match.",
  guidance: "In XHTML documents, if both lang and xml:lang are present, they must specify the same base language. Mismatched values confuse assistive technologies. Either remove xml:lang (preferred for HTML5) or ensure both attributes have identical values.",
  prompt:
    "Explain whether to remove xml:lang or align it with the lang value.",
  run(doc) {
    const html = doc.documentElement;
    const lang = html.getAttribute("lang")?.trim().toLowerCase();
    const xmlLang = html.getAttribute("xml:lang")?.trim().toLowerCase();

    if (lang && xmlLang) {
      // Extract primary language subtag for comparison
      const langPrimary = lang.split("-")[0];
      const xmlLangPrimary = xmlLang.split("-")[0];

      if (langPrimary !== xmlLangPrimary) {
        return [{
          ruleId: "html-xml-lang-mismatch",
          selector: "html",
          html: getHtmlSnippet(html),
          impact: "moderate" as const,
          message: `lang="${lang}" and xml:lang="${xmlLang}" do not match.`,
        }];
      }
    }

    return [];
  },
};
