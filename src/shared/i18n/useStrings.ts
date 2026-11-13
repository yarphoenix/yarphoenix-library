import { useSelector } from 'react-redux';

import { selectLanguage } from '../ui-state/uiSlice';
import { STRINGS, type Dictionary, type Language } from './strings';

// t — активный словарь UI-строк, lang — 'ru' | 'en'.
export function useStrings(): { t: Dictionary; lang: Language } {
  const lang = useSelector(selectLanguage);
  return { t: STRINGS[lang], lang };
}
