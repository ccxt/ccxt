export interface AddressResponse {
    type: 'address';
    address_id: string;
    asset_id: string;
    destination: string;
    tag: string;
    label: string;
    fee: string;
    reserve: string;
    dust: string;
    updated_at: string;
  }
  
  export interface AddressRequest {
    asset_id: string;
    label: string;
    /** alias public_key */
    destination: string;
    /** alias memo */
    tag?: string;
  }
  
  export interface MixAddress {
    members: string[];
    threshold: number;
  }