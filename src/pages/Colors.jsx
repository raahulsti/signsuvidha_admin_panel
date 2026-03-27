import ColorModulePage from './colorModules/ColorModulePage';
import {
  useGetColorsQuery,
  useCreateColorMutation,
  useUpdateColorMutation,
  useDeleteColorMutation,
} from '../api/adminApi';

export default function Colors() {
  return (
    <ColorModulePage
      title="Colors"
      useListQuery={useGetColorsQuery}
      useCreateMutation={useCreateColorMutation}
      useUpdateMutation={useUpdateColorMutation}
      useDeleteMutation={useDeleteColorMutation}
    />
  );
}
