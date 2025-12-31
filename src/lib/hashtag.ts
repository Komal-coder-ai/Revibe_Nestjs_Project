// Extract hashtags from text or caption, allowing for optional spaces after '#'
export function extractHashtags(text: string): string[] {
  if (!text) return [];
  // This regex matches # followed by optional spaces and then word characters (letters, numbers, underscores)
  const matches = text.match(/#\s*([\w]+)/g);
  return matches
    ? matches.map(tag => tag.replace(/^#\s*/, '').toLowerCase())
    : [];
}
