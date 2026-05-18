export type UserRole = "super_admin" | "org_admin" | "solicitor"

export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  organization_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  contact_name: string | null
  contact_email: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Donor {
  id: string
  organization_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  capacity: number | null
  score: number
  tier: string | null
  assigned_solicitor_id: string | null
  is_parent: boolean
  is_grandparent: boolean
  is_alumni: boolean
  is_board_member: boolean
  is_community_builder: boolean
  is_program_attendee: boolean
  is_volunteer: boolean
  is_donor_advised_fund: boolean
  is_foundation_trustee: boolean
  bloomerang_id: string | null
  created_at: string
  updated_at: string
}

export interface MoveIdea {
  id: string
  title: string
  category: string
  organization_id: string | null
  is_global: boolean
  created_at: string
}

export type MoveStatus = "pending" | "completed"

export interface Move {
  id: string
  title: string
  donor_id: string
  solicitor_id: string
  organization_id: string
  move_idea_id: string | null
  due_date: string
  status: MoveStatus
  completion_notes: string | null
  completed_at: string | null
  follow_up_move_id: string | null
  parent_move_id: string | null
  created_at: string
}

export interface ScoringConfig {
  id: string
  organization_id: string
  field_name: string
  is_enabled: boolean
  point_value: number
}

export interface TierConfig {
  id: string
  organization_id: string
  tier_name: string
  min_score: number
  max_score: number
  moves_needed: number
}

export interface Invitation {
  id: string
  email: string
  organization_id: string
  token: string
  expires_at: string
  is_used: boolean
  created_at: string
}

export type FeedbackCategory = "bug_report" | "feature_request" | "question"
export type FeedbackStatus = "new" | "reviewed" | "resolved"

export interface Feedback {
  id: string
  user_id: string
  organization_id: string | null
  category: FeedbackCategory
  title: string
  description: string
  attachment_url: string | null
  status: FeedbackStatus
  created_at: string
  updated_at: string
}

export type ImportType = "csv" | "bloomerang"

export interface ImportLogError {
  row?: number
  reason: string
}

export interface ImportLog {
  id: string
  organization_id: string
  import_type: ImportType
  records_created: number
  records_updated: number
  records_skipped: number
  errors: ImportLogError[]
  created_at: string
}

export type SyncStatus = "success" | "failed" | null

export interface BloomerangConfig {
  id: string
  organization_id: string
  api_key_encrypted: string
  last_synced_at: string | null
  last_sync_status: SyncStatus
  synced_record_count: number
}
