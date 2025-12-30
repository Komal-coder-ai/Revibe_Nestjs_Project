// Extract hashtags from text or caption
export function extractHashtags(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/#(\w+)/g);
  return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
}
