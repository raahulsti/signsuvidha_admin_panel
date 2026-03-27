import ColorModulePage from './colorModules/ColorModulePage';
import {
  useGetBaseColorsQuery,
  useCreateBaseColorMutation,
  useUpdateBaseColorMutation,
  useDeleteBaseColorMutation,
} from '../api/adminApi';

export default function BaseColors() {
  return (
    <ColorModulePage
      title="Base Colors"
      useListQuery={useGetBaseColorsQuery}
      useCreateMutation={useCreateBaseColorMutation}
      useUpdateMutation={useUpdateBaseColorMutation}
      useDeleteMutation={useDeleteBaseColorMutation}
    />
  );
}
