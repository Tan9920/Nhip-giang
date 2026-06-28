/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserAccount } from '../auth/authService';

export interface UsageLedgerEntry {
  entryId: string;
  userId: string;
  action: 'export_docx';
  timestamp: string;
  currentBalance: number;
}

const LEDGER_STORAGE_KEY = 'nhip_giang_usage_ledger_v1';
const USERS_STORAGE_KEY = 'nhip_giang_registered_users_v1';
const SESSION_STORAGE_KEY = 'current_session';

/**
 * Get all ledger entries
 */
export function getUsageLedger(): UsageLedgerEntry[] {
  const data = localStorage.getItem(LEDGER_STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

/**
 * Adds an entry to the usage ledger log
 */
export function addLedgerEntry(userId: string, action: 'export_docx', currentBalance: number): void {
  const entries = getUsageLedger();
  const newEntry: UsageLedgerEntry = {
    entryId: 'ledger_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36),
    userId,
    action,
    timestamp: new Date().toISOString(),
    currentBalance,
  };
  entries.push(newEntry);
  localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(entries));
}

/**
 * Guard utility to guarantee all required quota properties exist
 */
export function ensureUserQuotaFields(user: any): UserAccount & { planType: 'free' | 'pro_early'; quotaLimit: number; quotaRemaining: number } {
  const updated = { ...user };
  if (!updated.planType) {
    updated.planType = 'free';
  }
  if (typeof updated.quotaLimit === 'undefined' || isNaN(updated.quotaLimit)) {
    updated.quotaLimit = updated.planType === 'pro_early' ? 50 : 3;
  }
  if (typeof updated.quotaRemaining === 'undefined' || isNaN(updated.quotaRemaining)) {
    updated.quotaRemaining = updated.planType === 'pro_early' ? 50 : 3;
  }
  return updated as any;
}

// In-memory locks to prevent double-click race conditions or double deductions
let isDeducting = false;

/**
 * Deduct 1 quota count safely and record to the ledger
 */
export function deductQuota(userId: string): { success: boolean; remaining: number; message: string } {
  if (isDeducting) {
    return { success: false, remaining: 0, message: 'Đang xử lý trừ hạn ngạch...' };
  }
  isDeducting = true;

  try {
    const usersStr = localStorage.getItem(USERS_STORAGE_KEY);
    if (!usersStr) {
      isDeducting = false;
      return { success: false, remaining: 0, message: 'Không thể tải cơ sở dữ liệu người dùng!' };
    }

    const users: any[] = JSON.parse(usersStr);
    const userIndex = users.findIndex(u => u.userId === userId);
    if (userIndex === -1) {
      isDeducting = false;
      return { success: false, remaining: 0, message: 'Tài khoản người dùng không hợp lệ!' };
    }

    const user = ensureUserQuotaFields(users[userIndex]);

    if (user.quotaRemaining <= 0) {
      isDeducting = false;
      return { success: false, remaining: 0, message: 'Hạn ngạch xuất bản file trong tuần của bạn đã hết.' };
    }

    // Deduct
    user.quotaRemaining -= 1;
    users[userIndex] = user;

    // Save back to the registered users
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Sync active session if this is the currently logged-in user
    const currentSessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
    if (currentSessionStr) {
      const currentSession = JSON.parse(currentSessionStr);
      if (currentSession.userId === userId) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      }
    }

    // Write to ledger
    addLedgerEntry(userId, 'export_docx', user.quotaRemaining);

    isDeducting = false;
    return { success: true, remaining: user.quotaRemaining, message: 'Khấu trừ hạn ngạch thành công.' };
  } catch (err) {
    isDeducting = false;
    return { success: false, remaining: 0, message: 'Đã xảy ra lỗi hệ thống khi khấu trừ hạn ngạch.' };
  }
}

/**
 * Perform an instant, safe upgrade of the user's plan to pro_early in local storage
 */
export function upgradeToProEarly(userId: string): boolean {
  try {
    const usersStr = localStorage.getItem(USERS_STORAGE_KEY);
    if (!usersStr) return false;

    const users: any[] = JSON.parse(usersStr);
    const userIndex = users.findIndex(u => u.userId === userId);
    if (userIndex === -1) return false;

    const user = ensureUserQuotaFields(users[userIndex]);
    user.planType = 'pro_early';
    user.quotaLimit = 50;
    user.quotaRemaining = 50;
    users[userIndex] = user;

    // Save updated users list
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Update active session
    const currentSessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
    if (currentSessionStr) {
      const currentSession = JSON.parse(currentSessionStr);
      if (currentSession.userId === userId) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      }
    }
    return true;
  } catch (err) {
    return false;
  }
}
