export type UserRole = 'estudiante' | 'docente' | 'admin';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          avatar_url: string | null;
          activo?: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          avatar_url?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          avatar_url?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      unidades: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          orden: number;
          certificado_umbral_pct?: number | null;
          cover_image_url?: string | null;
          cover_video_url?: string | null;
          accent_color?: string | null;
          intro_extended?: string | null;
          visual_theme?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          orden: number;
          certificado_umbral_pct?: number | null;
          cover_image_url?: string | null;
          cover_video_url?: string | null;
          accent_color?: string | null;
          intro_extended?: string | null;
          visual_theme?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          orden?: number;
          certificado_umbral_pct?: number | null;
          cover_image_url?: string | null;
          cover_video_url?: string | null;
          accent_color?: string | null;
          intro_extended?: string | null;
          visual_theme?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      temas: {
        Row: {
          id: string;
          unidad_id: string;
          title: string;
          content: string | null;
          orden: number;
          prerequisito_tema_id?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          unidad_id: string;
          title: string;
          content?: string | null;
          orden: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          unidad_id?: string;
          title?: string;
          content?: string | null;
          orden?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      recursos: {
        Row: {
          id: string;
          tema_id: string;
          tipo: 'imagen' | 'mapa' | 'video';
          url: string;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tema_id: string;
          tipo: 'imagen' | 'mapa' | 'video';
          url: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tema_id?: string;
          tipo?: 'imagen' | 'mapa' | 'video';
          url?: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Unidad = Database['public']['Tables']['unidades']['Row'];
export type Tema = Database['public']['Tables']['temas']['Row'];
export type Recurso = Database['public']['Tables']['recursos']['Row'];
