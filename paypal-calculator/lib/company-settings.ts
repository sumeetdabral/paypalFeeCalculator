export interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  website?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  logo?: string; // base64 encoded image or URL
  taxId?: string;
  registrationNumber?: string;
}

const COMPANY_SETTINGS_KEY = 'paypal-calculator-company-settings';

const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: 'Your Company Name',
  email: 'billing@yourcompany.com',
  phone: '+1 (555) 123-4567',
  website: '',
  address: {
    street: '123 Business St',
    city: 'City',
    state: 'State',
    zipCode: '12345',
    country: 'Country'
  },
  logo: '',
  taxId: '',
  registrationNumber: ''
};

export class CompanySettingsStorage {
  static getSettings(): CompanySettings {
    if (typeof window === 'undefined') return DEFAULT_COMPANY_SETTINGS;
    
    const stored = localStorage.getItem(COMPANY_SETTINGS_KEY);
    if (!stored) return DEFAULT_COMPANY_SETTINGS;
    
    try {
      const settings = JSON.parse(stored);
      return { ...DEFAULT_COMPANY_SETTINGS, ...settings };
    } catch (error) {
      console.error('Error parsing company settings:', error);
      return DEFAULT_COMPANY_SETTINGS;
    }
  }

  static saveSettings(settings: CompanySettings): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(settings));
  }

  static resetToDefaults(): CompanySettings {
    if (typeof window === 'undefined') return DEFAULT_COMPANY_SETTINGS;
    localStorage.removeItem(COMPANY_SETTINGS_KEY);
    return DEFAULT_COMPANY_SETTINGS;
  }

  static exportSettings(): string {
    const settings = this.getSettings();
    return JSON.stringify(settings, null, 2);
  }

  static importSettings(jsonData: string): boolean {
    try {
      const settings = JSON.parse(jsonData);
      
      // Validate required fields
      if (!settings.name || !settings.email) {
        throw new Error('Invalid settings: name and email are required');
      }
      
      this.saveSettings({ ...DEFAULT_COMPANY_SETTINGS, ...settings });
      return true;
    } catch (error) {
      console.error('Error importing company settings:', error);
      return false;
    }
  }
}

export function formatCompanyAddress(address: CompanySettings['address']): string {
  const parts = [
    address.street,
    [address.city, address.state, address.zipCode].filter(Boolean).join(', '),
    address.country
  ].filter(Boolean);
  
  return parts.join('\n');
}