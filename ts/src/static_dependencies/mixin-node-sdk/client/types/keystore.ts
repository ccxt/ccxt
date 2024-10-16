export interface AppKeystore {
    app_id: string;
    session_id: string;
    server_public_key: string;
    session_private_key: string;
  }
  
  export interface OAuthKeystore {
    app_id: string;
    scope: string;
    authorization_id: string;
    session_private_key: string;
  }
  
  export interface NetworkUserKeystore {
    app_id: string;
    session_id: string;
    session_private_key: string;
    pin_token_base64: string;
  }
  
  export type Keystore = AppKeystore | OAuthKeystore | NetworkUserKeystore;
  
  export default Keystore;