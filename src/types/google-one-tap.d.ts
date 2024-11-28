declare namespace google {
  namespace accounts {
    namespace id {
      interface CredentialResponse {
        credential: string;
        select_by?: string;
      }

      interface GsiButtonConfiguration {
        type: 'standard' | 'icon';
        theme?: 'outline' | 'filled_blue' | 'filled_black';
        size?: 'large' | 'medium' | 'small';
        text?: string;
        shape?: 'rectangular' | 'pill' | 'circle' | 'square';
        logo_alignment?: 'left' | 'center';
        width?: string;
        local?: string;
      }

      interface InitConfiguration {
        client_id: string;
        callback: (response: CredentialResponse) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        prompt_parent_id?: string;
        nonce?: string;
        context?: string;
        state_cookie_domain?: string;
        ux_mode?: 'popup' | 'redirect';
        allowed_parent_origin?: string | string[];
        intermediate_iframe_close_callback?: () => void;
      }
    }
  }
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: google.accounts.id.InitConfiguration) => void;
          prompt: () => void;
          renderButton: (
            parent: HTMLElement,
            options: google.accounts.id.GsiButtonConfiguration,
            handler?: () => void
          ) => void;
          disableAutoSelect: () => void;
          storeCredential: (credential: { id: string; password: string }) => void;
          cancel: () => void;
          onGoogleLibraryLoad: () => void;
        };
      };
    };
  }
}

export interface CredentialResponse extends google.accounts.id.CredentialResponse {}
export interface GsiButtonConfiguration extends google.accounts.id.GsiButtonConfiguration {}
export interface InitConfiguration extends google.accounts.id.InitConfiguration {} 