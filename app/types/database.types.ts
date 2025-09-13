import { Attachment } from '@ai-sdk/ui-utils';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      external_ai_tools: {
        Row: {
          id: string;
          name: string;
          description: string;
          website: string;
          logo: string | null;
          video_url: string | null;
          category_id: string;
          featured: boolean;
          pricing: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          website: string;
          logo?: string | null;
          video_url?: string | null;
          category_id: string;
          featured?: boolean;
          pricing?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          website?: string;
          logo?: string | null;
          video_url?: string | null;
          category_id?: string;
          featured?: boolean;
          pricing?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'external_ai_tools_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_external_ai_tools_category';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      app_settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      models: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          provider_id: string;
          provider_name: string;
          model_id: string;
          context_length: number | null;
          max_tokens: number | null;
          is_enabled: boolean;
          is_free: boolean;
          requires_api_key: boolean;
          capabilities: string[] | null;
          description: string | null;
          sort_order: number;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          provider_id: string;
          provider_name: string;
          model_id: string;
          context_length?: number | null;
          max_tokens?: number | null;
          is_enabled?: boolean;
          is_free?: boolean;
          requires_api_key?: boolean;
          capabilities?: string[] | null;
          description?: string | null;
          sort_order?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          provider_id?: string;
          provider_name?: string;
          model_id?: string;
          context_length?: number | null;
          max_tokens?: number | null;
          is_enabled?: boolean;
          is_free?: boolean;
          requires_api_key?: boolean;
          capabilities?: string[] | null;
          description?: string | null;
          sort_order?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          user_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          user_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_attachments: {
        Row: {
          chat_id: string;
          created_at: string;
          file_name: string | null;
          file_size: number | null;
          file_type: string | null;
          file_url: string;
          id: string;
          user_id: string;
        };
        Insert: {
          chat_id: string;
          created_at?: string;
          file_name?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          file_url: string;
          id?: string;
          user_id: string;
        };
        Update: {
          chat_id?: string;
          created_at?: string;
          file_name?: string | null;
          file_size?: number | null;
          file_type?: string | null;
          file_url?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_chat';
            columns: ['chat_id'];
            isOneToOne: false;
            referencedRelation: 'chats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      chats: {
        Row: {
          created_at: string | null;
          updated_at: string | null;
          id: string;
          model: string | null;
          project_id: string | null;
          title: string | null;
          user_id: string;
          public: boolean;
        };
        Insert: {
          created_at?: string | null;
          updated_at?: string | null;
          id?: string;
          model?: string | null;
          project_id?: string | null;
          title?: string | null;
          user_id: string;
          public?: boolean;
        };
        Update: {
          created_at?: string | null;
          updated_at?: string | null;
          id?: string;
          model?: string | null;
          project_id?: string | null;
          title?: string | null;
          user_id?: string;
          public?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'chats_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chats_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          experimental_attachments: Attachment[];
          chat_id: string;
          content: string | null;
          created_at: string | null;
          id: number;
          role: 'system' | 'user' | 'assistant' | 'data';
          parts: Json | null;
          user_id?: string | null;
          message_group_id: string | null;
          model: string | null;
          agent_id: string | null;
        };
        Insert: {
          experimental_attachments?: Attachment[];
          chat_id: string;
          content: string | null;
          created_at?: string | null;
          id?: number;
          role: 'system' | 'user' | 'assistant' | 'data';
          parts?: Json;
          user_id?: string | null;
          message_group_id?: string | null;
          model?: string | null;
          agent_id?: string | null;
        };
        Update: {
          experimental_attachments?: Attachment[];
          chat_id?: string;
          content?: string | null;
          created_at?: string | null;
          id?: number;
          role?: 'system' | 'user' | 'assistant' | 'data';
          parts?: Json;
          user_id?: string | null;
          message_group_id?: string | null;
          model?: string | null;
          agent_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          anonymous: boolean | null;
          created_at: string | null;
          daily_message_count: number | null;
          daily_reset: string | null;
          display_name: string | null;
          email: string;
          favorite_models: string[] | null;
          id: string;
          message_count: number | null;
          premium: boolean | null;
          profile_image: string | null;
          last_active_at: string | null;
          daily_pro_message_count: number | null;
          daily_pro_reset: string | null;
          system_prompt: string | null;
          is_admin: boolean | null;
        };
        Insert: {
          anonymous?: boolean | null;
          created_at?: string | null;
          daily_message_count?: number | null;
          daily_reset?: string | null;
          display_name?: string | null;
          email: string;
          favorite_models?: string[] | null;
          id: string;
          message_count?: number | null;
          premium?: boolean | null;
          profile_image?: string | null;
          last_active_at?: string | null;
          daily_pro_message_count?: number | null;
          daily_pro_reset?: string | null;
          system_prompt?: string | null;
          is_admin?: boolean | null;
        };
        Update: {
          anonymous?: boolean | null;
          created_at?: string | null;
          daily_message_count?: number | null;
          daily_reset?: string | null;
          display_name?: string | null;
          email?: string;
          favorite_models?: string[] | null;
          id?: string;
          message_count?: number | null;
          premium?: boolean | null;
          profile_image?: string | null;
          last_active_at?: string | null;
          daily_pro_message_count?: number | null;
          daily_pro_reset?: string | null;
          system_prompt?: string | null;
          is_admin?: boolean | null;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          created_at: string | null;
          id: string;
          message: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          message: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          message?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'feedback_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_keys: {
        Row: {
          user_id: string;
          provider: string;
          encrypted_key: string;
          iv: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          provider: string;
          encrypted_key: string;
          iv: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          provider?: string;
          encrypted_key?: string;
          iv?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_keys_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_preferences: {
        Row: {
          user_id: string;
          layout: string | null;
          prompt_suggestions: boolean | null;
          show_tool_invocations: boolean | null;
          show_conversation_previews: boolean | null;
          multi_model_enabled: boolean | null;
          hidden_models: string[] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          layout?: string | null;
          prompt_suggestions?: boolean | null;
          show_tool_invocations?: boolean | null;
          show_conversation_previews?: boolean | null;
          multi_model_enabled?: boolean | null;
          hidden_models?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          layout?: string | null;
          prompt_suggestions?: boolean | null;
          show_tool_invocations?: boolean | null;
          show_conversation_previews?: boolean | null;
          multi_model_enabled?: boolean | null;
          hidden_models?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_preferences_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      agents: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          system_prompt: string | null;
          model: string | null;
          avatar_url: string | null;
          is_public: boolean | null;
          user_id: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          system_prompt?: string | null;
          model?: string | null;
          avatar_url?: string | null;
          is_public?: boolean | null;
          user_id: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          system_prompt?: string | null;
          model?: string | null;
          avatar_url?: string | null;
          is_public?: boolean | null;
          user_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'agents_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          color: string | null;
          usage_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          color?: string | null;
          usage_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          color?: string | null;
          usage_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      external_ai_tool_tags: {
        Row: {
          tool_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          tool_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          tool_id?: string;
          tag_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'external_ai_tool_tags_tool_id_fkey';
            columns: ['tool_id'];
            isOneToOne: false;
            referencedRelation: 'external_ai_tools';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'external_ai_tool_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      agent_tags: {
        Row: {
          agent_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          agent_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          agent_id?: string;
          tag_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'agent_tags_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'agent_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      favorite_agents: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          agent_id?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'favorite_agents_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favorite_agents_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
        ];
      };
      user_agent_history: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_id: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          agent_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_agent_history_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_agent_history_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: Record<string, never>;
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
