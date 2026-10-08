import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export interface AvailableGateway {
  name: string;
  displayName: string;
  flow: 'embedded' | 'redirect';
  publicConfig: Record<string, string>;
}

export interface GatewaysResponse {
  gateways: AvailableGateway[];
  activeGateway: string;
  currency: string;
}

export interface CheckoutRequest {
  courseId: string;
  gateway?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  gateway: string;
  flow: 'embedded' | 'redirect';
  clientSecret?: string;
  redirectUrl?: string;
  amount: number;
  currency: string;
  courseSnapshot: {
    title: string;
    slug: string;
    thumbnail?: string;
    type: string;
    price: number;
    currency: string;
    instructor?: {
      name: string;
      avatar?: string;
    };
  };
  publicConfig: Record<string, string>;
}

export interface OrderItem {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  buyerRole: string;
  course: {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    category?: string;
    price?: number;
    type?: string;
  };
  courseSnapshot: {
    title: string;
    slug: string;
    thumbnail?: string;
    type: string;
    price: number;
    currency: string;
  };
  amount: number;
  currency: string;
  gateway: string;
  gatewayPaymentId?: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'canceled' | 'refunded';
  enrollment?: string;
  paidAt?: string;
  failureReason?: string;
  refund?: {
    refundId?: string;
    amount?: number;
    reason?: string;
    refundedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrdersResponse {
  orders: OrderItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats: {
    totalOrders: number;
    paidCount: number;
    pendingCount: number;
    refundedCount: number;
    totalRevenue: number;
  };
}

export interface AdminGatewayConfigView {
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
  configured: boolean;
  secretFields: string[];
  plainFields: string[];
  config: Record<string, any>;
}

export interface AdminPaymentSettingsResponse {
  activeGateway: string;
  enabledGateways: string[];
  currency: string;
  gateways: AdminGatewayConfigView[];
  webhookUrls: Record<string, string>;
}

export interface UpdatePaymentSettingsRequest {
  activeGateway?: string;
  enabledGateways?: string[];
  currency?: string;
  gateways?: Record<string, Record<string, any>>;
}

export interface AdminMentorSalesSummaryResponse {
  overallSummary: {
    totalPlatformGrossRevenue: number;
    totalMentorPayoutLiability: number;
    totalPlatformNetProfit: number;
    totalPaidOrdersCount: number;
    activeInstructorsCount: number;
    topMentor: {
      mentor: { _id: string; name: string; email: string; avatar?: string };
      totalGrossRevenue: number;
      mentorEarnings: number;
      totalSalesCount: number;
    } | null;
  };
  mentors: {
    mentor: { _id: string; name: string; email: string; avatar?: string };
    totalGrossRevenue: number;
    mentorEarnings: number;
    platformCommission: number;
    totalSalesCount: number;
    courses: {
      _id: string;
      title: string;
      slug: string;
      price: number;
      unitsSold: number;
      totalAmount: number;
      mentorShare: number;
    }[];
  }[];
}

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE}/payments`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Order', 'PaymentSettings', 'Enrollment', 'MentorSales'],
  endpoints: (b) => ({
    getAvailableGateways: b.query<GatewaysResponse, void>({
      query: () => '/gateways',
      transformResponse: (res: any) => res.data ?? res,
    }),

    createCheckout: b.mutation<CheckoutResponse, CheckoutRequest>({
      query: (body) => ({
        url: '/checkout',
        method: 'POST',
        body,
      }),
      transformResponse: (res: any) => res.data ?? res,
      invalidatesTags: ['Order'],
    }),

    getMyOrders: b.query<{ orders: OrderItem[]; pagination: any }, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/orders/my',
        params: params || undefined,
      }),
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['Order'],
    }),

    getMentorSales: b.query<any, { mentorId?: string; startDate?: string; endDate?: string } | void>({
      query: (params) => ({
        url: '/mentor/sales',
        params: params || undefined,
      }),
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['Order'],
    }),

    getAdminMentorSalesSummary: b.query<AdminMentorSalesSummaryResponse, void>({
      query: () => '/admin/mentor-sales',
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['Order', 'MentorSales'],
    }),

    getOrder: b.query<OrderItem, string>({
      query: (orderId) => `/orders/${orderId}`,
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['Order'],
    }),

    confirmOrder: b.mutation<OrderItem, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/confirm`,
        method: 'POST',
      }),
      transformResponse: (res: any) => res.data ?? res,
      invalidatesTags: ['Order', 'Enrollment'],
    }),

    cancelOrder: b.mutation<OrderItem, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/cancel`,
        method: 'POST',
      }),
      transformResponse: (res: any) => res.data ?? res,
      invalidatesTags: ['Order'],
    }),

    getAdminOrders: b.query<
      AdminOrdersResponse,
      { status?: string; gateway?: string; courseId?: string; mentorId?: string; search?: string; page?: number; limit?: number; sort?: string } | void
    >({
      query: (params) => ({
        url: '/admin/orders',
        params: params || undefined,
      }),
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['Order'],
    }),

    refundOrder: b.mutation<OrderItem, { orderId: string; reason: string; amount?: number }>({
      query: ({ orderId, ...body }) => ({
        url: `/admin/orders/${orderId}/refund`,
        method: 'POST',
        body,
      }),
      transformResponse: (res: any) => res.data ?? res,
      invalidatesTags: ['Order'],
    }),

    getAdminPaymentSettings: b.query<AdminPaymentSettingsResponse, void>({
      query: () => '/admin/settings',
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['PaymentSettings'],
    }),

    updateAdminPaymentSettings: b.mutation<AdminPaymentSettingsResponse, UpdatePaymentSettingsRequest>({
      query: (body) => ({
        url: '/admin/settings',
        method: 'PUT',
        body,
      }),
      transformResponse: (res: any) => res.data ?? res,
      invalidatesTags: ['PaymentSettings'],
    }),

    testPaymentGateway: b.mutation<{ success: boolean; message: string; details?: any }, { gateway: string; config?: any }>({
      query: ({ gateway, config }) => ({
        url: `/admin/settings/test/${gateway}`,
        method: 'POST',
        body: { config },
      }),
      transformResponse: (res: any) => res.data ?? res,
    }),
  }),
});

export const {
  useGetAvailableGatewaysQuery,
  useCreateCheckoutMutation,
  useGetMyOrdersQuery,
  useGetMentorSalesQuery,
  useGetAdminMentorSalesSummaryQuery,
  useGetOrderQuery,
  useConfirmOrderMutation,
  useCancelOrderMutation,
  useGetAdminOrdersQuery,
  useRefundOrderMutation,
  useGetAdminPaymentSettingsQuery,
  useUpdateAdminPaymentSettingsMutation,
  useTestPaymentGatewayMutation,
} = paymentApi;
