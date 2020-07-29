import { useContext } from 'react';
import { ScrollBottomSheetContext } from './context';

export const useScrollBottomSheet = () => {
  return useContext(ScrollBottomSheetContext);
};
