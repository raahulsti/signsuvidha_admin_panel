import ColorModulePage from './colorModules/ColorModulePage';
import {
  useGetShadowColorsQuery,
  useCreateShadowColorMutation,
  useUpdateShadowColorMutation,
  // useDeleteShadowColorMutation, // Delete disabled — use is_active instead to preserve cart/order references
} from '../api/adminApi';

export default function ShadowColors() {
  return (
    <ColorModulePage
      title="Shadow Colors"
      useListQuery={useGetShadowColorsQuery}
      useCreateMutation={useCreateShadowColorMutation}
      useUpdateMutation={useUpdateShadowColorMutation}
      // useDeleteMutation={useDeleteShadowColorMutation}
    />
  );
}
