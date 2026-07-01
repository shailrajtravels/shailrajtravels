export interface Author {
  id: string;
  name: string;
  role: string;
  yearsOfExperience: number;
  bio: string;
  avatarUrl: string;
  expertiseAreas: string[];
  regionsCovered: string[];
  languages: string[];
  contactProfileUrl?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
}
