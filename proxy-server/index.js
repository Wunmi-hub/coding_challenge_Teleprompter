import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'
import { load as cheerioLoad } from 'cheerio'


const app = express();
app.use(cors());



app.get('/proxy', async (req, res) => {
    try {
        const targetUrl = req.query.url;
        if (!targetUrl) {
            return res.status(400).json({ error: 'url query param required' });
        }

        // Basic allowlist to avoid open proxy abuse
        const allowed = /^(https?:\/\/(docs\.google\.com|raw\.githubusercontent\.com)\/)/i;
        if (!allowed.test(String(targetUrl))) {
            return res.status(400).json({ error: 'URL not allowed' });
        }


        const doFetch = async (url) => {
            try {
                const resp = await fetch(url, {
                    redirect: 'follow',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Node) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107 Safari/537.36',
                        'Accept': '*/*',
                        'Accept-Language': 'en-US,en;q=0.9'
                    }
                });
                const text = await resp.text();
                return { ok: resp.ok, status: resp.status, text };
            } catch (err) {
                return { ok: false, status: 0, text: '' };
            }
        };

        // Build fallback variants for Google Docs (try original, then pub text, then pub html)
        const candidates = [String(targetUrl)];
        try {
            const u = new URL(String(targetUrl));
            if (/docs\.google\.com/i.test(u.hostname)) {
                // If URL contains /export?format=txt, try the /pub?output=txt variant for published IDs
                if (u.pathname.includes('/d/e/')) {
                    // published /d/e/<id>/... -> try /d/e/<id>/pub?output=txt and /d/e/<id>/pub
                    const base = u.pathname.split('/pub')[0].split('/export')[0];
                    candidates.push(`${u.protocol}//${u.hostname}${base}/pub?output=txt`);
                    candidates.push(`${u.protocol}//${u.hostname}${base}/pub`);
                } else if (u.pathname.includes('/d/')) {
                    // editable doc id -> ensure export variant
                    const parts = u.pathname.split('/d/');
                    const after = parts[1] || '';
                    const docId = after.split('/')[0];
                    candidates.push(`${u.protocol}//${u.hostname}/document/d/${docId}/export?format=txt`);
                }
            }
        } catch (e) {
            // ignore URL parsing errors
        }

        let lastResult = null;
        for (const candidate of candidates) {
            console.log('Trying candidate:', candidate);
            const result = await doFetch(candidate);
            lastResult = { candidate, ...result };
            if (result.ok) {
                let body = result.text || '';
                // If body is HTML, extract text using cheerio
                if (body.trim().startsWith('<')) {
                    try {
                        const $ = cheerioLoad(body);
                        // remove non-content nodes that often include huge CSS/JS blobs
                        $('style, script, link, meta, noscript, header, footer').remove();
                        // remove common Google Docs chrome elements if present
                        $('[id="banners"]').remove();
                        $('[aria-hidden="true"]').remove();
                        // extract visible text
                        body = $('body').text();
                    } catch (e) {
                        // fallback to raw body
                    }
                }
                return res.json({ content: (body || '').trim(), variant: candidate });
            }
        }

        // none succeeded
        const snippet = lastResult && lastResult.text ? lastResult.text.slice(0, 2000) : '';
        return res.status(502).json({ error: 'Failed to fetch resource', upstreamStatus: lastResult && lastResult.status, upstreamBody: snippet });
    }catch(err){
        res.status(500).json({error: 'Failed to fetch resource'})
    }
})


app.listen(3001, () => {
    console.log('Proxy server running on http://localhost:3001');
})