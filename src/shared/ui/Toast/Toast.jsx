import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectToast, toastDismissed } from '../../ui-state/uiSlice';
import './Toast.scss';

export function Toast() {
  const toast = useSelector(selectToast);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!toast) {
      return undefined;
    }
    const timer = setTimeout(() => dispatch(toastDismissed()), 2600);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) {
    return null;
  }

  return (
    <div className="toast" role="status">
      <span className="toast__dot" />
      <span>{toast}</span>
    </div>
  );
}
