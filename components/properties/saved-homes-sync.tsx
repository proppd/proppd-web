'use client';

import { useEffect, useRef } from 'react';
import { readSavedHomeSlugs, subscribeSavedHomes, writeSavedHomeSlugs } from '@/lib/saved-homes';
import { cloudListHomes, cloudRemoveHome, cloudSaveHome } from '@/lib/saved-homes/cloud';

/**
 * Keeps the localStorage shortlist in sync with the signed-in user's
 * account-stored saved homes. Renders nothing.
 *
 * On mount it merges the local and cloud lists (union, so nothing is lost when
 * signing in after saving while logged out), then mirrors every later local
 * change up to the cloud. When the user is signed out the cloud list call
 * returns null and we stay purely local.
 */
export function SavedHomesSync() {
  const cloudEnabled = useRef(false);
  const lastSynced = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};

    (async () => {
      const cloud = await cloudListHomes().catch(() => null);
      if (cancelled || cloud === null) return; // signed out / accounts off → local only

      cloudEnabled.current = true;

      const local = readSavedHomeSlugs();
      const cloudSet = new Set(cloud);
      const localSet = new Set(local);
      const union = Array.from(new Set([...cloud, ...local]));

      lastSynced.current = new Set(union);

      // Reflect the merged list locally (updates every Save button + badge).
      const unionChanged = union.length !== local.length || union.some((slug) => !localSet.has(slug));
      if (unionChanged) writeSavedHomeSlugs(union);

      // Push any homes saved while logged out up to the account.
      const localOnly = local.filter((slug) => !cloudSet.has(slug));
      await Promise.all(localOnly.map((slug) => cloudSaveHome(slug).catch(() => null)));
      if (cancelled) return;

      // Mirror future local changes to the cloud.
      unsubscribe = subscribeSavedHomes(() => {
        if (!cloudEnabled.current) return;
        const current = readSavedHomeSlugs();
        const currentSet = new Set(current);
        const previous = lastSynced.current;

        const additions = current.filter((slug) => !previous.has(slug));
        const removals = Array.from(previous).filter((slug) => !currentSet.has(slug));

        lastSynced.current = currentSet;
        additions.forEach((slug) => void cloudSaveHome(slug).catch(() => {}));
        removals.forEach((slug) => void cloudRemoveHome(slug).catch(() => {}));
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return null;
}
