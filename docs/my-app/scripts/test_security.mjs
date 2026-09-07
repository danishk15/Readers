import assert from 'assert';

// 1. Test Redirect Sanitizer
function sanitizeRedirectUrl(rawUrl) {
  if (!rawUrl) return '/dashboard';
  const decoded = decodeURIComponent(rawUrl).trim();
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decoded)) {
    return '/dashboard';
  }
  if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.startsWith('/\\') || decoded.startsWith('\\')) {
    return '/dashboard';
  }
  if (/[\r\n]/.test(decoded)) {
    return '/dashboard';
  }
  return decoded;
}

console.log('Testing Open Redirect Sanitizer:');
assert.strictEqual(sanitizeRedirectUrl('https://evil.com'), '/dashboard', 'Should block absolute https URL');
assert.strictEqual(sanitizeRedirectUrl('http://evil.com'), '/dashboard', 'Should block absolute http URL');
assert.strictEqual(sanitizeRedirectUrl('//evil.com'), '/dashboard', 'Should block protocol-relative URL');
assert.strictEqual(sanitizeRedirectUrl('/\\evil.com'), '/dashboard', 'Should block slash-backslash URL');
assert.strictEqual(sanitizeRedirectUrl('javascript:alert(1)'), '/dashboard', 'Should block javascript scheme');
assert.strictEqual(sanitizeRedirectUrl('/communities/123'), '/communities/123', 'Should allow valid relative URL');
assert.strictEqual(sanitizeRedirectUrl('/dashboard?tab=online'), '/dashboard?tab=online', 'Should allow valid query params');
console.log('✔ All Open Redirect tests passed!');

// 2. Test SSRF Host/IP Blocker
function isPrivateOrRestrictedHost(hostname) {
  const host = hostname.toLowerCase().trim().replace(/^\[|\]$/g, '');

  if (
    host === 'localhost' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.localhost') ||
    host.endsWith('.localdomain') ||
    host.endsWith('.arpa') ||
    host === 'metadata.google.internal' ||
    host === 'instance-data'
  ) {
    return true;
  }

  if (
    host === '::1' ||
    host === '::' ||
    host.startsWith('fe80:') ||
    host.startsWith('fc') ||
    host.startsWith('fd') ||
    host.startsWith('ff') ||
    host.startsWith('::ffff:')
  ) {
    return true;
  }

  if (/^\d+$/.test(host) || /^0x[0-9a-fA-F]+$/.test(host)) {
    return true;
  }

  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const octets = ipv4Match.slice(1, 5).map(Number);
    if (octets.some(o => o < 0 || o > 255)) return true;

    const [o1, o2] = octets;
    if (o1 === 0) return true;
    if (o1 === 127) return true;
    if (o1 === 10) return true;
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    if (o1 === 192 && o2 === 168) return true;
    if (o1 === 169 && o2 === 254) return true;
    if (o1 === 100 && (o2 >= 64 && o2 <= 127)) return true;
    if (host === '100.100.100.100') return true;
    if (o1 === 192 && o2 === 0 && octets[2] === 2) return true;
    if (o1 === 198 && o2 === 51 && octets[2] === 100) return true;
    if (o1 === 203 && o2 === 0 && octets[2] === 113) return true;
    if (o1 >= 224) return true;
  }

  return false;
}

console.log('\nTesting SSRF Host & IP Filter:');
assert.strictEqual(isPrivateOrRestrictedHost('127.0.0.1'), true, 'Should block 127.0.0.1');
assert.strictEqual(isPrivateOrRestrictedHost('169.254.169.254'), true, 'Should block AWS/GCP metadata IP');
assert.strictEqual(isPrivateOrRestrictedHost('10.0.0.5'), true, 'Should block 10.x.x.x');
assert.strictEqual(isPrivateOrRestrictedHost('192.168.1.1'), true, 'Should block 192.168.x.x');
assert.strictEqual(isPrivateOrRestrictedHost('172.20.0.1'), true, 'Should block 172.16-31.x.x');
assert.strictEqual(isPrivateOrRestrictedHost('localhost'), true, 'Should block localhost');
assert.strictEqual(isPrivateOrRestrictedHost('server.internal'), true, 'Should block .internal');
assert.strictEqual(isPrivateOrRestrictedHost('::1'), true, 'Should block IPv6 loopback');
assert.strictEqual(isPrivateOrRestrictedHost('2130706433'), true, 'Should block decimal IP');
assert.strictEqual(isPrivateOrRestrictedHost('0x7f000001'), true, 'Should block hex IP');
assert.strictEqual(isPrivateOrRestrictedHost('www.gutenberg.org'), false, 'Should allow public domain gutenberg.org');
assert.strictEqual(isPrivateOrRestrictedHost('archive.org'), false, 'Should allow public domain archive.org');
console.log('✔ All SSRF security tests passed!');

// 3. Test Rate Limiter
const map = new Map();
function testRateLimit(key, max) {
  const now = Date.now();
  const rec = map.get(key);
  if (!rec || now > rec.reset) {
    map.set(key, { count: 1, reset: now + 1000 });
    return true;
  }
  if (rec.count >= max) return false;
  rec.count++;
  return true;
}

console.log('\nTesting Rate Limiter:');
assert.strictEqual(testRateLimit('ip_test', 3), true);
assert.strictEqual(testRateLimit('ip_test', 3), true);
assert.strictEqual(testRateLimit('ip_test', 3), true);
assert.strictEqual(testRateLimit('ip_test', 3), false, 'Should block requests exceeding max limit');
console.log('✔ Rate Limiter test passed!');

console.log('\n🚀 ALL SECURITY UNIT TESTS PASSED SUCCESSFULLY!');
