import Sidebar from '@/components/Sidebar';
import { getTranscribed, formatNumber } from '@/lib/data';
import LibraryClient from './LibraryClient';

export default function LibraryPage() {
    const posts = getTranscribed();

    // Serialize for client component
    const serialized = posts.map(p => ({
        id: p.id,
        owner: p.ownerUsername || 'unknown',
        url: p.url || '',
        caption: (p.caption || '').slice(0, 300),
        views: p.videoViewCount || 0,
        likes: p.likesCount || 0,
        comments: p.commentsCount || 0,
        er: p.videoViewCount > 0 ? (((p.likesCount || 0) + (p.commentsCount || 0)) / p.videoViewCount * 100).toFixed(2) : '0',
        lang: p.languageDetected || '',
        transcription: p.transcription || '',
        duration: p.videoDuration || 0,
        wordCount: (p.transcription || '').split(' ').length,
    }));

    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">📚 Biblioteca de Transcrições</h1>
                    <p className="page-subtitle">{serialized.length} transcrições com métricas de engajamento</p>
                </div>
                <LibraryClient posts={serialized} />
            </main>
        </div>
    );
}
