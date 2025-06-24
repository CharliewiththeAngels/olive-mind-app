export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          profile_picture_url: string | null
          role: "manager" | "promoter"
          hourly_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          profile_picture_url?: string | null
          role?: "manager" | "promoter"
          hourly_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          profile_picture_url?: string | null
          role?: "manager" | "promoter"
          hourly_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      work_shifts: {
        Row: {
          id: string
          title: string
          description: string | null
          brand_name: string
          location: string
          start_datetime: string
          end_datetime: string
          required_workers: number
          hourly_rate: number
          additional_fees: number
          status: "draft" | "published" | "cancelled"
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          brand_name: string
          location: string
          start_datetime: string
          end_datetime: string
          required_workers?: number
          hourly_rate?: number
          additional_fees?: number
          status?: "draft" | "published" | "cancelled"
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          brand_name?: string
          location?: string
          start_datetime?: string
          end_datetime?: string
          required_workers?: number
          hourly_rate?: number
          additional_fees?: number
          status?: "draft" | "published" | "cancelled"
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      work_briefs: {
        Row: {
          id: string
          shift_id: string
          title: string
          content: string
          video_urls: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shift_id: string
          title: string
          content: string
          video_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shift_id?: string
          title?: string
          content?: string
          video_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      shift_invitations: {
        Row: {
          id: string
          shift_id: string
          promoter_id: string
          status: "pending" | "accepted" | "declined"
          invited_at: string
          responded_at: string | null
        }
        Insert: {
          id?: string
          shift_id: string
          promoter_id: string
          status?: "pending" | "accepted" | "declined"
          invited_at?: string
          responded_at?: string | null
        }
        Update: {
          id?: string
          shift_id?: string
          promoter_id?: string
          status?: "pending" | "accepted" | "declined"
          invited_at?: string
          responded_at?: string | null
        }
      }
      work_reports: {
        Row: {
          id: string
          shift_id: string
          promoter_id: string
          check_in_time: string | null
          check_in_photo_url: string | null
          check_out_time: string | null
          work_summary: string | null
          work_photos: string[] | null
          is_late: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shift_id: string
          promoter_id: string
          check_in_time?: string | null
          check_in_photo_url?: string | null
          check_out_time?: string | null
          work_summary?: string | null
          work_photos?: string[] | null
          is_late?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shift_id?: string
          promoter_id?: string
          check_in_time?: string | null
          check_in_photo_url?: string | null
          check_out_time?: string | null
          work_summary?: string | null
          work_photos?: string[] | null
          is_late?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          promoter_id: string
          shift_id: string
          base_amount: number
          additional_fees: number
          total_amount: number
          hours_worked: number
          work_date: string
          payment_due_date: string
          status: "pending" | "paid"
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          promoter_id: string
          shift_id: string
          base_amount: number
          additional_fees?: number
          total_amount: number
          hours_worked: number
          work_date: string
          payment_due_date: string
          status?: "pending" | "paid"
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          promoter_id?: string
          shift_id?: string
          base_amount?: number
          additional_fees?: number
          total_amount?: number
          hours_worked?: number
          work_date?: string
          payment_due_date?: string
          status?: "pending" | "paid"
          paid_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          shift_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          scheduled_for: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shift_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          scheduled_for?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shift_id?: string
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          scheduled_for?: string | null
          sent_at?: string | null
          created_at?: string
        }
      }
    }
  }
}
