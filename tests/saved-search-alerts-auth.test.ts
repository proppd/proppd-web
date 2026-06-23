import { describe, expect, it } from 'vitest';
import { isAuthorizedCronRequest } from '@/app/api/saved-searches/run-alerts/route';

describe('saved search alert cron authorization', () => {
  it('accepts the bearer secret header', () => {
    expect(isAuthorizedCronRequest(new Headers({ authorization: `Bearer ${'cron_secret'}` }), 'cron_secret')).toBe(true);
  });

  it('rejects missing or mismatched authorization headers', () => {
    expect(isAuthorizedCronRequest(new Headers(), 'cron_secret')).toBe(false);
    expect(isAuthorizedCronRequest(new Headers({ authorization: `Bearer ${'wrong'}` }), 'cron_secret')).toBe(false);
  });

  it('does not accept URL query secrets as authorization', () => {
    const headers = new Headers({ referer: 'https://proppd.com/api/saved-searches/run-alerts?secret=cron_secret' });
    expect(isAuthorizedCronRequest(headers, 'cron_secret')).toBe(false);
  });
});
