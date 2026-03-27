import ColorModulePage from './colorModules/ColorModulePage';
import {
  useGetBorderColorsQuery,
  useCreateBorderColorMutation,
  useUpdateBorderColorMutation,
  useDeleteBorderColorMutation,
} from '../api/adminApi';

export default function BorderColors() {
  return (
    <ColorModulePage
      title="Border Colors"
      useListQuery={useGetBorderColorsQuery}
      useCreateMutation={useCreateBorderColorMutation}
      useUpdateMutation={useUpdateBorderColorMutation}
      useDeleteMutation={useDeleteBorderColorMutation}
    />
  );
}
