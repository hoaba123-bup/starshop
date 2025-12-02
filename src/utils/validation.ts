export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (password.length < 6) {
    errors.push({
      field: 'password',
      message: 'Mật khẩu phải có ít nhất 6 ký tự'
    });
  }

  // Kiểm tra có ít nhất 1 chữ hoa
  if (!/[A-Z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Mật khẩu phải chứa ít nhất 1 chữ cái hoa'
    });
  }

  // Kiểm tra có ít nhất 1 chữ thường
  if (!/[a-z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Mật khẩu phải chứa ít nhất 1 chữ cái thường'
    });
  }

  // Kiểm tra có ít nhất 1 số
  if (!/[0-9]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Mật khẩu phải chứa ít nhất 1 chữ số'
    });
  }

  return errors;
}

export function validateSignUp(data: any) {
  const errors: ValidationError[] = [];

  // Kiểm tra fullName
  if (!data.fullName || data.fullName.trim().length === 0) {
    errors.push({
      field: 'fullName',
      message: 'Vui lòng nhập họ và tên'
    });
  }

  // Kiểm tra email
  if (!data.email || data.email.trim().length === 0) {
    errors.push({
      field: 'email',
      message: 'Vui lòng nhập email'
    });
  } else if (!validateEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Email không đúng định dạng'
    });
  }

  // Kiểm tra password
  if (!data.password || data.password.length === 0) {
    errors.push({
      field: 'password',
      message: 'Vui lòng nhập mật khẩu'
    });
  } else {
    const passwordErrors = validatePassword(data.password);
    errors.push(...passwordErrors);
  }

  // Kiểm tra confirmPassword
  if (data.confirmPassword !== data.password) {
    errors.push({
      field: 'confirmPassword',
      message: 'Mật khẩu xác nhận không trùng khớp'
    });
  }

  return errors;
}

export function validateSignIn(data: any) {
  const errors: ValidationError[] = [];

  if (!data.email || data.email.trim().length === 0) {
    errors.push({
      field: 'email',
      message: 'Vui lòng nhập email'
    });
  } else if (!validateEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Email không đúng định dạng'
    });
  }

  if (!data.password || data.password.length === 0) {
    errors.push({
      field: 'password',
      message: 'Vui lòng nhập mật khẩu'
    });
  }

  return errors;
}
