import ColorModulePage from './colorModules/ColorModulePage';
import {
  useGetBaseColorsQuery,
  useCreateBaseColorMutation,
  useUpdateBaseColorMutation,
  // useDeleteBaseColorMutation, // Delete disabled — use is_active instead to preserve cart/order references
} from '../api/adminApi';

export default function BaseColors() {
  return (
    <ColorModulePage
      title="Base Colors"
      useListQuery={useGetBaseColorsQuery}
      useCreateMutation={useCreateBaseColorMutation}
      useUpdateMutation={useUpdateBaseColorMutation}
      // useDeleteMutation={useDeleteBaseColorMutation}
    />
  );
}
