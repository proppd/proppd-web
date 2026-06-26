import { describe, expect, it } from 'vitest';
import {
  DEAL_STAGES,
  nextStage,
  stageLabel,
  stageDateField,
  type DealStage,
  type ActiveDealStage,
} from '@/lib/proppd/deal-stages';

describe('deal pipeline stage helpers', () => {
  it('defines the conveyancing pipeline in order', () => {
    expect(DEAL_STAGES).toEqual([
      'otp_signed',
      'bond_submitted',
      'bond_approved',
      'attorney_instructed',
      'deeds_lodged',
      'registered',
    ]);
  });

  it('advances each active stage to the next one', () => {
    expect(nextStage('otp_signed')).toBe('bond_submitted');
    expect(nextStage('bond_submitted')).toBe('bond_approved');
    expect(nextStage('bond_approved')).toBe('attorney_instructed');
    expect(nextStage('attorney_instructed')).toBe('deeds_lodged');
    expect(nextStage('deeds_lodged')).toBe('registered');
  });

  it('has no stage after the final or fallen-through state', () => {
    expect(nextStage('registered')).toBeNull();
    expect(nextStage('fallen_through')).toBeNull();
  });

  it('walks the full pipeline via nextStage without gaps', () => {
    const walked: ActiveDealStage[] = ['otp_signed'];
    let current = nextStage('otp_signed');
    while (current) {
      walked.push(current);
      current = nextStage(current);
    }
    expect(walked).toEqual([...DEAL_STAGES]);
  });

  it('labels every stage, including fallen-through', () => {
    const allStages: DealStage[] = [...DEAL_STAGES, 'fallen_through'];
    for (const stage of allStages) {
      const label = stageLabel(stage);
      expect(label).toBeTruthy();
      expect(label).not.toBe(stage); // never falls back to the raw enum value
    }
    expect(stageLabel('otp_signed')).toBe('OTP Signed');
    expect(stageLabel('registered')).toBe('Registered');
    expect(stageLabel('fallen_through')).toBe('Fallen Through');
  });

  it('maps each active stage to its milestone date field', () => {
    expect(stageDateField('otp_signed')).toBe('otpSignedAt');
    expect(stageDateField('bond_submitted')).toBe('bondSubmittedAt');
    expect(stageDateField('bond_approved')).toBe('bondApprovedAt');
    expect(stageDateField('attorney_instructed')).toBe('attorneyInstructedAt');
    expect(stageDateField('deeds_lodged')).toBe('deedsLodgedAt');
    expect(stageDateField('registered')).toBe('registeredAt');
  });

  it('produces a unique date field per stage', () => {
    const fields = DEAL_STAGES.map((stage) => stageDateField(stage));
    expect(new Set(fields).size).toBe(DEAL_STAGES.length);
  });
});
