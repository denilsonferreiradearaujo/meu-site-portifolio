'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, defaultProfile, defaultProjects, getFullAssetUrl, getStoredToken, setStoredToken } from '@/services/api';
import { CustomSocialLink, ProfileData, ProjectData, ToastState } from '@/types';
import { Toast } from '@/components/common/Toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { SocialIcon } from '@/components/common/SocialIcon';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'profile' | 'social' | 'projects'>('profile');
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [projects, setProjects] = useState<ProjectData[]>(defaultProjects);

  // Custom socials state
  const [customSocialList, setCustomSocialList] = useState<CustomSocialLink[]>([]);

  // Project Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectCategory, setProjectCategory] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [projectImage, setProjectImage] = useState('');
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  const [toast, setToast] = useState<ToastState>({
    show: false,
    title: '',
    message: '',
    type: 'success',
  });

  const showToast = (title: string, message = '', type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setIsAuthenticated(true);
    }

    // Load initial data
    api.getProfile().then((data) => {
      setProfile(data);
      if (data.customSocials) {
        try {
          const parsed = JSON.parse(data.customSocials);
          if (Array.isArray(parsed)) setCustomSocialList(parsed);
        } catch {}
      }
    });
    api.getProjects().then((data) => setProjects(data));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Campos obrigatórios', 'Preencha o e-mail e a senha.', 'error');
      return;
    }

    try {
      setIsLoggingIn(true);
      await api.login(loginEmail, loginPassword);
      setIsAuthenticated(true);
      showToast('Bem-vindo, Denilson!', 'Login efetuado com sucesso.', 'success');
      const p = await api.getProfile();
      const proj = await api.getProjects();
      setProfile(p);
      setProjects(proj);
      if (p.customSocials) {
        try {
          const parsed = JSON.parse(p.customSocials);
          if (Array.isArray(parsed)) setCustomSocialList(parsed);
        } catch {}
      }
    } catch (err: any) {
      showToast('Falha no login', err.message || 'Credenciais inválidas.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setStoredToken(null);
    setIsAuthenticated(false);
    showToast('Sessão encerrada', 'Você saiu da área administrativa.', 'info');
  };

  // Profile save
  const handleSaveProfile = async () => {
    try {
      const { id, updatedAt, ...cleanProfile } = profile as any;
      const updated = await api.updateProfile(cleanProfile);
      setProfile(updated);
      showToast('Perfil atualizado', 'As alterações já estão salvas no banco de dados.', 'success');
    } catch (err: any) {
      showToast('Erro ao salvar', err.message || 'Verifique sua conexão ou autenticação.', 'error');
    }
  };

  // Social networks handlers
  const handleAddCustomSocial = () => {
    const newNetwork: CustomSocialLink = {
      id: Date.now().toString(),
      name: '',
      url: '',
      icon: 'globe',
    };
    setCustomSocialList((prev) => [...prev, newNetwork]);
  };

  const handleUpdateCustomSocial = (id: string, field: keyof CustomSocialLink, value: string) => {
    setCustomSocialList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveCustomSocial = (id: string) => {
    setCustomSocialList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveSocial = async () => {
    try {
      const customJson = JSON.stringify(customSocialList.filter((x) => x.url.trim()));
      const updated = await api.updateProfile({
        linkedin: profile.linkedin,
        github: profile.github,
        instagram: profile.instagram,
        email: profile.email,
        whatsapp: profile.whatsapp,
        customSocials: customJson,
      });
      setProfile(updated);
      showToast('Redes atualizadas', 'Todos os links e ícones foram salvos com sucesso.', 'success');
    } catch (err: any) {
      showToast('Erro ao salvar', err.message || 'Verifique sua conexão.', 'error');
    }
  };

  // Photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Enviando foto...', 'Fazendo upload seguro para o servidor.', 'info');
      const res = await api.uploadFile(file);
      const updated = await api.updateProfile({ photo: res.url });
      setProfile(updated);
      showToast('Foto atualizada', 'Sua foto de perfil foi alterada com sucesso.', 'success');
    } catch (err: any) {
      showToast('Erro no upload', err.message || 'Falha ao enviar arquivo.', 'error');
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const updated = await api.updateProfile({ photo: '' });
      setProfile(updated);
      showToast('Foto removida', 'A foto foi removida do seu perfil.', 'info');
    } catch (err: any) {
      showToast('Erro ao remover', err.message, 'error');
    }
  };

  // Project modal handlers
  const handleOpenNewProjectModal = () => {
    handleResetProjectForm();
    setIsModalOpen(true);
  };

  const handleOpenEditProjectModal = (proj: ProjectData) => {
    setEditingProjectId(proj.id);
    setProjectTitle(proj.title);
    setProjectCategory(proj.category);
    setProjectDescription(proj.description);
    setProjectUrl(proj.url);
    setProjectImage(proj.image);
    setPendingImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    handleResetProjectForm();
  };

  const handleResetProjectForm = () => {
    setEditingProjectId(null);
    setProjectTitle('');
    setProjectCategory('');
    setProjectDescription('');
    setProjectUrl('');
    setProjectImage('');
    setPendingImageFile(null);
  };

  const handleProjectFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingImageFile(file);
      showToast('Imagem selecionada', 'Pronta para ser salva com o projeto.', 'info');
    }
  };

  const handleSaveProject = async () => {
    if (!projectTitle.trim()) {
      showToast('Título obrigatório', 'Informe o nome do projeto antes de salvar.', 'error');
      return;
    }
    if (!projectUrl.trim() || !/^https?:\/\//i.test(projectUrl.trim())) {
      showToast('Link inválido', 'Use um endereço iniciado por http:// ou https://.', 'error');
      return;
    }

    try {
      setIsSavingProject(true);
      let finalImageUrl = projectImage;

      if (pendingImageFile) {
        showToast('Enviando capa...', 'Aguarde o upload da imagem...', 'info');
        const uploadRes = await api.uploadFile(pendingImageFile);
        finalImageUrl = uploadRes.url;
      }

      if (editingProjectId) {
        await api.updateProject(editingProjectId, {
          title: projectTitle,
          category: projectCategory,
          description: projectDescription,
          url: projectUrl,
          image: finalImageUrl,
        });
        showToast('Projeto atualizado', 'As alterações foram salvas com sucesso.', 'success');
      } else {
        await api.createProject({
          title: projectTitle,
          category: projectCategory,
          description: projectDescription,
          url: projectUrl,
          image: finalImageUrl,
        });
        showToast('Projeto criado', 'Novo projeto adicionado ao portfólio.', 'success');
      }

      handleCloseModal();
      const freshProjects = await api.getProjects();
      setProjects(freshProjects);
    } catch (err: any) {
      showToast('Erro ao salvar projeto', err.message || 'Verifique os dados ou conexão.', 'error');
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o projeto "${title}"?`)) {
      return;
    }

    try {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast('Projeto excluído', 'O projeto foi removido com sucesso.', 'success');
    } catch (err: any) {
      showToast('Erro ao excluir', err.message, 'error');
    }
  };

  return (
    <>
      <Sidebar />

      <main className="app">
        <section className="screen active">
          <div className="admin">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px',
              }}
            >
              <div>
                <h1>Configurações</h1>
                <p>Gerencie o conteúdo do seu portfólio através de uma aplicação segura.</p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Link
                  href="/"
                  className="btn ghost"
                  style={{ minHeight: '40px', padding: '8px 16px', fontSize: '13px' }}
                >
                  ← Ver Portfólio
                </Link>
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="btn ghost"
                    style={{
                      minHeight: '40px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      borderColor: '#d43c3c',
                      color: '#d43c3c',
                    }}
                  >
                    Encerrar Sessão
                  </button>
                )}
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="adminCard" style={{ marginTop: '30px', maxWidth: '520px' }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '24px' }}>🔒 Acesso Administrativo</h2>

                <form onSubmit={handleLogin}>
                  <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="field">
                      <label>E-mail</label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Digite seu e-mail"
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Senha</label>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Digite sua senha"
                        required
                      />
                    </div>
                  </div>

                  <div className="actions">
                    <button type="submit" className="btn" disabled={isLoggingIn}>
                      {isLoggingIn ? 'Entrando...' : 'Entrar no Painel ↗'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="tabs">
                  <button
                    className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    Perfil
                  </button>
                  <button
                    className={`tab ${activeTab === 'social' ? 'active' : ''}`}
                    onClick={() => setActiveTab('social')}
                  >
                    Redes
                  </button>
                  <button
                    className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
                    onClick={() => setActiveTab('projects')}
                  >
                    Projetos
                  </button>
                </div>

                {/* ABA PERFIL */}
                {activeTab === 'profile' && (
                  <div className="adminCard">
                    <div className="grid">
                      <div className="field">
                        <label>Nome</label>
                        <input
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label>Cargo / Subtítulo do Topo</label>
                        <input
                          value={profile.role || ''}
                          placeholder="Ex: Desenvolvedor de Software e Soluções"
                          onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label>Etiqueta</label>
                        <input
                          value={profile.status}
                          onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                        />
                      </div>
                      <div className="field full">
                        <label>Título principal</label>
                        <textarea
                          value={profile.title}
                          onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                        />
                      </div>
                      <div className="field full">
                        <label>Resumo inicial</label>
                        <textarea
                          value={profile.intro}
                          onChange={(e) => setProfile({ ...profile, intro: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label>Título Sobre</label>
                        <input
                          value={profile.aboutTitle}
                          onChange={(e) => setProfile({ ...profile, aboutTitle: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label>Anos de experiência</label>
                        <input
                          value={profile.years}
                          onChange={(e) => setProfile({ ...profile, years: e.target.value })}
                        />
                      </div>
                      <div className="field full">
                        <label>Texto Sobre</label>
                        <textarea
                          value={profile.aboutText}
                          onChange={(e) => setProfile({ ...profile, aboutText: e.target.value })}
                        />
                      </div>
                      <div className="field full">
                        <label>Texto lateral Sobre</label>
                        <textarea
                          value={profile.aboutSide}
                          onChange={(e) => setProfile({ ...profile, aboutSide: e.target.value })}
                        />
                      </div>
                      <div className="field full">
                        <label>Tecnologias separadas por vírgula</label>
                        <input
                          value={profile.skills}
                          onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                        />
                      </div>
                      <div className="field">
                        <label>URL do currículo</label>
                        <input
                          value={profile.cv}
                          onChange={(e) => setProfile({ ...profile, cv: e.target.value })}
                          placeholder="/uploads/... ou https://..."
                        />
                      </div>
                      <div className="field">
                        <label>Chamada de contato</label>
                        <input
                          value={profile.contact}
                          onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
                        />
                      </div>
                      <div className="field full">
                        <label>Foto de perfil</label>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                        {profile.photo && (
                          <small style={{ color: 'var(--muted)', marginTop: '4px' }}>
                            Foto atual: <code>{profile.photo}</code>
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="actions">
                      <button className="btn" onClick={handleSaveProfile}>
                        Salvar perfil
                      </button>
                      <button className="btn ghost" onClick={handleRemovePhoto}>
                        Remover foto
                      </button>
                    </div>
                  </div>
                )}

                {/* ABA REDES */}
                {activeTab === 'social' && (
                  <div className="adminCard">
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Redes Principais</h3>
                    <div className="grid">
                      <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <SocialIcon nameOrUrl="linkedin" size={14} /> LinkedIn
                        </label>
                        <input
                          value={profile.linkedin}
                          onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                      <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <SocialIcon nameOrUrl="github" size={14} /> GitHub
                        </label>
                        <input
                          value={profile.github}
                          onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                          placeholder="https://github.com/..."
                        />
                      </div>
                      <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <SocialIcon nameOrUrl="instagram" size={14} /> Instagram
                        </label>
                        <input
                          value={profile.instagram}
                          onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <SocialIcon nameOrUrl="email" size={14} /> E-mail
                        </label>
                        <input
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          placeholder="de.faraujo@hotmail.com"
                        />
                      </div>
                      <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <SocialIcon nameOrUrl="whatsapp" size={14} /> WhatsApp
                        </label>
                        <input
                          value={profile.whatsapp || ''}
                          onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                          placeholder="https://wa.me/5519999486552"
                        />
                      </div>
                    </div>

                    {/* REDES ADICIONAIS COM BOTÃO + */}
                    <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '15px',
                        }}
                      >
                        <div>
                          <h3 style={{ margin: 0, fontSize: '18px' }}>Redes Adicionais</h3>
                          <small style={{ color: 'var(--muted)' }}>
                            Adicione outras redes ou links personalizados (WhatsApp, YouTube, etc.)
                          </small>
                        </div>
                        <button
                          type="button"
                          className="btn"
                          onClick={handleAddCustomSocial}
                          style={{ minHeight: '38px', padding: '8px 16px', fontSize: '13px' }}
                        >
                          ➕ Adicionar Rede
                        </button>
                      </div>

                      {customSocialList.length === 0 ? (
                        <p style={{ color: 'var(--muted)', fontSize: '13px', fontStyle: 'italic' }}>
                          Nenhuma rede adicional cadastrada. Clique em "+ Adicionar Rede" acima.
                        </p>
                      ) : (
                        <div style={{ display: 'grid', gap: '12px' }}>
                          {customSocialList.map((item) => (
                            <div
                              key={item.id}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '140px 1fr 130px auto',
                                gap: '10px',
                                alignItems: 'center',
                                background: 'var(--bg)',
                                padding: '12px',
                                borderRadius: '12px',
                                border: '1px solid var(--line)',
                              }}
                            >
                              <div>
                                <input
                                  value={item.name}
                                  onChange={(e) =>
                                    handleUpdateCustomSocial(item.id, 'name', e.target.value)
                                  }
                                  placeholder="Nome (ex: WhatsApp)"
                                  style={{ width: '100%' }}
                                />
                              </div>
                              <div>
                                <input
                                  value={item.url}
                                  onChange={(e) =>
                                    handleUpdateCustomSocial(item.id, 'url', e.target.value)
                                  }
                                  placeholder="URL do link (https://...)"
                                  style={{ width: '100%' }}
                                />
                              </div>
                              <div>
                                <select
                                  value={item.icon || 'globe'}
                                  onChange={(e) =>
                                    handleUpdateCustomSocial(item.id, 'icon', e.target.value)
                                  }
                                  style={{
                                    width: '100%',
                                    padding: '11px',
                                    borderRadius: '10px',
                                    background: 'var(--panel)',
                                    color: 'var(--text)',
                                    border: '1px solid var(--line)',
                                  }}
                                >
                                  <option value="globe">🌐 Site / Link</option>
                                  <option value="whatsapp">💬 WhatsApp</option>
                                  <option value="youtube">📺 YouTube</option>
                                  <option value="twitter">🐦 Twitter / X</option>
                                  <option value="linkedin">💼 LinkedIn</option>
                                  <option value="github">🐙 GitHub</option>
                                  <option value="instagram">📸 Instagram</option>
                                  <option value="email">✉️ E-mail</option>
                                </select>
                              </div>
                              <div>
                                <button
                                  type="button"
                                  className="tiny danger"
                                  onClick={() => handleRemoveCustomSocial(item.id)}
                                  title="Remover rede"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="actions" style={{ marginTop: '24px' }}>
                      <button className="btn" onClick={handleSaveSocial}>
                        Salvar redes
                      </button>
                    </div>
                  </div>
                )}

                {/* ABA PROJETOS: LISTA VISUAL + MODAL */}
                {activeTab === 'projects' && (
                  <div className="adminCard">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        marginBottom: '20px',
                        paddingBottom: '16px',
                        borderBottom: '1px solid var(--line)',
                      }}
                    >
                      <div>
                        <h3 style={{ margin: 0, fontSize: '20px' }}>
                          Projetos Cadastrados ({projects.length})
                        </h3>
                        <small style={{ color: 'var(--muted)' }}>
                          Visualize, edite ou adicione novos projetos exibidos no carrossel.
                        </small>
                      </div>

                      <button
                        className="btn"
                        onClick={handleOpenNewProjectModal}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        ➕ Novo Projeto
                      </button>
                    </div>

                    {projects.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                        <p>Nenhum projeto cadastrado no momento.</p>
                        <button className="btn" onClick={handleOpenNewProjectModal}>
                          ➕ Cadastrar Primeiro Projeto
                        </button>
                      </div>
                    ) : (
                      <div className="projectsVisualGrid">
                        {projects.map((proj) => {
                          const imageUrl = getFullAssetUrl(proj.image);
                          return (
                            <div key={proj.id} className="projectAdminCard">
                              <div className="projectAdminCardMedia">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={proj.title}
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      display: 'grid',
                                      placeItems: 'center',
                                      height: '100%',
                                      color: '#ffffff88',
                                      fontWeight: 800,
                                      fontSize: '28px',
                                    }}
                                  >
                                    DA
                                  </div>
                                )}
                              </div>
                              <div className="projectAdminCardBody">
                                <small>{proj.category}</small>
                                <h4>{proj.title}</h4>
                                <p>{proj.description}</p>
                                <div className="projectAdminCardActions">
                                  <button
                                    className="tiny"
                                    onClick={() => handleOpenEditProjectModal(proj)}
                                    style={{ flex: 1 }}
                                  >
                                    ✏️ Editar
                                  </button>
                                  <button
                                    className="tiny danger"
                                    onClick={() => handleDeleteProject(proj.id, proj.title)}
                                  >
                                    🗑️ Excluir
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* MODAL DIALOG PARA NOVO / EDITAR PROJETO */}
      {isModalOpen && (
        <div className="modalOverlay" onClick={handleCloseModal}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h3>{editingProjectId ? '✏️ Editar Projeto' : '➕ Novo Projeto'}</h3>
              <button className="modalCloseBtn" onClick={handleCloseModal} aria-label="Fechar">
                ×
              </button>
            </div>

            <div className="grid">
              <div className="field">
                <label>Título do Projeto</label>
                <input
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Ex: Gestor de Riscos"
                  autoFocus
                />
              </div>

              <div className="field">
                <label>Categoria</label>
                <input
                  value={projectCategory}
                  onChange={(e) => setProjectCategory(e.target.value)}
                  placeholder="Ex: Dashboard corporativo"
                />
              </div>

              <div className="field full">
                <label>Descrição</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Descrição das funcionalidades e impacto do projeto."
                  rows={3}
                />
              </div>

              <div className="field full">
                <label>Link do projeto (URL)</label>
                <input
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  placeholder="https://personaltasks.vps6663.panel.icontainer.run/"
                />
              </div>

              <div className="field">
                <label>URL da imagem (opcional)</label>
                <input
                  value={projectImage}
                  onChange={(e) => setProjectImage(e.target.value)}
                  placeholder="/uploads/... ou https://..."
                />
              </div>

              <div className="field full">
                <label>Ou envie uma imagem do seu computador</label>
                <input type="file" accept="image/*" onChange={handleProjectFileUpload} />
                {pendingImageFile && (
                  <small style={{ color: 'var(--text)', marginTop: '4px', fontWeight: 600 }}>
                    Arquivo pronto para envio: {pendingImageFile.name}
                  </small>
                )}
              </div>
            </div>

            <div className="actions" style={{ justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn ghost" onClick={handleCloseModal} disabled={isSavingProject}>
                Cancelar
              </button>
              <button className="btn" onClick={handleSaveProject} disabled={isSavingProject}>
                {isSavingProject
                  ? 'Salvando...'
                  : editingProjectId
                  ? 'Salvar Alterações'
                  : 'Cadastrar Projeto'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />
    </>
  );
}
