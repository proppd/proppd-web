import { describe, expect, it } from 'vitest';
import { canAccessAgentWorkspace, type PortalUserAccess } from '@/lib/proppd/backend';

function access(role: PortalUserAccess['role']): PortalUserAccess {
  return {
    userId: `${role}-user`,
    profileId: `${role}-profile`,
    role,
    agentId: role === 'agent' ? 'agent-1' : null,
    agentName: role === 'agent' ? 'Agent One' : null,
    agencyId: role === 'agency_admin' ? 'agency-1' : null,
    agencyName: role === 'agency_admin' ? 'Agency One' : null,
  };
}

describe('agent workspace access', () => {
  it('allows approved agent and agency roles into AgentOS/CRM', () => {
    expect(canAccessAgentWorkspace(access('agent'))).toBe(true);
    expect(canAccessAgentWorkspace(access('agency_admin'))).toBe(true);
    expect(canAccessAgentWorkspace(access('super_admin'))).toBe(true);
  });

  it('blocks owners, normal users, and missing profiles from the agent dashboard', () => {
    expect(canAccessAgentWorkspace(access('user'))).toBe(false);
    expect(canAccessAgentWorkspace(null)).toBe(false);
    expect(canAccessAgentWorkspace(undefined)).toBe(false);
  });
});
