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

  it('blocks an agent/agency role that has no linked workspace record', () => {
    // A profile carrying role 'agent' but with no agent record behind it must
    // not reach the CRM — otherwise the dashboard adopts another agent's
    // identity and the global lead queue. Same for an unlinked agency admin.
    const orphanAgent: PortalUserAccess = { ...access('agent'), agentId: null, agentName: null };
    const orphanAgencyAdmin: PortalUserAccess = { ...access('agency_admin'), agencyId: null, agencyName: null };
    expect(canAccessAgentWorkspace(orphanAgent)).toBe(false);
    expect(canAccessAgentWorkspace(orphanAgencyAdmin)).toBe(false);
  });

  it('still allows a super admin with no agent linkage', () => {
    const adminNoAgent: PortalUserAccess = { ...access('super_admin'), agentId: null, agencyId: null };
    expect(canAccessAgentWorkspace(adminNoAgent)).toBe(true);
  });
});
