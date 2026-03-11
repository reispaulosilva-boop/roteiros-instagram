import Sidebar from '@/components/Sidebar';
import { getTranscribed } from '@/lib/data';
import ArsenalClient from './ArsenalClient';

export default function ArsenalPage() {
    const posts = getTranscribed();

    // Keyword mapping to detect topics
    const TOPICS_MAP = {
        'Acne & Espinhas': ['acne', 'espinha', 'comedão', 'comedoes', 'roacutan', 'cravos', 'espinhas', 'effaclar'],
        'Cabelo & Queda': ['cabelo', 'queda', 'minoxidil', 'alopecia', 'calvície', 'caspa', 'fios', 'couro cabeludo', 'shampoo'],
        'Manchas & Melasma': ['mancha', 'melasma', 'clareador', 'hiperpigmentação', 'azelaico'],
        'Colágeno & Rugas': ['colágeno', 'ruga', 'anti-aging', 'envelhecimento', 'flacidez', 'bioestimulador', 'radiesse', 'sculptra', 'retinol'],
        'Procedimentos': ['botox', 'preenchimento', 'toxina', 'ácido hialurônico', 'laser', 'lavieen', 'ultraformer', 'harmonização'],
        'Poros': ['poros', 'poro', 'filamentos sebáceos', 'poros dilatados'],
        'Suor & Corpo': ['suor', 'axila', 'desodorante', 'perspirex', 'estria', 'celulite', 'corporal', 'chulé'],
        'Skincare/Protetor': ['skincare', 'rotina', 'sabonete', 'hidratante', 'vitamina c', 'protetor solar', 'filtro solar', 'niacinamida', 'pele oleosa', 'pele seca'],
        'Unhas': ['unha', 'micose', 'esmalte']
    };

    function detectTopic(text, caption) {
        const combined = (text + ' ' + (caption || '')).toLowerCase();
        let bestTopic = 'Outros';

        // Find the first matching topic (or we could score them, but first match is fine)
        for (const [topic, keywords] of Object.entries(TOPICS_MAP)) {
            if (keywords.some(k => combined.includes(k))) {
                return topic;
            }
        }
        return bestTopic;
    }

    // Serialize for client
    const serialized = posts.map(p => {
        // published date from timestamp or empty
        const dateStr = p.timestamp ? new Date(p.timestamp).toLocaleDateString('pt-BR') : 'Desconhecida';

        return {
            id: p.id,
            date: dateStr,
            timestamp: p.timestamp ? new Date(p.timestamp).getTime() : 0,
            topic: detectTopic(p.transcription, p.caption),
            owner: p.ownerUsername || 'unknown',
            url: p.url || '',
            caption: (p.caption || '').slice(0, 300),
            views: p.videoViewCount || 0,
            likes: p.likesCount || 0,
            duration: p.videoDuration || 0,
            transcription: p.transcription || '',
        };
    });

    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">⚔️ Arsenal de Conteúdo</h1>
                    <p className="page-subtitle">Visão macro de {serialized.length} vídeos com temas, views e datas</p>
                </div>
                <ArsenalClient posts={serialized} />
            </main>
        </div>
    );
}
