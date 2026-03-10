'use client';
import { useState, useMemo } from 'react';

function formatNum(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
}

const LANG_BADGE = { pt: 'badge-pt', en: 'badge-en', es: 'badge-es' };
const LANG_LABEL = { pt: 'PT', en: 'EN', es: 'ES' };

export default function LibraryClient({ posts }) {
    const [search, setSearch] = useState('');
    const [langFilter, setLangFilter] = useState('');
    const [profileFilter, setProfileFilter] = useState('');
    const [sortBy, setSortBy] = useState('views');
    const [selectedPost, setSelectedPost] = useState(null);
    const [aiResult, setAiResult] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    const profiles = useMemo(() => [...new Set(posts.map(p => p.owner))].sort(), [posts]);

    const filtered = useMemo(() => {
        let result = posts;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(p =>
                p.transcription.toLowerCase().includes(q) ||
                p.owner.toLowerCase().includes(q) ||
                p.caption.toLowerCase().includes(q)
            );
        }
        if (langFilter) result = result.filter(p => p.lang === langFilter);
        if (profileFilter) result = result.filter(p => p.owner === profileFilter);

        result.sort((a, b) => {
            if (sortBy === 'views') return b.views - a.views;
            if (sortBy === 'er') return parseFloat(b.er) - parseFloat(a.er);
            if (sortBy === 'likes') return b.likes - a.likes;
            if (sortBy === 'words') return b.wordCount - a.wordCount;
            return 0;
        });

        return result;
    }, [posts, search, langFilter, profileFilter, sortBy]);

    async function callGemini(action, text) {
        setAiLoading(true);
        setAiResult('');
        try {
            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, text }),
            });
            const data = await res.json();
            setAiResult(data.result || data.error || 'Erro desconhecido');
        } catch (e) {
            setAiResult('Erro: ' + e.message);
        }
        setAiLoading(false);
    }

    return (
        <>
            {/* Search & Filters */}
            <div className="search-bar">
                <input
                    className="search-input"
                    type="text"
                    placeholder="🔍 Buscar nas transcrições, legendas ou perfis..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select value={langFilter} onChange={e => setLangFilter(e.target.value)}>
                    <option value="">Todos idiomas</option>
                    <option value="pt">🇧🇷 Português</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Español</option>
                </select>
                <select value={profileFilter} onChange={e => setProfileFilter(e.target.value)}>
                    <option value="">Todos perfis</option>
                    {profiles.map(p => <option key={p} value={p}>@{p}</option>)}
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="views">Ordenar: Views ↓</option>
                    <option value="er">Ordenar: ER% ↓</option>
                    <option value="likes">Ordenar: Likes ↓</option>
                    <option value="words">Ordenar: Palavras ↓</option>
                </select>
            </div>

            <div className="stats-bar">
                <div className="stat-item">📝 <strong>{filtered.length}</strong> transcrições</div>
                <div className="stat-item">👁️ <strong>{formatNum(filtered.reduce((s, p) => s + p.views, 0))}</strong> views totais</div>
                <div className="stat-item">📊 <strong>{filtered.length > 0 ? (filtered.reduce((s, p) => s + parseFloat(p.er), 0) / filtered.length).toFixed(2) : 0}%</strong> ER médio</div>
            </div>

            {/* Table */}
            <div className="table-container" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Perfil</th>
                            <th>Idioma</th>
                            <th>Transcrição</th>
                            <th style={{ cursor: 'pointer' }} onClick={() => setSortBy('views')}>Views {sortBy === 'views' ? '↓' : ''}</th>
                            <th style={{ cursor: 'pointer' }} onClick={() => setSortBy('er')}>ER% {sortBy === 'er' ? '↓' : ''}</th>
                            <th style={{ cursor: 'pointer' }} onClick={() => setSortBy('likes')}>Likes {sortBy === 'likes' ? '↓' : ''}</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.slice(0, 100).map(p => (
                            <tr key={p.id}>
                                <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>@{p.owner}</td>
                                <td><span className={`badge ${LANG_BADGE[p.lang] || 'badge-default'}`}>{LANG_LABEL[p.lang] || p.lang}</span></td>
                                <td className="table-text-clip" title={p.transcription}>{p.transcription.slice(0, 120)}...</td>
                                <td style={{ fontWeight: 600 }}>{formatNum(p.views)}</td>
                                <td>{p.er}%</td>
                                <td>{formatNum(p.likes)}</td>
                                <td>
                                    <button className="btn btn-sm btn-secondary" onClick={() => { setSelectedPost(p); setAiResult(''); }}>
                                        Abrir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length > 100 && (
                    <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Mostrando 100 de {filtered.length} resultados. Refine sua busca.
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedPost && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedPost(null); }}>
                    <div className="modal">
                        <div className="modal-header">
                            <div>
                                <div className="modal-title">@{selectedPost.owner}</div>
                                <span className={`badge ${LANG_BADGE[selectedPost.lang] || 'badge-default'}`} style={{ marginTop: 4 }}>
                                    {LANG_LABEL[selectedPost.lang] || selectedPost.lang}
                                </span>
                            </div>
                            <button className="modal-close" onClick={() => setSelectedPost(null)}>✕</button>
                        </div>

                        <div className="metric-row">
                            <div className="metric-mini"><div className="value">{formatNum(selectedPost.views)}</div><div className="label">Views</div></div>
                            <div className="metric-mini"><div className="value">{formatNum(selectedPost.likes)}</div><div className="label">Likes</div></div>
                            <div className="metric-mini"><div className="value">{formatNum(selectedPost.comments)}</div><div className="label">Comentários</div></div>
                            <div className="metric-mini"><div className="value">{selectedPost.er}%</div><div className="label">Eng. Rate</div></div>
                            <div className="metric-mini"><div className="value">{selectedPost.wordCount}</div><div className="label">Palavras</div></div>
                            <div className="metric-mini"><div className="value">{selectedPost.duration ? Math.round(selectedPost.duration) + 's' : '-'}</div><div className="label">Duração</div></div>
                        </div>

                        {selectedPost.caption && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12, padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                                <strong style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Legenda:</strong><br />
                                {selectedPost.caption}
                            </div>
                        )}

                        <h3 style={{ fontSize: '0.95rem', marginBottom: 8 }}>📝 Transcrição Completa</h3>
                        <div className="transcription-text">{selectedPost.transcription}</div>

                        {/* AI Section */}
                        <div className="ai-section">
                            <h3>✨ Inteligência Artificial (Gemini)</h3>
                            <div className="ai-actions">
                                <button className="btn btn-sm btn-primary" onClick={() => callGemini('translate', selectedPost.transcription)} disabled={aiLoading}>
                                    🌐 Traduzir p/ PT
                                </button>
                                <button className="btn btn-sm btn-primary" onClick={() => callGemini('summarize', selectedPost.transcription)} disabled={aiLoading}>
                                    📋 Resumir
                                </button>
                                <button className="btn btn-sm btn-primary" onClick={() => callGemini('extract_hooks', selectedPost.transcription)} disabled={aiLoading}>
                                    🎣 Extrair Hooks
                                </button>
                                <button className="btn btn-sm btn-primary" onClick={() => callGemini('generate_script', selectedPost.transcription)} disabled={aiLoading}>
                                    📝 Gerar Roteiro Inspirado
                                </button>
                            </div>
                            {aiLoading && (
                                <div className="ai-loading"><div className="spinner"></div> Processando com Gemini...</div>
                            )}
                            {aiResult && <div className="ai-result">{aiResult}</div>}
                        </div>

                        {selectedPost.url && (
                            <a href={selectedPost.url} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-block', marginTop: 16, color: 'var(--accent)', fontSize: '0.85rem' }}>
                                🔗 Ver no Instagram →
                            </a>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
