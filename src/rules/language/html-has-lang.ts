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
    "The page is missing a lang attribute on <html>. Use the text sample in context to determine the primary language and suggest the correct BCP 47 code (e.g. 'en' for English, 'es' for Spanish, 'fr' for French, 'de' for German, 'ja' for Japanese, 'zh' for Chinese, 'pt' for Portuguese, 'ar' for Arabic). Add lang to the <html> element: <html lang=\"...\">.",
  run(doc) {
    const html = doc.documentElement;
    // Only applies to HTML documents (not SVG or MathML roots)
    if (html.tagName.toLowerCase() !== "html") return [];

    // Skip non-HTML documents (SVG or MathML parsed as text/html by DOMParser)
    if (!doc.doctype && doc.body) {
      const children = doc.body.children;
      if (children.length > 0 && Array.from(children).every(
        (c) => c.tagName.toLowerCase() === "svg" || c.tagName.toLowerCase() === "math"
      )) return [];
    }

    if (!html.getAttribute("lang")?.trim()) {
      // Sample visible text to help determine language
      let textSample: string | undefined;
      if (doc.body) {
        const text = doc.body.textContent?.trim().replace(/\s+/g, " ") || "";
        if (text) textSample = text.slice(0, 200);
      }
      return [{
        ruleId: "html-has-lang",
        selector: getSelector(html),
        html: getHtmlSnippet(html),
        impact: "serious" as const,
        message: "<html> element missing lang attribute.",
        context: textSample ? `Page text sample: "${textSample}"` : undefined,
      }];
    }
    return [];
  },
};

// Valid ISO 639-1 two-letter primary language subtags
const VALID_PRIMARY_SUBTAGS = new Set(
  ("aa ab ae af ak am an ar as av ay az ba be bg bh bi bm bn bo br bs ca ce ch " +
   "co cr cs cu cv cy da de dv dz ee el en eo es et eu fa ff fi fj fo fr fy ga " +
   "gd gl gn gu gv ha he hi ho hr ht hu hy hz ia id ie ig ii ik io is it iu ja " +
   "jv ka kg ki kj kk kl km kn ko kr ks ku kv kw ky la lb lg li ln lo lt lu lv " +
   "mg mh mi mk ml mn mr ms mt my na nb nd ne ng nl nn no nr nv ny oc oj om or " +
   "os pa pi pl ps pt qu rm rn ro ru rw sa sc sd se sg si sk sl sm sn so sq sr " +
   "ss st su sv sw ta te tg th ti tk tl tn to tr ts tt tw ty ug uk ur uz ve vi " +
   "vo wa wo xh yi yo za zh zu").split(" ")
);

// 3-letter codes that have a 2-letter preferred equivalent (deprecated per BCP 47)
const DEPRECATED_3_LETTER = new Set(
  ("aar abk afr aka amh ara arg asm ava ave aym aze bak bam bel ben bih bis bod " +
   "bos bre bul cat ces cha che chu chv cor cos cre cym dan deu div dzo ell eng " +
   "epo est eus ewe fao fas fij fin fra fry ful gla gle glg glv grn guj hat hau " +
   "hbs heb her hin hmo hrv hun hye ibo iii iku ile ina ind ipk isl ita jav jpn " +
   "kal kan kas kat kau kaz khm kik kin kir kom kon kor kua kur lao lat lav lim " +
   "lin lit ltz lub lug mah mal mar mkd mlg mlt mon mri msa mya nau nav nbl nde " +
   "ndo nep nld nno nob nor nya oci oji ori orm oss pan pli pol por pus que roh " +
   "ron run rus sag san sin slk slv sme smo sna snd som sot spa sqi srd srp ssw " +
   "sun swa swe tah tam tat tel tgk tgl tha tir ton tsn tso tuk tur twi uig ukr " +
   "urd uzb ven vie vol wln wol xho yid yor zha zho zul").split(" ")
);

const VALID_LANG_FORMAT = /^[a-z]{2,8}(-[a-z0-9]{1,8})*$/i;

function isValidLangTag(lang: string): boolean {
  if (!VALID_LANG_FORMAT.test(lang)) return false;
  const primary = lang.split("-")[0].toLowerCase();
  if (primary.length === 2) return VALID_PRIMARY_SUBTAGS.has(primary);
  if (primary.length === 3) return !DEPRECATED_3_LETTER.has(primary);
  // 4+ letter primary subtags are not valid language codes in BCP 47
  // (words like "dutch", "english", "invalid" are not valid subtags)
  return false;
}

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
    if (lang && !isValidLangTag(lang)) {
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

/**
 * Check whether an element has visible text content that is governed by its
 * lang attribute (i.e. not overridden by a descendant's own lang).
 */
function hasVisibleLangText(el: Element): boolean {
  // Check text nodes
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (!node.data.trim()) continue;
    const parent = node.parentElement;
    if (!parent) continue;
    if (parent instanceof HTMLElement && (parent.hidden || parent.style.display === "none")) continue;
    let ancestor: Element | null = parent;
    let langOverridden = false;
    while (ancestor && ancestor !== el) {
      if (ancestor.hasAttribute("lang")) {
        langOverridden = true;
        break;
      }
      ancestor = ancestor.parentElement;
    }
    if (!langOverridden) return true;
  }

  // Check img alt text (announced in the element's language)
  for (const img of el.querySelectorAll("img[alt]")) {
    const alt = img.getAttribute("alt")?.trim();
    if (!alt) continue;
    let ancestor: Element | null = img.parentElement;
    let langOverridden = false;
    while (ancestor && ancestor !== el) {
      if (ancestor.hasAttribute("lang")) {
        langOverridden = true;
        break;
      }
      ancestor = ancestor.parentElement;
    }
    if (!langOverridden) return true;
  }

  return false;
}

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

      const rawLang = el.getAttribute("lang");
      const lang = rawLang?.trim();

      // Whitespace-only lang is invalid
      if (rawLang && !lang) {
        if (hasVisibleLangText(el)) {
          violations.push({
            ruleId: "valid-lang",
            selector: getSelector(el),
            html: getHtmlSnippet(el),
            impact: "serious" as const,
            message: "Empty lang attribute value.",
          });
        }
        continue;
      }

      if (!lang) continue;

      // Skip elements with no visible text content governed by this lang
      if (!hasVisibleLangText(el)) continue;

      if (!isValidLangTag(lang)) {
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
