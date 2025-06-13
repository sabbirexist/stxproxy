const STREAMS = {
  star_sports_1: {
    url: "https://smart.bengaldigital.live/star-sports-1/index.m3u8",
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Origin': 'https://anym3u8player.com',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
      'TE': 'trailers'
    }
  },

  sample_stream: {
    url: "https://example.com/live/sample-stream.m3u8",
    headers: {
      'User-Agent': 'SampleUserAgent/1.0',
      'Referer': 'https://example.com',
      'Origin': 'https://example.com',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'identity'
    }
  }
};

export default async function handler(req, res) {
  // --- CORS & OPTIONS preflight handling ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
    try {
      const parsed = new URL(targetUrl);
      customHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': '*/*',
        'Referer': parsed.origin,
        'Origin': parsed.origin,
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
    } catch {
      return res.status(400).send('Invalid URL format');
    }
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

    // Handle .m3u8 playlist
    if (targetUrl.endsWith('.m3u8')) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      const playlistText = await response.text();
      const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);

      // Proxy all .ts segment URLs through this API
      const proxiedPlaylist = playlistText.replace(
        /^(?!#)(.+\.ts.*)$/gm,
        (segmentLine) => {
          // Ignore empty lines or comments
          if (!segmentLine.trim() || segmentLine.startsWith('#')) return segmentLine;
          // Absolute or relative
          const absoluteSegmentUrl = segmentLine.startsWith('http')
            ? segmentLine
            : new URL(segmentLine, baseUrl).href;
          // Use only the API path (no domain) for proxying
          const apiPath = req.url.split('?')[0];
          return `${apiPath}?url=${encodeURIComponent(absoluteSegmentUrl)}`;
        }
      );

      return res.send(proxiedPlaylist);
    }

    // Handle .ts segments
    if (targetUrl.endsWith('.ts')) {
      res.setHeader('Content-Type', 'video/MP2T');
      const body = response.body;
      if (body) {
        return body.pipe(res);
      }
    }

    // Fallback: stream any other file type
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    const body = response.body;
    if (body) {
      return body.pipe(res);
    }

    return res.status(500).send('No response body from upstream');
  } catch (error) {
    return res.status(500).send(`Proxy error: ${error.message}`);
  }
}
