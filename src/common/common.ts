function getFolderLocation(type: number): string {
  switch (type) {
    case 1:
      return 'users/profile';
    case 2:
      return 'users/documents';
    case 3:
      return 'pets/images';
    default:
      return 'uploads';
  }
}
export { getFolderLocation };


export function generateShortcodeForPost(length = 10): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let code = '';

  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}
