/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserAccount {
  userId: string;
  displayName: string;
  email: string;
  role: 'teacher' | 'admin';
  createdAt: string;
}

const USERS_STORAGE_KEY = 'nhip_giang_registered_users_v1';
const SESSION_STORAGE_KEY = 'current_session';

// Hạt giống người dùng mặc định để có sẵn dữ liệu test của hệ thống
const DEFAULT_USERS: UserAccount[] = [
  {
    userId: 'teacher_01',
    displayName: 'Giáo viên Nguyễn Văn A',
    email: 'gv_a@nhipgiang.edu.vn',
    role: 'teacher',
    createdAt: new Date().toISOString(),
  },
  {
    userId: 'teacher_02',
    displayName: 'Giáo viên Trần Thị B',
    email: 'gv_b@nhipgiang.edu.vn',
    role: 'teacher',
    createdAt: new Date().toISOString(),
  },
  {
    userId: 'admin',
    displayName: 'Admin Kiểm Duyệt Viên',
    email: 'admin@nhipgiang.edu.vn',
    role: 'admin',
    createdAt: new Date().toISOString(),
  }
];

// Lấy danh sách tất cả tài khoản
export function getRegisteredUsers(): UserAccount[] {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    // Tạo thêm mật khẩu lưu trữ giả lập cho các tài khoản seed nếu cần, nhưng ở đây ta chỉ cần so khớp đơn giản hoặc lưu trữ mật khẩu an toàn dạng hash giả lập.
    // Để phục vụ demo/test, ta lưu luôn một danh sách tài khoản + thông tin đăng nhập đơn giản.
    return DEFAULT_USERS;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    return DEFAULT_USERS;
  }
}

// Lưu danh sách tài khoản
function saveRegisteredUsers(users: UserAccount[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Lấy thông tin phiên làm việc hiện tại
export function getCurrentSession(): UserAccount | null {
  const session = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch (err) {
    return null;
  }
}

// Thiết lập phiên làm việc hiện tại
export function setCurrentSession(user: UserAccount | null) {
  if (user) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

// Đăng ký tài khoản mới (Chỉ gán vai trò 'teacher')
export function registerUser(displayName: string, email: string, passwordHash: string): { success: boolean; message: string; user?: UserAccount } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = displayName.trim();

  if (!cleanName || !cleanEmail || !passwordHash) {
    return { success: false, message: 'Vui lòng cung cấp đầy đủ thông tin!' };
  }

  const users = getRegisteredUsers();
  const emailExists = users.some(u => u.email === cleanEmail);

  if (emailExists) {
    return { success: false, message: 'Email này đã được đăng ký trên hệ thống!' };
  }

  // Khởi tạo tài khoản mới - 100% bắt buộc nhận vai trò 'teacher' để bảo vệ quyền quản trị hệ thống
  const newUser: UserAccount = {
    userId: 'user_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36),
    displayName: cleanName,
    email: cleanEmail,
    role: 'teacher', // Chặn tuyệt đối không cho phép gán quyền admin từ phía máy khách
    createdAt: new Date().toISOString()
  };

  // Lưu thông tin đăng nhập (mật khẩu) giả lập trong local storage
  const credentials = JSON.parse(localStorage.getItem('nhip_giang_credentials_v1') || '{}');
  credentials[cleanEmail] = passwordHash;
  localStorage.setItem('nhip_giang_credentials_v1', JSON.stringify(credentials));

  // Lưu tài khoản
  users.push(newUser);
  saveRegisteredUsers(users);

  return { success: true, message: 'Đăng ký tài khoản thành công!', user: newUser };
}

// Đăng nhập
export function loginUser(email: string, passwordHash: string): { success: boolean; message: string; user?: UserAccount } {
  const cleanEmail = email.trim().toLowerCase();
  
  if (!cleanEmail || !passwordHash) {
    return { success: false, message: 'Vui lòng nhập Email và Mật khẩu!' };
  }

  const users = getRegisteredUsers();
  const user = users.find(u => u.email === cleanEmail);

  if (!user) {
    return { success: false, message: 'Tài khoản không tồn tại trên hệ thống!' };
  }

  // Với các tài khoản mẫu seed: cho phép đăng nhập bằng bất kỳ mật khẩu nào (hoặc mật khẩu rỗng/mặc định)
  const isSeedUser = ['gv_a@nhipgiang.edu.vn', 'gv_b@nhipgiang.edu.vn', 'admin@nhipgiang.edu.vn'].includes(cleanEmail);

  if (isSeedUser) {
    setCurrentSession(user);
    return { success: true, message: 'Đăng nhập thành công!', user };
  }

  // Với tài khoản đăng ký mới, so khớp mật khẩu lưu trữ trong Local Storage
  const credentials = JSON.parse(localStorage.getItem('nhip_giang_credentials_v1') || '{}');
  const storedPassword = credentials[cleanEmail];

  if (storedPassword === passwordHash) {
    setCurrentSession(user);
    return { success: true, message: 'Đăng nhập thành công!', user };
  }

  return { success: false, message: 'Mật khẩu đăng nhập không chính xác!' };
}

// Đăng xuất
export function logoutUser(): void {
  setCurrentSession(null);
}
