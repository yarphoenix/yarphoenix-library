import { useId } from 'react';

import './Input.scss';

export function Input({ label, className = '', ...rest }) {
  const id = useId();

  return (
    <div className={`input ${className}`}>
      {label && (
        <label className="input__label" htmlFor={id}>
          {label}
        </label>
      )}
      <input id={id} className="input__field" {...rest} />
    </div>
  );
}
