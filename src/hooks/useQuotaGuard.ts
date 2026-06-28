/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { getCurrentSession } from '../lib/auth/authService';
import { deductQuota, ensureUserQuotaFields } from '../lib/quota/usageLedger';

export interface UseQuotaGuardResult {
  showQuotaModal: boolean;
  setShowQuotaModal: (show: boolean) => void;
  checkAndDeductQuota: (onSuccess: () => void) => boolean;
  userQuotaInfo: {
    planType: 'free' | 'pro_early';
    quotaLimit: number;
    quotaRemaining: number;
  } | null;
  refreshQuotaInfo: () => void;
}

export function useQuotaGuard(): UseQuotaGuardResult {
  const [showQuotaModal, setShowQuotaModal] = useState<boolean>(false);
  const [userQuotaInfo, setUserQuotaInfo] = useState(() => {
    const session = getCurrentSession();
    return session ? ensureUserQuotaFields(session) : null;
  });

  const refreshQuotaInfo = useCallback(() => {
    const session = getCurrentSession();
    if (session) {
      setUserQuotaInfo(ensureUserQuotaFields(session));
    } else {
      setUserQuotaInfo(null);
    }
  }, []);

  const checkAndDeductQuota = useCallback((onSuccess: () => void): boolean => {
    const session = getCurrentSession();
    if (!session) {
      // If no session exists, allow it or delegate to auth, but for normal safety let's prompt or bypass
      onSuccess();
      return true;
    }

    const currentQuotaUser = ensureUserQuotaFields(session);

    if (currentQuotaUser.quotaRemaining <= 0) {
      setShowQuotaModal(true);
      return false;
    }

    // Attempt subtraction
    const res = deductQuota(currentQuotaUser.userId);
    if (res.success) {
      refreshQuotaInfo();
      onSuccess();
      return true;
    } else {
      setShowQuotaModal(true);
      return false;
    }
  }, [refreshQuotaInfo]);

  return {
    showQuotaModal,
    setShowQuotaModal,
    checkAndDeductQuota,
    userQuotaInfo,
    refreshQuotaInfo
  };
}
