import { useSelector } from 'react-redux';

import { selectLanguage } from '../ui-state/uiSlice';
import { STRINGS } from './strings';

// t — активный словарь UI-строк, lang — 'ru' | 'en'.
export function useStrings() {
  const lang = useSelector(selectLanguage);
  return { t: STRINGS[lang], lang };
}
