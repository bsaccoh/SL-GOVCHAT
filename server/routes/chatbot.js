const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/chatbot/message
router.post('/message', (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const userMessage = message.toLowerCase().trim();

    // Extract keywords from user message
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'what', 'how', 'when', 'where', 'who', 'which', 'do', 'does', 'can', 'i', 'me', 'my', 'to', 'for', 'of', 'in', 'on', 'at', 'by', 'and', 'or', 'but', 'not', 'with', 'about', 'from', 'this', 'that', 'it', 'be', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'get', 'got', 'tell', 'please', 'know', 'want', 'need', 'any', 'all', 'some', 'more', 'just', 'also', 'very', 'much', 'been', 'being', 'there', 'their', 'they', 'them', 'than', 'then', 'its', 'your', 'you', 'our', 'out', 'into', 'over', 'after', 'before', 'between', 'under', 'through', 'during']);
    const keywords = userMessage
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));

    if (keywords.length === 0) {
        return res.json({
            response: "I'm the Government of Sierra Leone digital assistant. I have access to all government news, publications, projects, officials directory, and uploaded documents. You can ask me about:\n\n• Government services & policies\n• Tax & business registration\n• Labour laws & worker rights\n• Development projects\n• Government officials\n• Any uploaded documents\n\nHow can I help you today?",
            source: 'System',
            suggestions: [
                'How do I register a business?',
                'What are the current tax rates?',
                'Tell me about government projects',
                'Who is the Minister of Finance?'
            ]
        });
    }

    // ─── Search ALL data sources ───
    const results = [];

    // 1. Knowledge Base (highest priority)
    const allKnowledge = db.prepare('SELECT * FROM chatbot_knowledge').all();
    for (const entry of allKnowledge) {
        const entryKeywords = (entry.keywords || '').toLowerCase().split(',').map(k => k.trim());
        const entryQuestion = entry.question.toLowerCase();
        const entryAnswer = entry.answer.toLowerCase();
        let score = 0;

        for (const kw of keywords) {
            if (entryKeywords.some(ek => ek === kw || ek.includes(kw) || kw.includes(ek))) score += 4;
            if (entryQuestion.includes(kw)) score += 3;
            if (entryAnswer.includes(kw)) score += 1;
        }

        if (score >= 2) {
            results.push({
                score,
                type: 'knowledge',
                text: entry.answer,
                source: entry.mda_source || 'Government of Sierra Leone',
                category: entry.category,
                relatedId: entry.id,
            });
        }
    }

    // 2. News Articles
    const allNews = db.prepare('SELECT id, title, summary, content, category, author, published_at FROM news').all();
    for (const article of allNews) {
        const titleLower = article.title.toLowerCase();
        const summaryLower = (article.summary || '').toLowerCase();
        const contentLower = (article.content || '').toLowerCase();
        let score = 0;

        for (const kw of keywords) {
            if (titleLower.includes(kw)) score += 3;
            if (summaryLower.includes(kw)) score += 2;
            if (contentLower.includes(kw)) score += 1;
        }

        if (score >= 2) {
            const snippet = article.summary || article.content?.slice(0, 300) || '';
            results.push({
                score,
                type: 'news',
                text: `📰 **${article.title}**\n\n${snippet}${snippet.length >= 300 ? '...' : ''}\n\n_Published: ${new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}_`,
                source: article.author || 'Government News',
                category: article.category,
            });
        }
    }

    // 3. Government Projects
    const allProjects = db.prepare('SELECT * FROM projects').all();
    for (const project of allProjects) {
        const nameLower = project.name.toLowerCase();
        const descLower = (project.description || '').toLowerCase();
        const ministryLower = (project.ministry || '').toLowerCase();
        const locationLower = (project.location || '').toLowerCase();
        let score = 0;

        for (const kw of keywords) {
            if (nameLower.includes(kw)) score += 3;
            if (descLower.includes(kw)) score += 2;
            if (ministryLower.includes(kw)) score += 2;
            if (locationLower.includes(kw)) score += 1;
        }

        if (score >= 2) {
            results.push({
                score,
                type: 'project',
                text: `🏗️ **${project.name}**\nMinistry: ${project.ministry || 'N/A'}\nStatus: ${project.status} • Progress: ${project.progress}%\nBudget: ${project.budget || 'N/A'} • Location: ${project.location || 'N/A'}\n\n${project.description || ''}`,
                source: project.ministry || 'Government of Sierra Leone',
                category: 'Projects',
            });
        }
    }

    // 4. Public Officials
    const allOfficials = db.prepare('SELECT * FROM officials').all();
    for (const official of allOfficials) {
        const nameLower = official.name.toLowerCase();
        const titleLower = official.title.toLowerCase();
        const instLower = (official.institution || '').toLowerCase();
        const bioLower = (official.bio || '').toLowerCase();
        let score = 0;

        for (const kw of keywords) {
            if (nameLower.includes(kw)) score += 4;
            if (titleLower.includes(kw)) score += 3;
            if (instLower.includes(kw)) score += 2;
            if (bioLower.includes(kw)) score += 1;
        }

        if (score >= 2) {
            results.push({
                score,
                type: 'official',
                text: `👤 **${official.name}**\nTitle: ${official.title}\nInstitution: ${official.institution || 'N/A'}\nCategory: ${official.category}\n${official.bio ? '\n' + official.bio : ''}`,
                source: official.institution || 'Government Directory',
                category: 'Officials',
            });
        }
    }

    // 5. Publications
    const allPubs = db.prepare('SELECT * FROM publications').all();
    for (const pub of allPubs) {
        const titleLower = pub.title.toLowerCase();
        const descLower = (pub.description || '').toLowerCase();
        let score = 0;

        for (const kw of keywords) {
            if (titleLower.includes(kw)) score += 3;
            if (descLower.includes(kw)) score += 2;
        }

        if (score >= 2) {
            results.push({
                score,
                type: 'publication',
                text: `📄 **${pub.title}**\nCategory: ${pub.category}\n\n${pub.description || 'No description available.'}`,
                source: 'Official Publications',
                category: pub.category,
            });
        }
    }

    // 6. Uploaded Documents (text content indexed)
    const allDocs = db.prepare('SELECT * FROM documents').all();
    for (const doc of allDocs) {
        const titleLower = doc.title.toLowerCase();
        const descLower = (doc.description || '').toLowerCase();
        const textLower = (doc.text_content || '').toLowerCase();
        let score = 0;

        for (const kw of keywords) {
            if (titleLower.includes(kw)) score += 3;
            if (descLower.includes(kw)) score += 2;
            if (textLower.includes(kw)) score += 1;
        }

        if (score >= 2) {
            // Extract a relevant snippet from the text content
            let snippet = doc.description || '';
            if (!snippet && doc.text_content) {
                // Find the first occurrence of any keyword and extract surrounding text
                const lowerText = doc.text_content.toLowerCase();
                for (const kw of keywords) {
                    const idx = lowerText.indexOf(kw);
                    if (idx >= 0) {
                        const start = Math.max(0, idx - 100);
                        const end = Math.min(doc.text_content.length, idx + 200);
                        snippet = (start > 0 ? '...' : '') + doc.text_content.slice(start, end) + (end < doc.text_content.length ? '...' : '');
                        break;
                    }
                }
            }

            results.push({
                score,
                type: 'document',
                text: `📎 **${doc.title}** (${doc.original_name})\nCategory: ${doc.category}\n\n${snippet || 'Uploaded document — no text preview available.'}`,
                source: 'Uploaded Documents',
                category: doc.category,
            });
        }
    }

    // Sort by score descending, take the best result
    results.sort((a, b) => b.score - a.score);

    if (results.length > 0) {
        const best = results[0];

        // Log the interaction
        db.prepare('INSERT INTO analytics_events (event_type, page, metadata) VALUES (?, ?, ?)').run(
            'chatbot_query',
            '/chatbot',
            JSON.stringify({ query: message, matched_type: best.type, score: best.score, results_count: results.length })
        );

        // Compile additional results as context
        let response = best.text;

        // If there are more related results, append summary
        const otherResults = results.slice(1, 4);
        if (otherResults.length > 0) {
            response += '\n\n---\n📌 **Related information found:**';
            for (const r of otherResults) {
                const label = r.text.split('\n')[0]; // First line as title
                response += `\n• ${label} _(${r.type})_`;
            }
        }

        // Generate contextual suggestions
        const suggestions = [];
        const types = [...new Set(results.map(r => r.type))];
        if (types.includes('project')) suggestions.push('Tell me more about government projects');
        if (types.includes('official')) suggestions.push('Who are the government officials?');
        if (types.includes('news')) suggestions.push('Show me the latest news');
        if (types.includes('document')) suggestions.push('What documents are available?');
        if (types.includes('publication')) suggestions.push('List government publications');
        if (suggestions.length === 0) {
            suggestions.push('What government services are available?', 'How do I contact a ministry?', 'Tell me about ongoing projects');
        }

        return res.json({
            response,
            source: best.source,
            category: best.category,
            matchType: best.type,
            totalMatches: results.length,
            suggestions: suggestions.slice(0, 4),
        });
    }

    // No match found
    res.json({
        response: "I don't have specific information about that topic yet. I search across all government data including:\n\n• News & press releases\n• Official publications & documents\n• Government projects\n• Public officials directory\n• Uploaded documents\n• Knowledge base\n\nTry rephrasing your question or ask about a specific government service, ministry, or policy.",
        source: 'System',
        suggestions: [
            'What government services are available?',
            'How do I pay my taxes?',
            'Tell me about education policies',
            'What are my rights as a worker?'
        ]
    });
});

// GET /api/chatbot/suggestions
router.get('/suggestions', (req, res) => {
    const suggestions = db.prepare(
        'SELECT DISTINCT question FROM chatbot_knowledge ORDER BY RANDOM() LIMIT 6'
    ).all().map(r => r.question);
    res.json({ suggestions });
});

module.exports = router;
