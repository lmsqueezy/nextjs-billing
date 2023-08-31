
export interface ApiObject {
  type: string,
  id: string,
  relationships: Object, // Expand
  links: Object, // Expand
  product: Object // Expand
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
