import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { action, text, prompt, context } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
        }

        let systemPrompt = '';
        let userPrompt = '';

        switch (action) {
            case 'translate':
                systemPrompt = 'Você é um tradutor profissional. Traduza o texto para português brasileiro de forma natural e fluente, mantendo o tom original. Retorne apenas a tradução, sem explicações.';
                userPrompt = `Traduza para português:\n\n${text}`;
                break;

            case 'summarize':
                systemPrompt = 'Você é um analista de conteúdo. Resuma o texto de forma concisa, destacando os pontos principais e insights para criação de conteúdo. Responda em português.';
                userPrompt = `Resuma este vídeo de dermatologia:\n\n${text}`;
                break;

            case 'extract_hooks':
                systemPrompt = 'Você é um especialista em marketing de conteúdo para Instagram/Reels. Analise o texto e extraia os hooks (ganchos) mais impactantes. Sugira 3 variações de hook baseadas no conteúdo. Responda em português.';
                userPrompt = `Extraia e sugira hooks para este conteúdo:\n\n${text}`;
                break;

            case 'generate_script':
                systemPrompt = `Você é um roteirista especializado em Reels de dermatologia que viralizam. 
Use estes dados de performance para guiar a criação:
- Hooks com lista numerada têm 28.7% de engagement rate
- "Se você tem [problema]..." gera 14% ER
- Tom conversacional gera 78% mais engajamento que técnico
- Vídeos de 30-60 segundos (100-200 palavras) performam melhor
- Misturar termos técnicos com linguagem informal é o combo vencedor
- Estrutura Diagnóstico→Receita tem o maior ER (11.3%)

${context ? `Contexto adicional dos dados:\n${context}\n` : ''}

Crie o roteiro em português brasileiro com:
1. HOOK (primeira frase impactante)
2. CONTEÚDO (problema + solução)  
3. CTA (chamada para ação)
Inclua timing sugerido entre colchetes.`;
                userPrompt = prompt || text;
                break;

            case 'custom':
                systemPrompt = 'Você é um assistente especializado em marketing de conteúdo para dermatologia no Instagram. Responda em português.';
                userPrompt = prompt || text;
                break;

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userPrompt }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Gemini API error:', errorData);
            return NextResponse.json({ error: 'Gemini API error' }, { status: response.status });
        }

        const data = await response.json();
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

        return NextResponse.json({ result });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
