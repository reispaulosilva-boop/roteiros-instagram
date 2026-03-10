import Sidebar from '@/components/Sidebar';
import { getAnalysis } from '@/lib/data';
import ReportsClient from './ReportsClient';

export default function ReportsPage() {
    const hooks = getAnalysis('hooks');
    const benchmark = getAnalysis('benchmark');

    // Extract key data for client
    const hookCategories = hooks?.summary?.categories || [];
    const topHooksPT = (hooks?.top_20_pt || []).slice(0, 10);
    const topHooksViews = (hooks?.top_50_by_views || []).slice(0, 10);
    const topHooksER = (hooks?.top_20_engagement || []).slice(0, 10);
    const benchmarkOverview = benchmark?.overview || [];

    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">📈 Relatórios Analíticos</h1>
                    <p className="page-subtitle">Insights dos 5 eixos de análise baseados em dados reais</p>
                </div>
                <ReportsClient
                    hookCategories={hookCategories}
                    topHooksPT={topHooksPT}
                    topHooksViews={topHooksViews}
                    topHooksER={topHooksER}
                    benchmarkOverview={benchmarkOverview}
                />
            </main>
        </div>
    );
}
