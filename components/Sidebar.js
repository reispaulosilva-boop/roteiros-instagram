'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
    { href: '/', icon: '📊', label: 'Dashboard' },
    { href: '/library', icon: '📚', label: 'Biblioteca' },
    { href: '/reports', icon: '📈', label: 'Relatórios' },
    { href: '/generator', icon: '✨', label: 'Gerador IA' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <nav className="sidebar">
            <div className="sidebar-logo">Content Intelligence</div>
            <div className="sidebar-subtitle">Dermatologia Digital</div>

            <div className="nav-section">Menu</div>
            {NAV_ITEMS.map(({ href, icon, label }) => (
                <Link
                    key={href}
                    href={href}
                    className={`nav-link ${pathname === href ? 'active' : ''}`}
                >
                    <span className="icon">{icon}</span>
                    {label}
                </Link>
            ))}
        </nav>
    );
}
