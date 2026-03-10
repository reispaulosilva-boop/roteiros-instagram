import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export function getPosts() {
    const file = path.join(DATA_DIR, 'posts.json');
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function getStats() {
    const file = path.join(DATA_DIR, 'stats.json');
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function getAnalysis(name) {
    const file = path.join(DATA_DIR, 'analyses', `${name}.json`);
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function getVideos() {
    const posts = getPosts();
    return posts.filter(p => p.type === 'Video' && p.videoViewCount > 0);
}

export function getTranscribed() {
    const posts = getPosts();
    return posts.filter(p => p.transcription && p.transcription.trim() !== '' && p.transcription.trim() !== '...');
}

export function formatNumber(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
}
