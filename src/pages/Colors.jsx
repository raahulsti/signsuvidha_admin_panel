import ColorModulePage from './colorModules/ColorModulePage';
import {
  useGetColorsQuery,
  useCreateColorMutation,
  useUpdateColorMutation,
  // useDeleteColorMutation, // Delete disabled — use is_active instead to preserve cart/order references
} from '../api/adminApi';

export default function Colors() {
  return (
    <ColorModulePage
      title="Colors"
      useListQuery={useGetColorsQuery}
      useCreateMutation={useCreateColorMutation}
      useUpdateMutation={useUpdateColorMutation}
      // useDeleteMutation={useDeleteColorMutation}
    />
  );
}
