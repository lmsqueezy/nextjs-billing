
export interface ApiObject {
  type: string,
  id: string,
  relationships: object, // Expand
  links: object, // Expand
  product: object // Expand
}

export interface Variant extends ApiObject {
  attributes: {
    product_id: number,
    name: string,
    slug: string,
    description: string,
    price: number,
    is_subscription: boolean,
    interval: "day" | "week" | "month" | "year" | null,
    interval_count: number | null,
    has_free_trial: boolean,
    trial_interval: string | null,
    trial_interval_count: integer | null,
    pay_what_you_want: boolean,
    min_price: number,
    suggested_price: number,
    has_license_keys: boolean,
    license_activation_limit: number,
    is_license_limit_unlimited: boolean,
    license_length_value: number,
    license_length_unit: "days" | "months" | "years",
    is_license_length_unlimited: boolean,
    sort: number,
    status: "pending" | "draft" | "published",
    status_formatted: "Pending" | "Draft" | "Published",
    created_at: string,
    updated_at: string
  }
}

export interface ProductAttributes {
  store_id: number,
  name: string,
  slug: string,
  description: string,
  status: "draft" | "published",
  status_formatted: "Draft" | "Published",
  thumb_url: string,
  large_thumb_url: string,
  price: number,
  pay_what_you_want: boolean,
  from_price: number | null,
  to_price: number | null,
  buy_now_url: string,
  price_formatted: string,
  created_at: string,
  updated_at: string
}

export interface Product extends ApiObject {
  attributes: ProductAttributes
}

export interface ApiQueryParams {
  include?: string,
  perPage?: number,
  page?: number
}

export interface SubscriptionUpdateData {
  orderId: number,
  name: string,
  email: string,
  status: string,
  renewsAt: string,
  endsAt: string,
  trialEndsAt: string,
  planId: number,
  userId: string,
  price: number | null
}

export interface SubscriptionCreateData extends SubscriptionUpdateData {
  lemonSqueezyId?: number
}


/* Internal object used in the UI */
interface SubscriptionRecord {
  id: number,
  planName: string | null,
  planInterval: number | null,
  productId: number | null,
  variantId: number | null,
  status: string,
  renewalDate: string | null,
  trialEndDate: string | null,
  expiryDate: string | null,
  unpauseDate: string | null
}