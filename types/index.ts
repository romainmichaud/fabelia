// ============================================================
// ENUMS & UNION TYPES
// ============================================================

export type ProductType   = 'digital' | 'print' | 'bundle'
export type BookFormat    = 'softcover' | 'hardcover'
export type OrderStatus   = 'draft' | 'pending_payment' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'
export type GenerationStatus = 'idle' | 'queued' | 'generating_text' | 'generating_images' | 'assembling' | 'completed' | 'failed'
export type PageType      = 'cover' | 'dedication' | 'chapter' | 'illustration' | 'back_cover'

export type BookTheme =
  | 'space'
  | 'ocean'
  | 'forest'
  | 'castle'
  | 'jungle'
  | 'desert'

export type HairColor =
  | 'blond'
  | 'chestnut'
  | 'dark'
  | 'red'
  | 'gray'

export type EyeColor =
  | 'blue'
  | 'green'
  | 'brown'
  | 'hazel'
  | 'gray'

export type SkinTone =
  | 'light'
  | 'medium-light'
  | 'medium'
  | 'medium-dark'
  | 'dark'

export type Personality =
  | 'brave'
  | 'curious'
  | 'funny'
  | 'kind'
  | 'creative'
  | 'adventurous'

// ============================================================
// DOMAIN MODELS
// ============================================================

export interface Profile {
  id:            string
  email:         string
  full_name:     string | null
  avatar_url:    string | null
  role:          'customer' | 'admin'
  locale:        string
  marketing_opt: boolean
  created_at:    string
  updated_at:    string
}

export interface ProjectFormData {
  // Step 1 – Theme
  theme?:        BookTheme

  // Step 2 – Hero
  childName?:    string
  childAge?:     number
  childGender?:  'boy' | 'girl' | 'neutral'

  // Step 3 – Portrait
  hairColor?:    HairColor
  eyeColor?:     EyeColor
  skinTone?:     SkinTone
  hasGlasses?:   boolean

  // Step 4 – Personality
  personalities?: Personality[]  // max 2

  // Step 5 – Dedication
  dedication?:   string
  senderName?:   string
}

export interface BookProject {
  id:                string
  user_id:           string
  title:             string | null
  generation_status: GenerationStatus
  product_type:      ProductType | null
  book_format:       BookFormat | null
  theme:             BookTheme | null
  language:          string
  is_preview_ready:  boolean
  is_book_ready:     boolean
  paid_at:           string | null
  created_at:        string
  updated_at:        string
}

export interface Preview {
  id:               string
  project_id:       string
  cover_text:       string | null
  chapter_excerpt:  string | null
  cover_image_url:  string | null
  illustration_url: string | null
  expires_at:       string
  created_at:       string
}

export interface BookPage {
  id:          string
  project_id:  string
  page_number: number
  page_type:   PageType
  content:     string | null
  layout:      string | null
  metadata:    Record<string, unknown> | null
}

export interface BookImage {
  id:          string
  project_id:  string
  page_id:     string | null
  storage_path: string
  public_url:  string | null
  image_type:  'cover' | 'illustration' | 'chapter_header'
}

export interface Order {
  id:              string
  user_id:         string
  project_id:      string
  order_number:    string
  status:          OrderStatus
  product_type:    ProductType
  book_format:     BookFormat | null
  quantity:        number
  unit_price:      number   // centimes
  discount_amount: number
  tax_amount:      number
  total_amount:    number   // centimes
  currency:        string
  coupon_code:     string | null
  created_at:      string
}

export interface PrintJob {
  id:                  string
  order_id:            string
  status:              string
  shipping_address:    ShippingAddress
  tracking_number:     string | null
  tracking_url:        string | null
  estimated_delivery:  string | null
}

export interface ShippingAddress {
  first_name:  string
  last_name:   string
  line1:       string
  line2?:      string
  city:        string
  postal_code: string
  country:     'FR'
}

// ============================================================
// API TYPES
// ============================================================

export interface ApiResponse<T> {
  data:    T | null
  error:   string | null
  success: boolean
}

export interface PaginatedResult<T> {
  data:       T[]
  total:      number
  page:       number
  per_page:   number
  total_pages: number
}

// ============================================================
// UI TYPES
// ============================================================

export interface WizardStep {
  id:          string
  label:       string
  description: string
  icon:        string
}

export interface PricingPlan {
  id:          ProductType
  name:        string
  price:       number          // euros
  description: string
  features:    string[]
  highlighted: boolean
  badge?:      string
}

export interface Testimonial {
  id:        string
  author:    string
  role:      string
  content:   string
  rating:    number
  avatar?:   string
}

export interface BookCoverOption {
  id:    string
  label: string
  imageUrl: string
  palette: {
    primary:    string
    secondary:  string
    accent:     string
  }
}
