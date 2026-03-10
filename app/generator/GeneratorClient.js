'use client';
import { useState } from 'react';

const TEMPLATES = [
    { id: 'diagnostico', name: '🩺 Diagnóstico→Receita', er: '11.3%', desc: '"Se você tem X, faça Y" — Maior ER' },
    { id: 'listicle', name: '🔢 Listicle/Tutorial', er: '4.7%', desc: '"3 dicas para..." — Mais views' },
    { id: 'problema', name: '⚠️ Problema→Solução', er: '5.9%', desc: '"Nunca faça isso!" — Impactante' },
    { id: 'review', name: '📦 Review/Recomendação', er: '4.3%', desc: 'Produto + benefícios' },
    { id: 'livre', name: '✏️ Roteiro Livre', er: '-', desc: 'Descreva o que quiser' },
];

const TOPICS = [
    'Acne', 'Colágeno/Anti-aging', 'Botox', 'Preenchimento', 'Protetor Solar',
    'Manchas', 'Cabelo & Queda', 'Skincare/Rotina', 'Laser/Procedimentos',
    'Poros', 'Suplementos', 'Corpo & Estrias', 'Unhas',
];

export default function GeneratorClient() {
    const [topic, setTopic] = useState('');
    const [template, setTemplate] = useState('diagnostico');
    const [duration, setDuration] = useState('30-60');
    const [customPrompt, setCustomPrompt] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);

    async function generate() {
        setLoading(true);
        setResult('');

        const selectedTemplate = TEMPLATES.find(t => t.id === template);

        let prompt = '';
        if (template === 'livre') {
            prompt = customPrompt;
        } else {
            prompt = `Crie um roteiro de Reel de dermatologia com estas especificações:
- TEMA: ${topic || 'dermatologia geral'}
- ESTRUTURA: ${selectedTemplate.name}
- DURAÇÃO: ${duration} segundos
${customPrompt ? `- INSTRUÇÕES ADICIONAIS: ${customPrompt}` : ''}

O roteiro deve ser em português brasileiro, com linguagem conversacional mas usando 1-2 termos técnicos para credibilidade.
Inclua timestamps [00s], [05s], etc.
Use o tom de @clinicavolpe (informal, direto, com credibilidade médica).`;
        }

        const context = `Dados de performance reais:
- Hooks com lista numerada: 28.7% ER
- "Se você tem [problema]": 14% ER 
- Tom conversacional: 7% ER (vs 3.9% técnico)
- Sweet spot: 31-60s, 100-200 palavras
- Referência direta ao espectador ("você") aumenta ER
- Informalidade + termos técnicos = combo vencedor
- Top perfis PT-BR: @clinicavolpe (9.3% ER), @dra.cristinasalaro (9.3% ER)`;

        try {
            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate_script', prompt, context }),
            });
            const data = await res.json();
            const text = data.result || data.error || 'Erro desconhecido';
            setResult(text);
            setHistory(prev => [{ topic, template: selectedTemplate.name, result: text, timestamp: new Date().toLocaleTimeString() }, ...prev]);
        } catch (e) {
            setResult('Erro: ' + e.message);
        }
        setLoading(false);
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(result);
    }

    return (
        <>
            <div className="card-grid card-grid-2">
                {/* Form */}
                <div className="card">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>⚙️ Configuração</h2>

                    <div className="generator-form">
                        <div className="form-group">
                            <label>Tema</label>
                            <select value={topic} onChange={e => setTopic(e.target.value)} style={{ width: '100%' }}>
                                <option value="">Selecione um tema...</option>
                                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Estrutura do Roteiro</label>
                            {TEMPLATES.map(t => (
                                <label key={t.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                                    background: template === t.id ? 'var(--accent-glow)' : 'var(--bg-primary)',
                                    border: `1px solid ${template === t.id ? 'var(--accent)' : 'var(--border)'}`,
                                    borderRadius: 'var(--radius-sm)', marginBottom: 6, cursor: 'pointer',
                                    transition: 'var(--transition)',
                                }}>
                                    <input type="radio" name="template" value={t.id} checked={template === t.id}
                                        onChange={e => setTemplate(e.target.value)} style={{ accentColor: 'var(--accent)' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{t.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.desc}</div>
                                    </div>
                                    {t.er !== '-' && <span className="badge badge-en">ER {t.er}</span>}
                                </label>
                            ))}
                        </div>

                        <div className="form-group">
                            <label>Duração</label>
                            <select value={duration} onChange={e => setDuration(e.target.value)} style={{ width: '100%' }}>
                                <option value="15-30">15-30 segundos (curto)</option>
                                <option value="30-60">30-60 segundos (ideal)</option>
                                <option value="60-90">60-90 segundos (longo)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Instruções adicionais (opcional)</label>
                            <textarea
                                value={customPrompt}
                                onChange={e => setCustomPrompt(e.target.value)}
                                placeholder="Ex: foque em tratamento caseiro, mencione ácido hialurônico, estilo polêmico..."
                                style={{ minHeight: 80 }}
                            />
                        </div>

                        <button className="btn btn-primary" onClick={generate} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                            {loading ? '⏳ Gerando...' : '✨ Gerar Roteiro'}
                        </button>
                    </div>
                </div>

                {/* Result */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>📝 Roteiro Gerado</h2>
                            {result && (
                                <button className="btn btn-sm btn-secondary" onClick={copyToClipboard}>📋 Copiar</button>
                            )}
                        </div>

                        {loading && (
                            <div className="ai-loading" style={{ justifyContent: 'center', padding: 40 }}>
                                <div className="spinner"></div> Gerando roteiro otimizado com IA...
                            </div>
                        )}

                        {result ? (
                            <div className="generated-script">{result}</div>
                        ) : !loading && (
                            <div className="empty-state">
                                <div className="icon">✨</div>
                                <p>Configure seu roteiro e clique em Gerar</p>
                                <p style={{ fontSize: '0.82rem', marginTop: 8, color: 'var(--text-muted)' }}>
                                    O Gemini utilizará os insights dos 5 eixos de análise
                                </p>
                            </div>
                        )}
                    </div>

                    {/* History */}
                    {history.length > 0 && (
                        <div className="card">
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>📜 Histórico ({history.length})</h3>
                            {history.slice(0, 5).map((h, i) => (
                                <div key={i} style={{
                                    padding: '8px 12px', marginBottom: 6, background: 'var(--bg-primary)',
                                    borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.82rem',
                                }} onClick={() => setResult(h.result)}>
                                    <span style={{ color: 'var(--text-muted)' }}>{h.timestamp}</span>
                                    {' • '}
                                    <span style={{ fontWeight: 600 }}>{h.topic || 'Livre'}</span>
                                    {' • '}
                                    <span style={{ color: 'var(--text-secondary)' }}>{h.template}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
