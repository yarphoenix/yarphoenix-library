import { useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useStrings } from '../../shared/i18n/useStrings';
import {
  fontChanged,
  fontSizeChanged,
  selectReaderSettings,
  themeChanged,
  type ReaderFont,
  type ReaderFontSize,
  type ReaderTheme,
} from './readerSlice';

type Option<Value> = { value: Value; label: string };

const chipClass = (active: boolean): string =>
  active ? 'reader__chip reader__chip--active' : 'reader__chip';

// Кнопка «Aa» и меню оформления: шрифт, тема, размер. Настройки — в readerSlice (ТЗ §6.1).
export function ReaderSettingsMenu() {
  const { t } = useStrings();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectReaderSettings);
  const [open, setOpen] = useState(false);

  const fonts: Option<ReaderFont>[] = [
    { value: 'serif', label: t.fontSerif },
    { value: 'sans', label: t.fontSans },
  ];
  const themes: Option<ReaderTheme>[] = [
    { value: 'light', label: t.themeLight },
    { value: 'sepia', label: t.themeSepia },
    { value: 'dark', label: t.themeDark },
  ];
  const sizes: Option<ReaderFontSize>[] = [
    { value: 'sm', label: t.sizeS },
    { value: 'md', label: t.sizeM },
    { value: 'lg', label: t.sizeL },
  ];

  return (
    <div className="reader__aa-box">
      <button
        type="button"
        className="reader__aa"
        aria-label={t.readerSettings}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Aa
      </button>

      {open && (
        <div className="reader__aa-menu">
          <div className="reader__aa-label">{t.font}</div>
          <div className="reader__aa-row">
            {fonts.map((option) => (
              <button
                key={option.value}
                type="button"
                className={chipClass(settings.font === option.value)}
                aria-pressed={settings.font === option.value}
                onClick={() => dispatch(fontChanged(option.value))}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="reader__aa-label">{t.theme}</div>
          <div className="reader__aa-row">
            {themes.map((option) => (
              <button
                key={option.value}
                type="button"
                className={chipClass(settings.theme === option.value)}
                aria-pressed={settings.theme === option.value}
                onClick={() => dispatch(themeChanged(option.value))}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="reader__aa-label">{t.textSize}</div>
          <div className="reader__aa-row">
            {sizes.map((option) => (
              <button
                key={option.value}
                type="button"
                className={chipClass(settings.fontSize === option.value)}
                aria-pressed={settings.fontSize === option.value}
                onClick={() => dispatch(fontSizeChanged(option.value))}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
