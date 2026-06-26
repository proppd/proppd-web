import { describe, expect, it } from 'vitest';
import { isFeedSourceDue, selectDueFeedSources } from '@/lib/import/schedule';
import { isSafeFeedUrl } from '@/lib/import/fetch';

describe('feed scheduling', () => {
  const now = new Date('2026-06-23T12:00:00Z');

  it('runs a feed that has never run', () => {
    expect(isFeedSourceDue({ isActive: true, frequencyMinutes: 60, lastRunAt: null }, now)).toBe(true);
  });

  it('skips inactive feeds', () => {
    expect(isFeedSourceDue({ isActive: false, frequencyMinutes: 60, lastRunAt: null }, now)).toBe(false);
  });

  it('respects the configured interval', () => {
    const recently = new Date('2026-06-23T11:30:00Z').toISOString(); // 30 min ago
    expect(isFeedSourceDue({ isActive: true, frequencyMinutes: 60, lastRunAt: recently }, now)).toBe(false);

    const longAgo = new Date('2026-06-23T10:30:00Z').toISOString(); // 90 min ago
    expect(isFeedSourceDue({ isActive: true, frequencyMinutes: 60, lastRunAt: longAgo }, now)).toBe(true);
  });

  it('treats an unparseable last run as due', () => {
    expect(isFeedSourceDue({ isActive: true, frequencyMinutes: 60, lastRunAt: 'not-a-date' }, now)).toBe(true);
  });

  it('selects only due feeds', () => {
    const due = selectDueFeedSources(
      [
        { id: 'a', isActive: true, frequencyMinutes: 60, lastRunAt: null },
        { id: 'b', isActive: false, frequencyMinutes: 60, lastRunAt: null },
        { id: 'c', isActive: true, frequencyMinutes: 60, lastRunAt: new Date('2026-06-23T11:55:00Z').toISOString() },
      ],
      now,
    );
    expect(due.map((d) => d.id)).toEqual(['a']);
  });
});

describe('feed URL safety', () => {
  it('allows public http(s) URLs', () => {
    expect(isSafeFeedUrl('https://feeds.agency.co.za/export.xml')).toBe(true);
    expect(isSafeFeedUrl('http://example.com/feed.csv')).toBe(true);
  });

  it('rejects non-http protocols', () => {
    expect(isSafeFeedUrl('ftp://example.com/feed.xml')).toBe(false);
    expect(isSafeFeedUrl('file:///etc/passwd')).toBe(false);
    expect(isSafeFeedUrl('not a url')).toBe(false);
  });

  it('rejects localhost and private ranges (SSRF guard)', () => {
    expect(isSafeFeedUrl('http://localhost/feed')).toBe(false);
    expect(isSafeFeedUrl('http://127.0.0.1/feed')).toBe(false);
    expect(isSafeFeedUrl('http://10.0.0.5/feed')).toBe(false);
    expect(isSafeFeedUrl('http://192.168.1.10/feed')).toBe(false);
    expect(isSafeFeedUrl('http://169.254.169.254/latest/meta-data')).toBe(false);
    expect(isSafeFeedUrl('http://172.16.0.1/feed')).toBe(false);
  });
});
