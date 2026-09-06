/**
 * Hand-written Supabase Database type matching supabase/migrations 0001–0016.
 * Keep this file in sync with migrations. Once a live project exists,
 * regenerate with: npx supabase gen types typescript --linked > src/types/database.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          company: string | null;
          username: string | null;
          is_active: boolean;
          client_status: string;
          profile_completed: boolean;
          auth_provider: string | null;
          role: Database["public"]["Enums"]["app_role"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          company?: string | null;
          username?: string | null;
          is_active?: boolean;
          client_status?: string;
          profile_completed?: boolean;
          auth_provider?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          company?: string | null;
          username?: string | null;
          is_active?: boolean;
          client_status?: string;
          profile_completed?: boolean;
          auth_provider?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_usernames: {
        Row: {
          user_id: string;
          username: string;
          is_active: boolean;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          username: string;
          is_active?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          username?: string;
          is_active?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: boolean;
          brand_name: string;
          brand_short_name: string;
          alternate_name_1: string;
          alternate_name_2: string;
          tagline: string;
          company_description: string | null;
          logo_url: string | null;
          favicon_url: string | null;
          phone: string | null;
          whatsapp: string | null;
          contact_email: string | null;
          support_email: string | null;
          address_line: string | null;
          map_url: string | null;
          social_links: Json;
          business_hours: string | null;
          footer_text: string | null;
          copyright_text: string | null;
          default_og_image_url: string | null;
          accent_preset: string;
          global_cta_label: string;
          global_cta_href: string;
          company_legal_name: string | null;
          about_text: string | null;
          address_city: string | null;
          address_state: string | null;
          address_postal_code: string | null;
          address_country: string;
          value_proposition: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          brand_name?: string;
          brand_short_name?: string;
          alternate_name_1?: string;
          alternate_name_2?: string;
          tagline?: string;
          company_description?: string | null;
          logo_url?: string | null;
          favicon_url?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          contact_email?: string | null;
          support_email?: string | null;
          address_line?: string | null;
          map_url?: string | null;
          social_links?: Json;
          business_hours?: string | null;
          footer_text?: string | null;
          copyright_text?: string | null;
          default_og_image_url?: string | null;
          accent_preset?: string;
          global_cta_label?: string;
          global_cta_href?: string;
          company_legal_name?: string | null;
          about_text?: string | null;
          address_city?: string | null;
          address_state?: string | null;
          address_postal_code?: string | null;
          address_country?: string;
          value_proposition?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: boolean;
          brand_name?: string;
          brand_short_name?: string;
          alternate_name_1?: string;
          alternate_name_2?: string;
          tagline?: string;
          company_description?: string | null;
          logo_url?: string | null;
          favicon_url?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          contact_email?: string | null;
          support_email?: string | null;
          address_line?: string | null;
          map_url?: string | null;
          social_links?: Json;
          business_hours?: string | null;
          footer_text?: string | null;
          copyright_text?: string | null;
          default_og_image_url?: string | null;
          accent_preset?: string;
          global_cta_label?: string;
          global_cta_href?: string;
          company_legal_name?: string | null;
          about_text?: string | null;
          address_city?: string | null;
          address_state?: string | null;
          address_postal_code?: string | null;
          address_country?: string;
          value_proposition?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      navigation_items: {
        Row: {
          id: string;
          location: "header" | "footer";
          label: string;
          url: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          location?: "header" | "footer";
          label: string;
          url: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          location?: "header" | "footer";
          label?: string;
          url?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      page_sections: {
        Row: {
          id: string;
          page: string;
          section_type:
            | "hero"
            | "trust_strip"
            | "services_overview"
            | "platforms"
            | "featured_projects"
            | "process"
            | "industries"
            | "tech_capabilities"
            | "why_us"
            | "testimonials"
            | "team"
            | "gallery"
            | "faq"
            | "cta";
          content: Json;
          sort_order: number;
          is_visible: boolean;
          status: Database["public"]["Enums"]["content_status"];
          variant: string;
          accent: string;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page?: string;
          section_type:
            | "hero"
            | "trust_strip"
            | "services_overview"
            | "platforms"
            | "featured_projects"
            | "process"
            | "industries"
            | "tech_capabilities"
            | "why_us"
            | "testimonials"
            | "team"
            | "gallery"
            | "faq"
            | "cta";
          content?: Json;
          sort_order?: number;
          is_visible?: boolean;
          status?: Database["public"]["Enums"]["content_status"];
          variant?: string;
          accent?: string;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page?: string;
          section_type?:
            | "hero"
            | "trust_strip"
            | "services_overview"
            | "platforms"
            | "featured_projects"
            | "process"
            | "industries"
            | "tech_capabilities"
            | "why_us"
            | "testimonials"
            | "team"
            | "gallery"
            | "faq"
            | "cta";
          content?: Json;
          sort_order?: number;
          is_visible?: boolean;
          status?: Database["public"]["Enums"]["content_status"];
          variant?: string;
          accent?: string;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      seo_metadata: {
        Row: {
          id: string;
          path: string;
          title: string | null;
          description: string | null;
          og_image_url: string | null;
          no_index: boolean;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          path: string;
          title?: string | null;
          description?: string | null;
          og_image_url?: string | null;
          no_index?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          path?: string;
          title?: string | null;
          description?: string | null;
          og_image_url?: string | null;
          no_index?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      redirects: {
        Row: {
          id: string;
          from_path: string;
          to_path: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_path: string;
          to_path: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_path?: string;
          to_path?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          slug: string;
          name: string;
          short_description: string;
          long_description: string | null;
          category: string | null;
          icon: string | null;
          cover_image_url: string | null;
          problems: Json;
          features: Json;
          deliverables: Json;
          platforms: Json;
          technology_examples: Json;
          industries: Json;
          process_steps: Json;
          cta_label: string | null;
          cta_href: string | null;
          sort_order: number;
          is_active: boolean;
          status: Database["public"]["Enums"]["content_status"];
          seo_title: string | null;
          seo_description: string | null;
          og_image_url: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          short_description?: string;
          long_description?: string | null;
          category?: string | null;
          icon?: string | null;
          cover_image_url?: string | null;
          problems?: Json;
          features?: Json;
          deliverables?: Json;
          platforms?: Json;
          technology_examples?: Json;
          industries?: Json;
          process_steps?: Json;
          cta_label?: string | null;
          cta_href?: string | null;
          sort_order?: number;
          is_active?: boolean;
          status?: Database["public"]["Enums"]["content_status"];
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          short_description?: string;
          long_description?: string | null;
          category?: string | null;
          icon?: string | null;
          cover_image_url?: string | null;
          problems?: Json;
          features?: Json;
          deliverables?: Json;
          platforms?: Json;
          technology_examples?: Json;
          industries?: Json;
          process_steps?: Json;
          cta_label?: string | null;
          cta_href?: string | null;
          sort_order?: number;
          is_active?: boolean;
          status?: Database["public"]["Enums"]["content_status"];
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      service_faqs: {
        Row: {
          id: string;
          service_id: string;
          question: string;
          answer: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          question: string;
          answer: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          question?: string;
          answer?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          slug: string;
          name: string;
          logo_url: string | null;
          industry: string | null;
          location: string | null;
          auth_user_id: string | null;
          portal_enabled: boolean;
          portal_last_login: string | null;
          public_permission: boolean;
          is_active: boolean;
          status: Database["public"]["Enums"]["content_status"];
          internal_notes: string | null;
          sort_order: number;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          logo_url?: string | null;
          industry?: string | null;
          location?: string | null;
          auth_user_id?: string | null;
          portal_enabled?: boolean;
          portal_last_login?: string | null;
          public_permission?: boolean;
          is_active?: boolean;
          status?: Database["public"]["Enums"]["content_status"];
          internal_notes?: string | null;
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          logo_url?: string | null;
          industry?: string | null;
          location?: string | null;
          auth_user_id?: string | null;
          portal_enabled?: boolean;
          portal_last_login?: string | null;
          public_permission?: boolean;
          is_active?: boolean;
          status?: Database["public"]["Enums"]["content_status"];
          internal_notes?: string | null;
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      client_portal_documents: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          description: string | null;
          file_url: string;
          file_size_bytes: number | null;
          file_type: string | null;
          category: string;
          is_visible_to_client: boolean;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          description?: string | null;
          file_url: string;
          file_size_bytes?: number | null;
          file_type?: string | null;
          category?: string;
          is_visible_to_client?: boolean;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          title?: string;
          description?: string | null;
          file_url?: string;
          file_size_bytes?: number | null;
          file_type?: string | null;
          category?: string;
          is_visible_to_client?: boolean;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      client_messages: {
        Row: {
          id: string;
          client_id: string;
          sender_id: string | null;
          is_from_client: boolean;
          subject: string;
          body: string;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          sender_id?: string | null;
          is_from_client?: boolean;
          subject?: string;
          body: string;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          sender_id?: string | null;
          is_from_client?: boolean;
          subject?: string;
          body?: string;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          client_id: string | null;
          slug: string;
          name: string;
          short_summary: string;
          overview: string | null;
          problem: string | null;
          solution: string | null;
          key_features: Json;
          platform_type: string | null;
          industry: string | null;
          technology_stack: Json;
          database_note: string | null;
          integrations: Json;
          duration: string | null;
          project_year: number | null;
          project_status: string | null;
          cover_image_url: string | null;
          video_url: string | null;
          impact_results: Json | null;
          testimonial_quote: string | null;
          testimonial_person: string | null;
          testimonial_role: string | null;
          public_url: string | null;
          is_public: boolean;
          is_active: boolean;
          status: Database["public"]["Enums"]["content_status"];
          is_featured: boolean;
          sort_order: number;
          seo_title: string | null;
          seo_description: string | null;
          og_image_url: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          slug: string;
          name: string;
          short_summary?: string;
          overview?: string | null;
          problem?: string | null;
          solution?: string | null;
          key_features?: Json;
          platform_type?: string | null;
          industry?: string | null;
          technology_stack?: Json;
          database_note?: string | null;
          integrations?: Json;
          duration?: string | null;
          project_year?: number | null;
          project_status?: string | null;
          cover_image_url?: string | null;
          video_url?: string | null;
          impact_results?: Json | null;
          testimonial_quote?: string | null;
          testimonial_person?: string | null;
          testimonial_role?: string | null;
          public_url?: string | null;
          is_public?: boolean;
          is_active?: boolean;
          status?: Database["public"]["Enums"]["content_status"];
          is_featured?: boolean;
          sort_order?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string | null;
          slug?: string;
          name?: string;
          short_summary?: string;
          overview?: string | null;
          problem?: string | null;
          solution?: string | null;
          key_features?: Json;
          platform_type?: string | null;
          industry?: string | null;
          technology_stack?: Json;
          database_note?: string | null;
          integrations?: Json;
          duration?: string | null;
          project_year?: number | null;
          project_status?: string | null;
          cover_image_url?: string | null;
          video_url?: string | null;
          impact_results?: Json | null;
          testimonial_quote?: string | null;
          testimonial_person?: string | null;
          testimonial_role?: string | null;
          public_url?: string | null;
          is_public?: boolean;
          is_active?: boolean;
          status?: Database["public"]["Enums"]["content_status"];
          is_featured?: boolean;
          sort_order?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      project_media: {
        Row: {
          id: string;
          project_id: string;
          storage_path: string | null;
          url: string;
          alt_text: string;
          media_type: "image" | "video";
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          storage_path?: string | null;
          url: string;
          alt_text?: string;
          media_type?: "image" | "video";
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          storage_path?: string | null;
          url?: string;
          alt_text?: string;
          media_type?: "image" | "video";
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          role_title: string;
          short_bio: string | null;
          long_bio: string | null;
          profile_photo_url: string | null;
          skills: Json;
          linkedin_url: string | null;
          github_url: string | null;
          portfolio_url: string | null;
          email: string | null;
          public_email: boolean;
          is_public: boolean;
          is_active: boolean;
          status: Database["public"]["Enums"]["content_status"];
          is_featured: boolean;
          sort_order: number;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          role_title?: string;
          short_bio?: string | null;
          long_bio?: string | null;
          profile_photo_url?: string | null;
          skills?: Json;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          email?: string | null;
          public_email?: boolean;
          is_public?: boolean;
          is_active?: boolean;
          status?: Database["public"]["Enums"]["content_status"];
          is_featured?: boolean;
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          role_title?: string;
          short_bio?: string | null;
          long_bio?: string | null;
          profile_photo_url?: string | null;
          skills?: Json;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          email?: string | null;
          public_email?: boolean;
          is_public?: boolean;
          is_active?: boolean;
          status?: Database["public"]["Enums"]["content_status"];
          is_featured?: boolean;
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          author_name: string;
          author_role: string | null;
          author_company: string | null;
          quote: string;
          rating: number | null;
          title: string | null;
          review_text: string | null;
          project_name: string | null;
          admin_response: string | null;
          is_verified: boolean;
          submitted_by: string | null;
          avatar_url: string | null;
          client_id: string | null;
          project_id: string | null;
          is_public: boolean;
          is_active: boolean;
          status: Database["public"]["Enums"]["content_status"];
          sort_order: number;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          author_name: string;
          author_role?: string | null;
          author_company?: string | null;
          quote: string;
          rating?: number | null;
          title?: string | null;
          review_text?: string | null;
          project_name?: string | null;
          admin_response?: string | null;
          is_verified?: boolean;
          submitted_by?: string | null;
          avatar_url?: string | null;
          client_id?: string | null;
          project_id?: string | null;
          is_public?: boolean;
          is_active?: boolean;
          status?: Database["public"]["Enums"]["content_status"];
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          author_name?: string;
          author_role?: string | null;
          author_company?: string | null;
          quote?: string;
          rating?: number | null;
          title?: string | null;
          review_text?: string | null;
          project_name?: string | null;
          admin_response?: string | null;
          is_verified?: boolean;
          submitted_by?: string | null;
          avatar_url?: string | null;
          client_id?: string | null;
          project_id?: string | null;
          is_public?: boolean;
          is_active?: boolean;
          status?: Database["public"]["Enums"]["content_status"];
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      blog_categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      blog_tags: {
        Row: {
          id: string;
          slug: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          content: string;
          cover_image_url: string | null;
          author_id: string | null;
          category_id: string | null;
          reading_minutes: number | null;
          is_featured: boolean;
          is_active: boolean;
          status: Database["public"]["Enums"]["content_status"];
          published_at: string | null;
          seo_title: string | null;
          seo_description: string | null;
          og_image_url: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt?: string;
          content?: string;
          cover_image_url?: string | null;
          author_id?: string | null;
          category_id?: string | null;
          reading_minutes?: number | null;
          is_featured?: boolean;
          is_active?: boolean;
          status?: Database["public"]["Enums"]["content_status"];
          published_at?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          excerpt?: string;
          content?: string;
          cover_image_url?: string | null;
          author_id?: string | null;
          category_id?: string | null;
          reading_minutes?: number | null;
          is_featured?: boolean;
          is_active?: boolean;
          status?: Database["public"]["Enums"]["content_status"];
          published_at?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      blog_post_tags: {
        Row: {
          post_id: string;
          tag_id: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
        };
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          company: string | null;
          message: string;
          source_page: string | null;
          auth_user_id: string | null;
          status: Database["public"]["Enums"]["lead_status"];
          assigned_to: string | null;
          internal_notes: string | null;
          agreement_version_id: string | null;
          agreement_accepted_at: string | null;
          follow_up_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          message?: string;
          source_page?: string | null;
          auth_user_id?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
          assigned_to?: string | null;
          internal_notes?: string | null;
          agreement_version_id?: string | null;
          agreement_accepted_at?: string | null;
          follow_up_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          company?: string | null;
          message?: string;
          source_page?: string | null;
          auth_user_id?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
          assigned_to?: string | null;
          internal_notes?: string | null;
          agreement_version_id?: string | null;
          agreement_accepted_at?: string | null;
          follow_up_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quote_requests: {
        Row: {
          id: string;
          full_name: string;
          company: string | null;
          email: string;
          phone: string | null;
          whatsapp: string | null;
          location: string | null;
          project_type: string | null;
          platform: string | null;
          industry: string | null;
          budget_range: string | null;
          timeline: string | null;
          requirements: string;
          attachment_url: string | null;
          preferred_contact: "email" | "phone" | "whatsapp";
          consent: boolean;
          auth_user_id: string | null;
          status: Database["public"]["Enums"]["lead_status"];
          assigned_to: string | null;
          internal_notes: string | null;
          agreement_version_id: string | null;
          agreement_accepted_at: string | null;
          follow_up_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          company?: string | null;
          email: string;
          phone?: string | null;
          whatsapp?: string | null;
          location?: string | null;
          project_type?: string | null;
          platform?: string | null;
          industry?: string | null;
          budget_range?: string | null;
          timeline?: string | null;
          requirements?: string;
          attachment_url?: string | null;
          preferred_contact?: "email" | "phone" | "whatsapp";
          consent?: boolean;
          auth_user_id?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
          assigned_to?: string | null;
          internal_notes?: string | null;
          agreement_version_id?: string | null;
          agreement_accepted_at?: string | null;
          follow_up_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          company?: string | null;
          email?: string;
          phone?: string | null;
          whatsapp?: string | null;
          location?: string | null;
          project_type?: string | null;
          platform?: string | null;
          industry?: string | null;
          budget_range?: string | null;
          timeline?: string | null;
          requirements?: string;
          attachment_url?: string | null;
          preferred_contact?: "email" | "phone" | "whatsapp";
          consent?: boolean;
          auth_user_id?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
          assigned_to?: string | null;
          internal_notes?: string | null;
          agreement_version_id?: string | null;
          agreement_accepted_at?: string | null;
          follow_up_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      appointment_requests: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          preferred_date: string | null;
          preferred_time: string | null;
          topic: string | null;
          message: string;
          status: Database["public"]["Enums"]["lead_status"];
          internal_notes: string | null;
          follow_up_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          preferred_date?: string | null;
          preferred_time?: string | null;
          topic?: string | null;
          message?: string;
          status?: Database["public"]["Enums"]["lead_status"];
          internal_notes?: string | null;
          follow_up_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          preferred_date?: string | null;
          preferred_time?: string | null;
          topic?: string | null;
          message?: string;
          status?: Database["public"]["Enums"]["lead_status"];
          internal_notes?: string | null;
          follow_up_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_links: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          amount_label: string | null;
          url: string;
          client_id: string | null;
          project_id: string | null;
          is_active: boolean;
          expires_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          amount_label?: string | null;
          url: string;
          client_id?: string | null;
          project_id?: string | null;
          is_active?: boolean;
          expires_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          amount_label?: string | null;
          url?: string;
          client_id?: string | null;
          project_id?: string | null;
          is_active?: boolean;
          expires_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          id: string;
          bucket: string;
          storage_path: string;
          url: string;
          file_name: string;
          mime_type: string | null;
          size_bytes: number | null;
          alt_text: string;
          is_public: boolean;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bucket: string;
          storage_path: string;
          url: string;
          file_name: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          alt_text?: string;
          is_public?: boolean;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bucket?: string;
          storage_path?: string;
          url?: string;
          file_name?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          alt_text?: string;
          is_public?: boolean;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_email: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          summary: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          summary?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          action?: string;
          entity?: string;
          entity_id?: string | null;
          summary?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      social_links: {
        Row: {
          id: string;
          platform: string;
          label: string | null;
          url: string;
          is_active: boolean;
          sort_order: number;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          platform: string;
          label?: string | null;
          url: string;
          is_active?: boolean;
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          platform?: string;
          label?: string | null;
          url?: string;
          is_active?: boolean;
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      offers: {
        Row: {
          id: string;
          title: string;
          slug: string;
          short_description: string | null;
          full_description: string | null;
          image_url: string | null;
          original_price: number | null;
          offer_price: number | null;
          discount_label: string | null;
          offer_code: string | null;
          offer_type: string;
          free_or_paid: string;
          tags: Json;
          cta_label: string | null;
          cta_url: string | null;
          start_at: string | null;
          end_at: string | null;
          is_active: boolean;
          is_featured: boolean;
          popup_enabled: boolean;
          popup_priority: number;
          popup_frequency: string;
          popup_custom_hours: number | null;
          show_on_home: boolean;
          seo_title: string | null;
          seo_description: string | null;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          short_description?: string | null;
          full_description?: string | null;
          image_url?: string | null;
          original_price?: number | null;
          offer_price?: number | null;
          discount_label?: string | null;
          offer_code?: string | null;
          offer_type?: string;
          free_or_paid?: string;
          tags?: Json;
          cta_label?: string | null;
          cta_url?: string | null;
          start_at?: string | null;
          end_at?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          popup_enabled?: boolean;
          popup_priority?: number;
          popup_frequency?: string;
          popup_custom_hours?: number | null;
          show_on_home?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          deleted_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          short_description?: string | null;
          full_description?: string | null;
          image_url?: string | null;
          original_price?: number | null;
          offer_price?: number | null;
          discount_label?: string | null;
          offer_code?: string | null;
          offer_type?: string;
          free_or_paid?: string;
          tags?: Json;
          cta_label?: string | null;
          cta_url?: string | null;
          start_at?: string | null;
          end_at?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          popup_enabled?: boolean;
          popup_priority?: number;
          popup_frequency?: string;
          popup_custom_hours?: number | null;
          show_on_home?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          deleted_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          slug: string;
          summary: string | null;
          body: string | null;
          update_type: string;
          free_or_paid: string;
          price_label: string | null;
          image_url: string | null;
          icon: string | null;
          badge_label: string | null;
          cta_label: string | null;
          cta_url: string | null;
          is_active: boolean;
          start_at: string | null;
          end_at: string | null;
          priority: number;
          display_position: string;
          is_dismissible: boolean;
          seo_title: string | null;
          seo_description: string | null;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          published_at: string | null;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          summary?: string | null;
          body?: string | null;
          update_type?: string;
          free_or_paid?: string;
          price_label?: string | null;
          image_url?: string | null;
          icon?: string | null;
          badge_label?: string | null;
          cta_label?: string | null;
          cta_url?: string | null;
          is_active?: boolean;
          start_at?: string | null;
          end_at?: string | null;
          priority?: number;
          display_position?: string;
          is_dismissible?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          published_at?: string | null;
          deleted_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          summary?: string | null;
          body?: string | null;
          update_type?: string;
          free_or_paid?: string;
          price_label?: string | null;
          image_url?: string | null;
          icon?: string | null;
          badge_label?: string | null;
          cta_label?: string | null;
          cta_url?: string | null;
          is_active?: boolean;
          start_at?: string | null;
          end_at?: string | null;
          priority?: number;
          display_position?: string;
          is_dismissible?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          published_at?: string | null;
          deleted_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_methods: {
        Row: {
          id: string;
          title: string;
          url: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          url: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          url?: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      launch_benefits: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          icon: string | null;
          is_active: boolean;
          sort_order: number;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          icon?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          icon?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agreements: {
        Row: {
          id: string;
          title: string;
          slug: string;
          agreement_type: string;
          is_active: boolean;
          effective_from: string | null;
          current_version_id: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          agreement_type?: string;
          is_active?: boolean;
          effective_from?: string | null;
          current_version_id?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          agreement_type?: string;
          is_active?: boolean;
          effective_from?: string | null;
          current_version_id?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agreement_versions: {
        Row: {
          id: string;
          agreement_id: string;
          version_number: number;
          title: string;
          body: string;
          plain_text: string | null;
          pdf_path: string | null;
          checksum: string | null;
          effective_from: string | null;
          is_draft: boolean;
          change_note: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agreement_id: string;
          version_number: number;
          title: string;
          body: string;
          plain_text?: string | null;
          pdf_path?: string | null;
          checksum?: string | null;
          effective_from?: string | null;
          is_draft?: boolean;
          change_note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agreement_id?: string;
          version_number?: number;
          title?: string;
          body?: string;
          plain_text?: string | null;
          pdf_path?: string | null;
          checksum?: string | null;
          effective_from?: string | null;
          is_draft?: boolean;
          change_note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agreement_acceptances: {
        Row: {
          id: string;
          agreement_id: string;
          version_id: string;
          user_id: string | null;
          guest_identifier: string | null;
          accepted_at: string;
          context: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          related_table: string | null;
          related_id: string | null;
          ip_hash: string | null;
          user_agent: string | null;
          evidence_pdf_path: string | null;
          evidence_hash: string | null;
          consent_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          agreement_id: string;
          version_id: string;
          user_id?: string | null;
          guest_identifier?: string | null;
          accepted_at?: string;
          context: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          related_table?: string | null;
          related_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          evidence_pdf_path?: string | null;
          evidence_hash?: string | null;
          consent_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          agreement_id?: string;
          version_id?: string;
          user_id?: string | null;
          guest_identifier?: string | null;
          accepted_at?: string;
          context?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          related_table?: string | null;
          related_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          evidence_pdf_path?: string | null;
          evidence_hash?: string | null;
          consent_text?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string;
          address_line_1: string;
          address_line_2?: string | null;
          city: string;
          state: string;
          postal_code: string;
          country?: string;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          address_line_1?: string;
          address_line_2?: string | null;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: { required: Database["public"]["Enums"]["app_role"] };
        Returns: boolean;
      };
      my_role: {
        Args: Record<string, never>;
        Returns: Database["public"]["Enums"]["app_role"];
      };
    };
    Enums: {
      app_role: "super_admin" | "admin" | "editor" | "client";
      content_status: "draft" | "published";
      lead_status:
        "new" | "reviewing" | "contacted" | "qualified" | "proposal_sent" | "won" | "lost" | "spam";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
