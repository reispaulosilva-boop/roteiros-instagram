import Sidebar from '@/components/Sidebar';
import { getStats, getTranscribed, getVideos, formatNumber } from '@/lib/data';

export default function Dashboard() {
  const stats = getStats();
  const videos = getVideos();
  const transcribed = getTranscribed();

  const totalViews = videos.reduce((s, v) => s + (v.videoViewCount || 0), 0);
  const totalLikes = videos.reduce((s, v) => s + (v.likesCount || 0), 0);
  const totalComments = videos.reduce((s, v) => s + (v.commentsCount || 0), 0);
  const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
  const avgER = videos.length > 0
    ? (videos.reduce((s, v) => s + ((v.likesCount + v.commentsCount) / (v.videoViewCount || 1) * 100), 0) / videos.length).toFixed(2)
    : 0;

  // Top profiles
  const profileMap = {};
  for (const v of videos) {
    const u = v.ownerUsername || 'unknown';
    if (!profileMap[u]) profileMap[u] = { count: 0, views: 0, likes: 0, er: 0 };
    profileMap[u].count++;
    profileMap[u].views += v.videoViewCount || 0;
    profileMap[u].likes += v.likesCount || 0;
    profileMap[u].er += (v.likesCount + v.commentsCount) / (v.videoViewCount || 1) * 100;
  }

  const profiles = Object.entries(profileMap)
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgViews: Math.round(data.views / data.count),
      avgER: (data.er / data.count).toFixed(2),
    }))
    .sort((a, b) => b.avgViews - a.avgViews);

  // Language distribution 
  const langMap = {};
  for (const t of transcribed) {
    const l = t.languageDetected || 'other';
    langMap[l] = (langMap[l] || 0) + 1;
  }

  const langLabels = { pt: '🇧🇷 Português', en: '🇺🇸 English', es: '🇪🇸 Español' };

  // Top posts
  const topPosts = [...videos].slice(0, 5);

  // Total words
  const totalWords = transcribed.reduce((s, t) => s + (t.transcription ? t.transcription.split(' ').length : 0), 0);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral do banco de dados de conteúdo de dermatologia</p>
        </div>

        {/* Metric Cards */}
        <div className="card-grid card-grid-4" style={{ marginBottom: 32 }}>
          <div className="metric-card">
            <div className="metric-label">Total de Posts</div>
            <div className="metric-value">{stats.totalPosts}</div>
            <div className="metric-detail">{stats.totalVideos} vídeos • {stats.totalPosts - stats.totalVideos} outros</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Transcrições</div>
            <div className="metric-value">{transcribed.length}</div>
            <div className="metric-detail">{formatNumber(totalWords)} palavras transcritas</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Views Totais</div>
            <div className="metric-value">{formatNumber(totalViews)}</div>
            <div className="metric-detail">Média: {formatNumber(avgViews)}/vídeo</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Eng. Rate Médio</div>
            <div className="metric-value">{avgER}%</div>
            <div className="metric-detail">{formatNumber(totalLikes)} likes • {formatNumber(totalComments)} comentários</div>
          </div>
        </div>

        <div className="card-grid card-grid-2">
          {/* Profiles */}
          <div className="card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>👤 Perfis ({profiles.length})</h2>
            <div className="table-container" style={{ border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Perfil</th>
                    <th>Posts</th>
                    <th>Avg Views</th>
                    <th>Avg ER%</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(p => (
                    <tr key={p.name}>
                      <td style={{ fontWeight: 600 }}>@{p.name}</td>
                      <td>{p.count}</td>
                      <td>{formatNumber(p.avgViews)}</td>
                      <td>{p.avgER}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Languages */}
            <div className="card">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>🌐 Idiomas Detectados</h2>
              {Object.entries(langMap)
                .sort((a, b) => b[1] - a[1])
                .map(([lang, count]) => {
                  const pct = ((count / transcribed.length) * 100).toFixed(0);
                  return (
                    <div key={lang} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.88rem' }}>
                        <span>{langLabels[lang] || lang}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: lang === 'pt' ? 'var(--success)' : lang === 'en' ? 'var(--accent)' : 'var(--warning)',
                          borderRadius: 3,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Top Posts */}
            <div className="card">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>🔥 Top 5 Posts por Views</h2>
              {topPosts.map((p, i) => (
                <div key={p.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                  fontSize: '0.85rem',
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', marginRight: 8 }}>#{i + 1}</span>
                    <span style={{ fontWeight: 600 }}>@{p.ownerUsername}</span>
                  </div>
                  <div style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    {formatNumber(p.videoViewCount)} views
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
