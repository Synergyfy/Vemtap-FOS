export interface SettingsData {
  currency: string;
  timezone: string;
  dateFormat: string;
  theme: string;
  paystackSecretKey: string;
  termiiApiKey: string;
}

export interface SettingsResponse {
  settings: SettingsData;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  type: string;
}

export interface TeamResponse {
  members: TeamMember[];
}
