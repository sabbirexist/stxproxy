const STREAMS = {
  star_sports_1: {
    url: "https://smart.bengaldigital.live/star-sports-1/index.m3u8",
    headers: {
      'Host': 'smart.bengaldigital.live',
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

export default STREAMS;
