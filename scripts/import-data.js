#!/usr/bin/env node
/**
 * Data Import Script
 * Consolidates Instagram datasets + transcriptions into a unified posts.json
 * Run: node scripts/import-data.js <path-to-instagram-folder>
 */
const fs = require('fs');
const path = require('path');

const sourceDir = process.argv[2] || path.join(__dirname, '..', '..');
const outputDir = path.join(__dirname, '..', 'data');

console.log(`📂 Source: ${sourceDir}`);
console.log(`📁 Output: ${outputDir}`);

// 1. Load all dataset files
const datasetFiles = fs.readdirSync(sourceDir)
    .filter(f => f.startsWith('dataset_') && f.endsWith('.json'))
    .sort();

console.log(`\n📊 Found ${datasetFiles.length} dataset files`);

const postsMap = {};
for (const file of datasetFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(sourceDir, file), 'utf8'));
    for (const post of data) {
        const id = String(post.id);
        if (!postsMap[id]) {
            postsMap[id] = post;
        }
    }
}
console.log(`   Total unique posts: ${Object.keys(postsMap).length}`);

// 2. Load transcriptions
const transFile = path.join(sourceDir, 'transcricoes.json');
let transcriptions = {};
if (fs.existsSync(transFile)) {
    transcriptions = JSON.parse(fs.readFileSync(transFile, 'utf8'));
    console.log(`\n📝 Transcriptions loaded: ${Object.keys(transcriptions).length}`);
}

// 3. Merge into unified format
const posts = [];
for (const [id, post] of Object.entries(postsMap)) {
    const trans = transcriptions[id] || {};

    posts.push({
        id,
        type: post.type || 'Unknown',
        shortCode: post.shortCode || '',
        url: post.url || '',
        caption: post.caption || '',
        hashtags: post.hashtags || [],
        ownerUsername: post.ownerUsername || trans.ownerUsername || 'unknown',
        ownerFullName: post.ownerFullName || '',
        ownerId: post.ownerId || '',
        ownerFollowerCount: post.ownerFollowerCount || 0,
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        videoViewCount: post.videoViewCount || 0,
        videoPlayCount: post.videoPlayCount || 0,
        videoDuration: post.videoDuration || 0,
        timestamp: post.timestamp || '',
        displayUrl: post.displayUrl || '',
        // Transcription data
        transcription: trans.transcription || '',
        languageDetected: trans.language_detected || '',
        segments: trans.segments || [],
    });
}

// Sort by views descending
posts.sort((a, b) => (b.videoViewCount || 0) - (a.videoViewCount || 0));

// 4. Save consolidated posts
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(path.join(outputDir, 'analyses'), { recursive: true });

fs.writeFileSync(
    path.join(outputDir, 'posts.json'),
    JSON.stringify(posts, null, 2),
    'utf8'
);
console.log(`\n✅ Saved ${posts.length} posts to data/posts.json`);

// 5. Copy analysis files
const analysisFiles = {
    'analise_hooks.json': 'hooks.json',
    'analise_temas.json': 'topics.json',
    'analise_tom.json': 'tone.json',
    'analise_roteiro.json': 'scripts.json',
    'analise_benchmark.json': 'benchmark.json',
};

for (const [src, dest] of Object.entries(analysisFiles)) {
    const srcPath = path.join(sourceDir, src);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, path.join(outputDir, 'analyses', dest));
        console.log(`   ✅ ${src} → analyses/${dest}`);
    }
}

// 6. Generate stats summary
const stats = {
    totalPosts: posts.length,
    totalVideos: posts.filter(p => p.type === 'Video').length,
    totalWithTranscription: posts.filter(p => p.transcription && p.transcription.trim() !== '' && p.transcription.trim() !== '...').length,
    totalViews: posts.reduce((s, p) => s + (p.videoViewCount || 0), 0),
    totalLikes: posts.reduce((s, p) => s + (p.likesCount || 0), 0),
    totalComments: posts.reduce((s, p) => s + (p.commentsCount || 0), 0),
    profiles: [...new Set(posts.map(p => p.ownerUsername))].filter(u => u !== 'unknown'),
    languages: {},
    topicsCoverage: {},
};

for (const p of posts) {
    if (p.languageDetected) {
        stats.languages[p.languageDetected] = (stats.languages[p.languageDetected] || 0) + 1;
    }
}

fs.writeFileSync(
    path.join(outputDir, 'stats.json'),
    JSON.stringify(stats, null, 2),
    'utf8'
);
console.log(`\n📊 Stats saved to data/stats.json`);
console.log(`   Profiles: ${stats.profiles.length}`);
console.log(`   Videos: ${stats.totalVideos}`);
console.log(`   With transcription: ${stats.totalWithTranscription}`);
console.log(`   Total views: ${stats.totalViews.toLocaleString()}`);
console.log('\n🎉 Import complete!');
