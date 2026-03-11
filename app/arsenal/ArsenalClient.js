'use client';
import { useState, useMemo } from 'react';

function formatNum(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
}

export default function ArsenalClient({ posts }) {
    const [search, setSearch] = useState('');
    const [topicFilter, setTopicFilter] = useState('');
    const [profileFilter, setProfileFilter] = useState('');
    const [sortBy, setSortBy] = useState('date_desc');
    const [selectedPost, setSelectedPost] = useState(null);

    // AI State
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 50;

    const profiles = useMemo(() => [...new Set(posts.map(p => p.owner))].sort(), [posts]);
    const topics = useMemo(() => [...new Set(posts.map(p => p.topic))].sort(), [posts]);

    const filtered = useMemo(() => {
        let result = posts;

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(p =>
                p.transcription.toLowerCase().includes(q) ||
                p.caption.toLowerCase().includes(q)
            );
        }

        if (topicFilter) result = result.filter(p => p.topic === topicFilter);
        if (profileFilter) result = result.filter(p => p.owner === profileFilter);

        result.sort((a, b) => {
            if (sortBy === 'views_desc') return b.views - a.views;
            if (sortBy === 'views_asc') return a.views - b.views;
            if (sortBy === 'date_desc') return b.timestamp - a.timestamp;
            if (sortBy === 'date_asc') return a.timestamp - b.timestamp;
            return 0;
        });

        return result;
    }, [posts, search, topicFilter, profileFilter, sortBy]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
    const paginatedPosts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <>
            {/* Search & Filters */}
            <div className="search-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <input
                    className="search-input"
                    style={{ flexLast: 1, minWidth: '250px' }}
                    type="text"
                    placeholder="🔍 Buscar palavras na transcrição ou legenda..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                />
                <select value={topicFilter} onChange={e => { setTopicFilter(e.target.value); setCurrentPage(1); }}>
                    <option value="">🎯 Todos os Temas</option>
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={profileFilter} onChange={e => { setProfileFilter(e.target.value); setCurrentPage(1); }}>
                    <option value="">👤 Todos os Perfis</option>
                    {profiles.map(p => <option key={p} value={p}>@{p}</option>)}
                </select>
                <select value={sortBy} onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}>
                    <option value="date_desc">📅 Mais Recentes</option>
                    <option value="date_asc">📅 Mais Antigos</option>
                    <option value="views_desc">👁️ Mais Views</option>
                    <option value="views_asc">👁️ Menos Views</option>
                </select>
            </div>

            <div className="stats-bar">
                <div className="stat-item">📝 <strong>{filtered.length}</strong> vídeos encontrados</div>
                <div className="stat-item">👁️ <strong>{formatNum(filtered.reduce((s, p) => s + p.views, 0))}</strong> views totais</div>
            </div>

            {/* Table */}
            <div className="table-container" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                <table>
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 10 }}>
                        <tr>
                            <th>Data</th>
                            <th>Tema</th>
                            <th>Perfil</th>
                            <th style={{ cursor: 'pointer' }} onClick={() => { setSortBy(sortBy === 'views_desc' ? 'views_asc' : 'views_desc'); setCurrentPage(1); }}>
                                Views {sortBy.includes('views') ? (sortBy === 'views_desc' ? '↓' : '↑') : ''}
                            </th>
                            <th>Trecho (Transcrição)</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedPosts.map(p => (
                            <tr key={p.id}>
                                <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{p.date}</td>
                                <td>
                                    <span className="badge badge-default" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {p.topic}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>@{p.owner}</td>
                                <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{formatNum(p.views)}</td>
                                <td className="table-text-clip" title={p.transcription} style={{ maxWidth: '300px' }}>
                                    {p.transcription.slice(0, 80)}...
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-secondary" onClick={() => setSelectedPost(p)}>
                                        Ler Tudo
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', position: 'sticky', bottom: 0 }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Mostrando {filtered.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0} a {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de {filtered.length} vídeos
                    </div>
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                                className="btn btn-sm btn-secondary"
                                disabled={currentPage === 1}
                                onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); document.querySelector('.table-container').scrollTo(0, 0); }}
                            >
                                ← Anterior
                            </button>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 8px' }}>
                                Página <strong>{currentPage}</strong> de {totalPages}
                            </span>
                            <button
                                className="btn btn-sm btn-secondary"
                                disabled={currentPage === totalPages}
                                onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); document.querySelector('.table-container').scrollTo(0, 0); }}
                            >
                                Seguinte →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal View */}
            {selectedPost && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedPost(null); }}>
                    <div className="modal">
                        <div className="modal-header">
                            <div>
                                <div className="modal-title">@{selectedPost.owner} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>• {selectedPost.date}</span></div>
                                <span className="badge badge-en" style={{ marginTop: 4 }}>
                                    Tema: {selectedPost.topic}
                                </span>
                            </div>
                            <button className="modal-close" onClick={() => { setSelectedPost(null); setAiResult(''); }}>✕</button>
                        </div>

                        <div className="metric-row">
                            <div className="metric-mini"><div className="value">{formatNum(selectedPost.views)}</div><div className="label">Views</div></div>
                            <div className="metric-mini"><div className="value">{formatNum(selectedPost.likes)}</div><div className="label">Likes</div></div>
                            <div className="metric-mini"><div className="value">{selectedPost.duration ? Math.round(selectedPost.duration) + 's' : '-'}</div><div className="label">Duração</div></div>
                        </div>

                        {selectedPost.caption && (
                            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16, padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--border)' }}>
                                <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>📝 Legenda do Post:</strong><br /><br />
                                {selectedPost.caption}
                            </div>
                        )}

                        <h3 style={{ fontSize: '1rem', marginBottom: 12, color: 'var(--accent)' }}>🎙️ Transcrição Completa</h3>
                        <div className="transcription-text" style={{ fontSize: '1.05rem', lineHeight: '1.6', color: '#fff' }}>
                            {selectedPost.transcription}
                        </div>

                        {/* AI Gemini Integration */}
                        <div style={{ marginTop: 24, padding: '20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: aiResult ? 16 : 0 }}>
                                <div>
                                    <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>✨ Inteligência Artificial Gemini</h4>
                                    <p style={{ margin: 0, marginTop: 4, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Deixe a IA analisar e melhorar este script para o seu próximo vídeo.</p>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}
                                    disabled={aiLoading}
                                    onClick={async () => {
                                        setAiLoading(true);
                                        setAiResult('');
                                        try {
                                            const textToProcess = `Legenda: ${selectedPost.caption}\n\nTranscrição Áudio: ${selectedPost.transcription}`;
                                            const prompt = `Analise este conteúdo de dermatologia (legenda e áudio do vídeo original).
O objetivo é criar uma VERSÃO MELHORADA focado em engajamento.

O que eu preciso como resposta (formato markdown):
1. [Avaliação Rápida]: O que foi bem feito e o que faltou nesse vídeo.
2. [O Hook de Ouro]: Dê 3 opções de ganchos super chamativos (hooks) para começar o vídeo.
3. [Novo Roteiro Aprimorado]: Um roteiro passo a passo (de 45 segundos) melhorando a explicação, mais direto ao ponto, com CTA no final.

Conteúdo:
${textToProcess}`;

                                            const res = await fetch('/api/gemini', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ prompt })
                                            });
                                            if (!res.ok) throw new Error('Erro na API Gemini');
                                            const data = await res.json();
                                            setAiResult(data.text);
                                        } catch (e) {
                                            console.error(e);
                                            setAiResult('❌ Erro ao conectar com o Gemini. Verifique a API Key.');
                                        } finally {
                                            setAiLoading(false);
                                        }
                                    }}
                                >
                                    {aiLoading ? '⏳ Analisando...' : 'Avaliar e Melhorar com Gemini'}
                                </button>
                            </div>

                            {aiResult && (
                                <div className="transcription-text" style={{
                                    background: '#1a1b26',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(139, 92, 246, 0.5)',
                                    marginTop: '16px',
                                    color: '#fff',
                                    fontSize: '0.95rem'
                                }}>
                                    <div dangerouslySetInnerHTML={{ __html: aiResult.replace(/\\n/g, '<br/>') }} />
                                </div>
                            )}
                        </div>

                        {selectedPost.url && (
                            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                                <a href={selectedPost.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-block' }}>
                                    🔗 Abrir Vídeo no Instagram →
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
