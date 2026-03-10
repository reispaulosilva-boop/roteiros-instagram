'use client';
import { useState } from 'react';

function fmt(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return typeof n === 'number' ? n.toLocaleString() : String(n);
}

export default function ReportsClient({ hookCategories, topHooksPT, topHooksViews, topHooksER, benchmarkOverview }) {
    const [tab, setTab] = useState('hooks');

    return (
        <>
            <div className="tabs">
                <button className={`tab ${tab === 'hooks' ? 'active' : ''}`} onClick={() => setTab('hooks')}>🎣 Hooks</button>
                <button className={`tab ${tab === 'topics' ? 'active' : ''}`} onClick={() => setTab('topics')}>📊 Temas</button>
                <button className={`tab ${tab === 'tone' ? 'active' : ''}`} onClick={() => setTab('tone')}>🎙️ Tom</button>
                <button className={`tab ${tab === 'scripts' ? 'active' : ''}`} onClick={() => setTab('scripts')}>📝 Roteiro</button>
                <button className={`tab ${tab === 'benchmark' ? 'active' : ''}`} onClick={() => setTab('benchmark')}>🏅 Benchmark</button>
            </div>

            {/* HOOKS TAB */}
            {tab === 'hooks' && (
                <div>
                    <div className="report-section">
                        <h2>📊 Desempenho por Categoria de Hook</h2>
                        <div className="insight-box">
                            <strong>Listas numeradas</strong> ("3 dicas para...") têm ER de <strong>28.7%</strong> — 5x acima da média!
                            <strong> "Se você [problema]..."</strong> gera <strong>14% ER</strong>.
                        </div>
                        <div className="table-container">
                            <table>
                                <thead><tr><th>Categoria</th><th>Posts</th><th>Avg Views</th><th>Avg ER%</th></tr></thead>
                                <tbody>
                                    {hookCategories.sort((a, b) => b.avg_views - a.avg_views).map((c, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600 }}>{c.category}</td>
                                            <td>{c.count}</td>
                                            <td>{fmt(Math.round(c.avg_views))}</td>
                                            <td style={{ color: c.avg_er > 10 ? 'var(--success)' : c.avg_er > 5 ? 'var(--accent)' : 'inherit' }}>
                                                {c.avg_er.toFixed(2)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card-grid card-grid-2" style={{ marginTop: 32 }}>
                        <div className="report-section">
                            <h2>🇧🇷 Top Hooks em Português</h2>
                            {topHooksPT.map((h, i) => (
                                <div key={i} style={{ margin: '12px 0', padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--success)' }}>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                        #{i + 1} • {fmt(h.views)} views • ER {h.engagement_rate}% • @{h.owner}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>"{h.hook}"</div>
                                </div>
                            ))}
                        </div>
                        <div className="report-section">
                            <h2>🔥 Top Hooks por Engajamento</h2>
                            {topHooksER.map((h, i) => (
                                <div key={i} style={{ margin: '12px 0', padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent)' }}>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                        #{i + 1} • ER {h.engagement_rate}% • {fmt(h.views)} views • @{h.owner}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>"{h.hook}"</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TOPICS TAB */}
            {tab === 'topics' && (
                <div className="report-section">
                    <h2>📊 Temas que Viralizam</h2>
                    <div className="insight-box">
                        <strong>Poros</strong> = tema mais engajante (ER 11.4%). <strong>Cabelo & Queda</strong> = maior média de views (370K).
                        <strong> Botox, Laser e Preenchimento</strong> têm alta demanda mas poucos criadores cobrindo.
                    </div>
                    <div className="card-grid card-grid-3" style={{ marginTop: 20 }}>
                        {[
                            { tema: 'Poros', views: '367K', er: '11.4%', posts: 46, emoji: '⭐' },
                            { tema: 'Cabelo & Queda', views: '370K', er: '5.6%', posts: 117, emoji: '💇' },
                            { tema: 'Manchas', views: '367K', er: '6.1%', posts: 90, emoji: '🎯' },
                            { tema: 'Colágeno', views: '345K', er: '5.7%', posts: 184, emoji: '✨' },
                            { tema: 'Acne', views: '328K', er: '6.9%', posts: 99, emoji: '🔴' },
                            { tema: 'Skincare', views: '303K', er: '5.2%', posts: 225, emoji: '🧴' },
                            { tema: 'Botox', views: '138K', er: '6.0%', posts: 16, emoji: '💉' },
                            { tema: 'Proteção Solar', views: '289K', er: '4.2%', posts: 111, emoji: '☀️' },
                            { tema: 'Suplementos', views: '226K', er: '5.0%', posts: 124, emoji: '💊' },
                        ].map((t, i) => (
                            <div className="metric-card" key={i}>
                                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{t.emoji}</div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{t.tema}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                    {t.posts} posts • Avg {t.views} views
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: parseFloat(t.er) > 8 ? 'var(--success)' : 'var(--accent)', marginTop: 4 }}>
                                    ER {t.er}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TONE TAB */}
            {tab === 'tone' && (
                <div className="report-section">
                    <h2>🎙️ Tom & Linguagem</h2>
                    <div className="insight-box">
                        <strong>Tom conversacional</strong> gera <strong>78% mais engajamento</strong> que o técnico (7.0% vs 3.9%).
                        O combo vencedor é <strong>termos técnicos + linguagem informal</strong>.
                    </div>
                    <div className="card-grid card-grid-2" style={{ marginTop: 20 }}>
                        {[
                            { tom: 'Conversacional', er: '7.04%', views: '250K', desc: 'Informal, direto, "gente olha"' },
                            { tom: 'Educativo Acessível', er: '5.43%', views: '280K', desc: 'Técnico mas simples' },
                            { tom: 'Alarmista/Urgente', er: '5.67%', views: '247K', desc: '"Pare!", "Cuidado!"' },
                            { tom: 'Educativo Técnico', er: '3.95%', views: '283K', desc: 'Formal, científico' },
                            { tom: 'Storytelling', er: '4.87%', views: '218K', desc: 'Narrativa pessoal' },
                            { tom: 'Autoridade Médica', er: '3.48%', views: '163K', desc: '"Eu como médico..."' },
                        ].map((t, i) => (
                            <div className="card" key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{t.tom}</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t.desc}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: parseFloat(t.er) > 5 ? 'var(--success)' : 'var(--accent)' }}>{t.er}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Avg {t.views} views</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="insight-box" style={{ marginTop: 24 }}>
                        <strong>Receita do Tom Ideal:</strong> Frases curtas (≤18 palavras) + falar COM o espectador ("você") + 1-2 termos técnicos + informalidade ("gente", "olha") + vídeos de 100-250 palavras.
                    </div>
                </div>
            )}

            {/* SCRIPTS TAB */}
            {tab === 'scripts' && (
                <div className="report-section">
                    <h2>📝 Estrutura de Roteiro</h2>
                    <div className="insight-box">
                        <strong>DIAGNÓSTICO→RECEITA</strong> tem o maior ER (11.3%). <strong>TUTORIAL</strong> tem mais views (346K).
                        Sweet spot: <strong>31-60 segundos</strong> e <strong>100-200 palavras</strong>.
                    </div>
                    <div className="card-grid card-grid-3" style={{ marginTop: 20 }}>
                        {[
                            { nome: 'Diagnóstico→Receita', er: '11.3%', views: '188K', template: 'HOOK: "Se você tem X..." → PROBLEMA → RECEITA → FINAL' },
                            { nome: 'Tutorial/Listicle', er: '4.7%', views: '346K', template: 'HOOK: "3 dicas..." → ITEM 1 → ITEM 2 → ITEM 3 → CTA' },
                            { nome: 'Problema→Solução', er: '5.9%', views: '236K', template: 'HOOK-ALERTA → PROBLEMA → SOLUÇÃO → CONCLUSÃO' },
                            { nome: 'Demonstração', er: '4.1%', views: '285K', template: 'HOOK: "Olha isso" → VISUAL → EXPLICAÇÃO' },
                            { nome: 'Review/Recomendação', er: '4.3%', views: '254K', template: 'HOOK → PRODUTO → BENEFÍCIOS → CTA' },
                            { nome: 'Pergunta→Resposta', er: '4.3%', views: '154K', template: 'HOOK: "Por que X?" → EXPLICAÇÃO → RESPOSTA' },
                        ].map((t, i) => (
                            <div className="card" key={i}>
                                <div style={{ fontWeight: 700, marginBottom: 8 }}>{t.nome}</div>
                                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: parseFloat(t.er) > 8 ? 'var(--success)' : 'var(--accent)' }}>ER {t.er}</span>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', alignSelf: 'center' }}>{t.views} views</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace', background: 'var(--bg-primary)', padding: 8, borderRadius: 4 }}>
                                    {t.template}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* BENCHMARK TAB */}
            {tab === 'benchmark' && (
                <div className="report-section">
                    <h2>🏅 Benchmark Competitivo</h2>
                    <div className="insight-box">
                        <strong>@dra.cristinasalaro</strong> = melhor perfil geral (476K views + 9.4% ER).
                        <strong> @clinicavolpe</strong> = campeão de engajamento PT-BR (9.1% ER).
                    </div>
                    <div className="table-container" style={{ marginTop: 20 }}>
                        <table>
                            <thead>
                                <tr><th>Perfil</th><th>Vídeos</th><th>Avg Views</th><th>Avg ER%</th><th>Viral%</th></tr>
                            </thead>
                            <tbody>
                                {benchmarkOverview.sort((a, b) => b.avg_views - a.avg_views).map((p, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600 }}>@{p.owner}</td>
                                        <td>{p.videos}</td>
                                        <td>{fmt(Math.round(p.avg_views))}</td>
                                        <td style={{ color: p.avg_er > 7 ? 'var(--success)' : 'inherit', fontWeight: p.avg_er > 7 ? 700 : 400 }}>
                                            {p.avg_er.toFixed(2)}%
                                        </td>
                                        <td>{p.viral_rate.toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="insight-box" style={{ marginTop: 24 }}>
                        <strong>Lacunas:</strong> Botox (0 posts), Poros (ER 11.4% sem dono), Laser/Procedimentos (alta demanda, zero cobertura).
                    </div>
                </div>
            )}
        </>
    );
}
