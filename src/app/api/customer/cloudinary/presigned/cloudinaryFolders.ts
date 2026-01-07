// cloudinaryFolders.ts
// Utility to determine Cloudinary folder names based on type or context

export function getCloudinaryFolder(type: number): string {
  switch (type) {
    case 1:
      return 'users/profile'; // userProfile
    case 2:
      return 'users/cover'; // coverImage
    case 3:
      return 'posts/images'; // postImage
    case 4:
      return 'posts/videos'; // postVideo
    case 5:
      return 'livestreams';
    // Add more cases as needed
    default:
      return 'misc';
  }
}
