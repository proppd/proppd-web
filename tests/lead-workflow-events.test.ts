import { describe, expect, it } from 'vitest';
import { buildLeadWorkflowEventNotes } from '@/lib/proppd/backend';

describe('lead workflow event notes', () => {
  it('describes status and quality changes for lead moderation audits', () => {
    expect(buildLeadWorkflowEventNotes('new', 'contacted', 'clean', 'clean')).toBe('Updated status new → contacted.');
    expect(buildLeadWorkflowEventNotes('contacted', 'contacted', 'clean', 'duplicate')).toBe('Updated quality clean → duplicate.');
    expect(buildLeadWorkflowEventNotes('new', 'qualified', 'clean', 'flagged')).toBe('Updated status new → qualified and quality clean → flagged.');
  });

  it('records a review note when no moderation change was applied', () => {
    expect(buildLeadWorkflowEventNotes('new', 'new', 'clean', 'clean')).toBe('Lead workflow reviewed without status or quality changes.');
  });
});
