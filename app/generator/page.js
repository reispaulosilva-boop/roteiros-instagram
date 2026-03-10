import Sidebar from '@/components/Sidebar';
import GeneratorClient from './GeneratorClient';

export default function GeneratorPage() {
    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">✨ Gerador de Roteiros com IA</h1>
                    <p className="page-subtitle">Crie roteiros otimizados baseados nos padrões que viralizam</p>
                </div>
                <GeneratorClient />
            </main>
        </div>
    );
}
