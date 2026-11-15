import type { Language, PluralForms } from './strings';

const RULES: Record<Language, Intl.PluralRules> = {
  en: new Intl.PluralRules('en'),
  ru: new Intl.PluralRules('ru'),
};

const NUMBERS: Record<Language, Intl.NumberFormat> = {
  en: new Intl.NumberFormat('en'),
  ru: new Intl.NumberFormat('ru'),
};

const pickForm = (lang: Language, count: number, forms: PluralForms): string => {
  const category = RULES[lang].select(count);
  if (category === 'one') {
    return forms.one;
  }
  if (category === 'few') {
    return forms.few ?? forms.other;
  }
  if (category === 'many') {
    return forms.many ?? forms.other;
  }
  return forms.other;
};

/** Число с подписью в нужной форме: «1 книга», «1 885 книг найдено», «1,885 books found». */
export function countLabel(lang: Language, count: number, forms: PluralForms): string {
  return `${NUMBERS[lang].format(count)} ${pickForm(lang, count, forms)}`;
}
