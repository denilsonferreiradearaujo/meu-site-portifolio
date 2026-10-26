import { ProfileData, ProjectData, LoginResponse } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export const defaultProfile: ProfileData = {
  id: 'default-profile',
  name: 'Denilson Ferreira de Araujo',
  role: 'Desenvolvedor de Software e Soluções',
  status: 'Disponível para novos projetos',
  title: 'Transformando visão em realidade com código e experiência.',
  intro:
    'Desenvolvedor de soluções digitais com experiência em operações, logística, indicadores e aplicações corporativas. Projetos feitos para resolver problemas reais do negócio.',
  aboutTitle: 'Tecnologia com visão de negócio.',
  aboutSide:
    'Uma carreira construída entre operação, análise e desenvolvimento de soluções.',
  aboutText:
    'Minha trajetória combina experiência profissional com desenvolvimento de software, automação, dados e melhoria contínua.',
  years: '20+',
  skills:
    'HTML, CSS, JavaScript, React, Node.js, NestJS, PostgreSQL, MySQL, Power BI, Excel, Dashboards, Logística',
  cv: '/CV_Denilson_Ferreira_de_Araujo_Desenvolvedor_2026_ (1).pdf',
  contact: 'Tem uma ideia? Vamos transformar em projeto.',
  photo: '/FotoPerfil.webp',
  linkedin: '',
  github: '',
  instagram: '',
  email: 'de.faraujo@hotmail.com',
  whatsapp: 'https://wa.me/5519999486552',
  customSocials: '[]',
};

export const defaultProjects: ProjectData[] = [
  {
    id: '1',
    title: 'Agendador de Tarefas',
    category: 'Kanban e Gantt',
    description:
      'Organização de atividades com visualizações em Kanban e Gantt.',
    url: 'https://personaltasks.vps6663.panel.icontainer.run/',
    image: '/Designer.webp',
    orderIndex: 1,
  },
  {
    id: '2',
    title: 'Monitoramento de Estoque',
    category: 'Dashboard corporativo',
    description:
      'Painel de cadastro e monitoramento de estoque para centros de distribuição.',
    url: 'https://dashestoque.vps6663.panel.icontainer.run/',
    image: '',
    orderIndex: 2,
  },
  {
    id: '3',
    title: 'Gerenciamento de Riscos',
    category: 'Governança e controle',
    description:
      'Aplicação para registrar riscos e acompanhar planos de ação.',
    url: 'https://gestorcrises.vps6663.panel.icontainer.run/',
    image: '/Gestor risco.webp',
    orderIndex: 3,
  },
];

export function getFullAssetUrl(path: string | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  if (path.startsWith('/uploads/')) {
    return `${BACKEND_BASE}${path}`;
  }
  return path;
}

export function formatExternalUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('#')
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('denilson_portfolio_token');
}

export function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('denilson_portfolio_token', token);
  } else {
    localStorage.removeItem('denilson_portfolio_token');
  }
}

function translateErrorMessage(msg: string): string {
  if (!msg) return 'Ocorreu um erro inesperado.';
  
  if (msg.includes('should not exist')) {
    return 'Propriedades de controle não permitidas foram ignoradas.';
  }
  if (msg.includes('Unauthorized') || msg.includes('jwt') || msg.includes('token') || msg.includes('401')) {
    return 'Sessão expirada ou não autorizada. Por favor, faça login novamente.';
  }
  if (msg.includes('Invalid credentials') || msg.includes('Credenciais')) {
    return 'E-mail ou senha incorretos.';
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
    return 'Não foi possível conectar ao servidor. Verifique se o backend está ativo.';
  }
  if (msg.includes('must be a string')) {
    return 'Formato de texto inválido.';
  }
  if (msg.includes('Internal server error')) {
    return 'Erro interno do servidor. Tente novamente mais tarde.';
  }
  return msg;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Erro na requisição (${response.status}): ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (Array.isArray(errorData.message)) {
        errorMsg = errorData.message.map(translateErrorMessage).join(', ');
      } else if (errorData.message) {
        errorMsg = translateErrorMessage(errorData.message);
      }
    } catch {}
    throw new Error(translateErrorMessage(errorMsg));
  }

  return response.json();
}

export const api = {
  async getProfile(): Promise<ProfileData> {
    try {
      return await request<ProfileData>('/profile');
    } catch (err) {
      console.warn('Backend indisponível, usando fallback de perfil:', err);
      return defaultProfile;
    }
  },

  async updateProfile(data: Partial<ProfileData>): Promise<ProfileData> {
    const { id, updatedAt, ...payload } = data as any;
    return request<ProfileData>('/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async getProjects(): Promise<ProjectData[]> {
    try {
      return await request<ProjectData[]>('/projects');
    } catch (err) {
      console.warn('Backend indisponível, usando fallback de projetos:', err);
      return defaultProjects;
    }
  },

  async createProject(data: Omit<ProjectData, 'id'>): Promise<ProjectData> {
    return request<ProjectData>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProject(id: string, data: Partial<ProjectData>): Promise<ProjectData> {
    return request<ProjectData>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProject(id: string): Promise<void> {
    return request<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.accessToken);
    return res;
  },

  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    const token = getStoredToken();
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Falha ao enviar arquivo');
    }

    return response.json();
  },
};
