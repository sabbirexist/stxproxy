import express from 'express';
import fetch from 'node-fetch';
import STREAMS from '../config/streams.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/proxy', async (req, res) => {
  const { name, url } = req.query;

  let targetUrl;
  let customHeaders = {};

  if (name && STREAMS[name]) {
    targetUrl = STREAMS[name].url;
    customHeaders = STREAMS[name].headers || {};
  } else if (url) {
    try {
      targetUrl = decodeURIComponent(url);
    } catch {
      return res.status(400).send('Invalid URL encoding');
    }
    // Default headers for direct URLs
    customHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': '*/*',
      'Referer': new URL(targetUrl).origin,
      'Origin': new URL(targetUrl).origin,
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'identity',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
  } else {
    return res.status(400).send('Missing "name" or "url" query parameter');
  }

  try {
    const response = await fetch(targetUrl, {
      headers: customHeaders,
      redirect: 'follow'
    });

    if (!response.ok) {
      return res.status(response.status).send(`Upstream error: ${response.statusText}`);
    }

    // Set CORS headers for your frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');

    if (targetUrl.endsWith('.m3u8')) {
      const playlistText = await response.text();
      const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);

      // Rewrite .ts segment URLs to proxy through this endpoint
      const proxiedPlaylist = playlistText.replace(/^(?!#)(.+\.ts.*)$/gm, (segmentLine) => {
        const absoluteSegmentUrl = segmentLine.startsWith('http') ? segmentLine : baseUrl + segmentLine;
        return `${req.baseUrl}/proxy?url=${encodeURIComponent(absoluteSegmentUrl)}`;
      });

      return res.send(proxiedPlaylist);
    }

    // Pipe media segments or other content directly
    const body = response.body;
    if (body) {
      return body.pipe(res);
    } else {
      return res.status(500).send('No response body from upstream');
    }
  } catch (error) {
    return res.status(500).send(`Proxy error: ${error.message}`);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Streaming proxy server running on port ${PORT}`);
});
