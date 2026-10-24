export interface ProfileData {
  id: string;
  name: string;
  role?: string;
  status: string;
  title: string;
  intro: string;
  aboutTitle: string;
  aboutSide: string;
  aboutText: string;
  years: string;
  skills: string;
  cv: string;
  contact: string;
  photo: string;
  linkedin: string;
  github: string;
  instagram: string;
  email: string;
  whatsapp?: string;
  customSocials?: string;
}

export interface CustomSocialLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

export interface ProjectData {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  image: string;
  orderIndex?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  user: AuthUser;
}

export interface ToastState {
  show: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
