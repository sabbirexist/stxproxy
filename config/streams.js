/**
 * STREAMS configuration
 * Add your streams here with unique keys, URLs, and optional headers.
 */

const STREAMS = {
  star_sports_1: {
    url: "https://smart.bengaldigital.live/star-sports-1/index.m3u8",
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
      'Referer': 'https://stxproxy.onrender.com',
      'Origin': 'https://stxproxy.onrender.com',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'identity'
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

export default STREAMS;
