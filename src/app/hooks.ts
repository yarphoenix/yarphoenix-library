import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './store';

// В .ts/.tsx используем эти хуки вместо useDispatch/useSelector из react-redux:
// состояние и dispatch (включая thunk-и RTK Query) типизированы один раз здесь.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
