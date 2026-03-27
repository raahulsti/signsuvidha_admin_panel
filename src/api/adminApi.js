import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Dashboard',
    'ProductTypes',
    'Materials',
    'Elements',
    'Fonts',
    'FontSizes',
    'LetterStyles',
    'DimensionUnits',
    'ShippingServices',
    'ListedProducts',
    'Colors',
    'ShadowColors',
    'BorderColors',
    'BaseColors',
    'Vendors',
    'Orders',
  ],
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/admin/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
    getProductTypes: builder.query({
      query: () => '/admin/product-types',
      providesTags: ['ProductTypes'],
    }),
    updateProductType: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/product-types/${id}`, method: 'PUT', body }),
      invalidatesTags: ['ProductTypes'],
    }),
    getMaterials: builder.query({
      query: (params) => ({ url: '/admin/materials', params }),
      providesTags: ['Materials'],
    }),
    createMaterial: builder.mutation({
      query: (body) => ({ url: '/admin/materials', method: 'POST', body }),
      invalidatesTags: ['Materials'],
    }),
    updateMaterial: builder.mutation({
      query: ({ id, body }) => ({ url: `/admin/materials/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Materials'],
    }),
    deleteMaterial: builder.mutation({
      query: (id) => ({ url: `/admin/materials/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Materials'],
    }),
    getElements: builder.query({
      query: (params) => ({ url: '/admin/elements', params }),
      providesTags: ['Elements'],
    }),
    createElement: builder.mutation({
      query: (body) => ({ url: '/admin/elements', method: 'POST', body }),
      invalidatesTags: ['Elements'],
    }),
    updateElement: builder.mutation({
      query: ({ id, body }) => ({ url: `/admin/elements/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Elements'],
    }),
    deleteElement: builder.mutation({
      query: (id) => ({ url: `/admin/elements/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Elements'],
    }),
    getFonts: builder.query({
      query: () => '/admin/fonts',
      providesTags: ['Fonts'],
    }),
    createFont: builder.mutation({
      query: (body) => ({ url: '/admin/fonts', method: 'POST', body }),
      invalidatesTags: ['Fonts'],
    }),
    updateFont: builder.mutation({
      query: ({ id, body }) => ({ url: `/admin/fonts/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Fonts'],
    }),
    deleteFont: builder.mutation({
      query: (id) => ({ url: `/admin/fonts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Fonts'],
    }),
    getFontSizes: builder.query({
      query: () => '/admin/font-sizes',
      providesTags: ['FontSizes'],
    }),
    createFontSize: builder.mutation({
      query: (body) => ({ url: '/admin/font-sizes', method: 'POST', body }),
      invalidatesTags: ['FontSizes'],
    }),
    updateFontSize: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/font-sizes/${id}`, method: 'PUT', body }),
      invalidatesTags: ['FontSizes'],
    }),
    deleteFontSize: builder.mutation({
      query: (id) => ({ url: `/admin/font-sizes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['FontSizes'],
    }),
    getLetterStyles: builder.query({
      query: () => '/admin/letter-styles',
      providesTags: ['LetterStyles'],
    }),
    createLetterStyle: builder.mutation({
      query: (body) => ({ url: '/admin/letter-styles', method: 'POST', body }),
      invalidatesTags: ['LetterStyles'],
    }),
    updateLetterStyle: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/letter-styles/${id}`, method: 'PUT', body }),
      invalidatesTags: ['LetterStyles'],
    }),
    deleteLetterStyle: builder.mutation({
      query: (id) => ({ url: `/admin/letter-styles/${id}`, method: 'DELETE' }),
      invalidatesTags: ['LetterStyles'],
    }),
    getDimensionUnits: builder.query({
      query: () => '/admin/dimension-units',
      providesTags: ['DimensionUnits'],
    }),
    createDimensionUnit: builder.mutation({
      query: (body) => ({ url: '/admin/dimension-units', method: 'POST', body }),
      invalidatesTags: ['DimensionUnits'],
    }),
    updateDimensionUnit: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/dimension-units/${id}`, method: 'PUT', body }),
      invalidatesTags: ['DimensionUnits'],
    }),
    deleteDimensionUnit: builder.mutation({
      query: (id) => ({ url: `/admin/dimension-units/${id}`, method: 'DELETE' }),
      invalidatesTags: ['DimensionUnits'],
    }),
    getShippingServices: builder.query({
      query: () => '/admin/shipping-services',
      providesTags: ['ShippingServices'],
    }),
    createShippingService: builder.mutation({
      query: (body) => ({ url: '/admin/shipping-services', method: 'POST', body }),
      invalidatesTags: ['ShippingServices'],
    }),
    updateShippingService: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/shipping-services/${id}`, method: 'PUT', body }),
      invalidatesTags: ['ShippingServices'],
    }),
    deleteShippingService: builder.mutation({
      query: (id) => ({ url: `/admin/shipping-services/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ShippingServices'],
    }),
    getListedProducts: builder.query({
      query: () => '/admin/listed-products',
      providesTags: ['ListedProducts'],
    }),
    createListedProduct: builder.mutation({
      query: (body) => ({ url: '/admin/listed-products', method: 'POST', body }),
      invalidatesTags: ['ListedProducts'],
    }),
    updateListedProduct: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/listed-products/${id}`, method: 'PUT', body }),
      invalidatesTags: ['ListedProducts'],
    }),
    deleteListedProduct: builder.mutation({
      query: (id) => ({ url: `/admin/listed-products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ListedProducts'],
    }),
    getColors: builder.query({
      query: () => '/admin/colors',
      providesTags: ['Colors'],
    }),
    createColor: builder.mutation({
      query: (body) => ({ url: '/admin/colors', method: 'POST', body }),
      invalidatesTags: ['Colors'],
    }),
    updateColor: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/colors/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Colors'],
    }),
    deleteColor: builder.mutation({
      query: (id) => ({ url: `/admin/colors/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Colors'],
    }),
    assignColorProducts: builder.mutation({
      query: ({ id, product_type_ids }) => ({ url: `/admin/colors/${id}/assign-products`, method: 'POST', body: { product_type_ids } }),
      invalidatesTags: ['Colors'],
    }),
    getShadowColors: builder.query({
      query: () => '/admin/shadow-colors',
      providesTags: ['ShadowColors'],
    }),
    createShadowColor: builder.mutation({
      query: (body) => ({ url: '/admin/shadow-colors', method: 'POST', body }),
      invalidatesTags: ['ShadowColors'],
    }),
    updateShadowColor: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/shadow-colors/${id}`, method: 'PUT', body }),
      invalidatesTags: ['ShadowColors'],
    }),
    deleteShadowColor: builder.mutation({
      query: (id) => ({ url: `/admin/shadow-colors/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ShadowColors'],
    }),
    assignShadowColorProducts: builder.mutation({
      query: ({ id, product_type_ids }) => ({ url: `/admin/shadow-colors/${id}/assign-products`, method: 'POST', body: { product_type_ids } }),
      invalidatesTags: ['ShadowColors'],
    }),
    getBorderColors: builder.query({
      query: () => '/admin/border-colors',
      providesTags: ['BorderColors'],
    }),
    createBorderColor: builder.mutation({
      query: (body) => ({ url: '/admin/border-colors', method: 'POST', body }),
      invalidatesTags: ['BorderColors'],
    }),
    updateBorderColor: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/border-colors/${id}`, method: 'PUT', body }),
      invalidatesTags: ['BorderColors'],
    }),
    deleteBorderColor: builder.mutation({
      query: (id) => ({ url: `/admin/border-colors/${id}`, method: 'DELETE' }),
      invalidatesTags: ['BorderColors'],
    }),
    assignBorderColorProducts: builder.mutation({
      query: ({ id, product_type_ids }) => ({ url: `/admin/border-colors/${id}/assign-products`, method: 'POST', body: { product_type_ids } }),
      invalidatesTags: ['BorderColors'],
    }),
    getBaseColors: builder.query({
      query: () => '/admin/base-colors',
      providesTags: ['BaseColors'],
    }),
    createBaseColor: builder.mutation({
      query: (body) => ({ url: '/admin/base-colors', method: 'POST', body }),
      invalidatesTags: ['BaseColors'],
    }),
    updateBaseColor: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/base-colors/${id}`, method: 'PUT', body }),
      invalidatesTags: ['BaseColors'],
    }),
    deleteBaseColor: builder.mutation({
      query: (id) => ({ url: `/admin/base-colors/${id}`, method: 'DELETE' }),
      invalidatesTags: ['BaseColors'],
    }),
    assignBaseColorProducts: builder.mutation({
      query: ({ id, product_type_ids }) => ({ url: `/admin/base-colors/${id}/assign-products`, method: 'POST', body: { product_type_ids } }),
      invalidatesTags: ['BaseColors'],
    }),
    getVendors: builder.query({
      query: (params) => ({ url: '/admin/vendors', params }),
      providesTags: ['Vendors'],
    }),
    approveVendor: builder.mutation({
      query: (id) => ({ url: `/admin/vendors/${id}/approve`, method: 'PUT' }),
      invalidatesTags: ['Vendors', 'Dashboard'],
    }),
    rejectVendor: builder.mutation({
      query: (id) => ({ url: `/admin/vendors/${id}/reject`, method: 'PUT' }),
      invalidatesTags: ['Vendors', 'Dashboard'],
    }),
    toggleVendorBlock: builder.mutation({
      query: (id) => ({ url: `/admin/vendors/${id}/toggle`, method: 'PUT' }),
      invalidatesTags: ['Vendors'],
    }),
    getOrders: builder.query({
      query: (params) => ({ url: '/admin/orders', params }),
      providesTags: ['Orders'],
    }),
    getOrder: builder.query({
      query: (id) => `/admin/orders/${id}`,
      providesTags: (_, __, id) => [{ type: 'Orders', id }],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/admin/orders/${id}/status`, method: 'PUT', body: { status } }),
      invalidatesTags: ['Orders', 'Dashboard'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetProductTypesQuery,
  useUpdateProductTypeMutation,
  useGetMaterialsQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
  useGetElementsQuery,
  useCreateElementMutation,
  useUpdateElementMutation,
  useDeleteElementMutation,
  useGetFontsQuery,
  useCreateFontMutation,
  useUpdateFontMutation,
  useDeleteFontMutation,
  useGetFontSizesQuery,
  useCreateFontSizeMutation,
  useUpdateFontSizeMutation,
  useDeleteFontSizeMutation,
  useGetLetterStylesQuery,
  useCreateLetterStyleMutation,
  useUpdateLetterStyleMutation,
  useDeleteLetterStyleMutation,
  useGetDimensionUnitsQuery,
  useCreateDimensionUnitMutation,
  useUpdateDimensionUnitMutation,
  useDeleteDimensionUnitMutation,
  useGetShippingServicesQuery,
  useCreateShippingServiceMutation,
  useUpdateShippingServiceMutation,
  useDeleteShippingServiceMutation,
  useGetListedProductsQuery,
  useCreateListedProductMutation,
  useUpdateListedProductMutation,
  useDeleteListedProductMutation,
  useGetColorsQuery,
  useCreateColorMutation,
  useUpdateColorMutation,
  useDeleteColorMutation,
  useAssignColorProductsMutation,
  useGetShadowColorsQuery,
  useCreateShadowColorMutation,
  useUpdateShadowColorMutation,
  useDeleteShadowColorMutation,
  useAssignShadowColorProductsMutation,
  useGetBorderColorsQuery,
  useCreateBorderColorMutation,
  useUpdateBorderColorMutation,
  useDeleteBorderColorMutation,
  useAssignBorderColorProductsMutation,
  useGetBaseColorsQuery,
  useCreateBaseColorMutation,
  useUpdateBaseColorMutation,
  useDeleteBaseColorMutation,
  useAssignBaseColorProductsMutation,
  useGetVendorsQuery,
  useApproveVendorMutation,
  useRejectVendorMutation,
  useToggleVendorBlockMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
} = adminApi;
