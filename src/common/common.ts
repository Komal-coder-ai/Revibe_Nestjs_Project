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