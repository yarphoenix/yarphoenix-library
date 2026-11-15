import { BookOpen, Globe } from 'lucide-react';

import { useStrings } from '../../shared/i18n/useStrings';
import type { CatalogScope } from './catalogApi';
import './ScopeSwitch.scss';

type ScopeSwitchProps = {
  scope: CatalogScope;
  onChange: (scope: CatalogScope) => void;
};

// Переключатель «что показывать»: книги, которые можно читать здесь, или весь Open Library.
export function ScopeSwitch({ scope, onChange }: ScopeSwitchProps) {
  const { t } = useStrings();

  const options = [
    { value: 'collection', label: t.scopeReadable, Icon: BookOpen },
    { value: 'all', label: t.scopeAll, Icon: Globe },
  ] as const;

  return (
    <div className="scope-switch" role="group" aria-label={t.scopeLabel}>
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          className={`scope-switch__option ${value === scope ? 'scope-switch__option--active' : ''}`}
          aria-pressed={value === scope}
          onClick={() => onChange(value)}
        >
          <Icon size={15} strokeWidth={2} aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}
