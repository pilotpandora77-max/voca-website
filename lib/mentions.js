// Lightweight @mention helpers shared by the post composer and comment box.
// We don't try to parse arbitrary free text into real users server-side
// (usernames may contain spaces, which makes token boundaries ambiguous).
// Instead the client resolves @tokens to userIds via autocomplete while
// composing, and only sends those resolved ids as `mentions`.

// Returns the active partial query after a trailing "@" in `text` (e.g.
// "hey @jo" -> "jo"), or null if the cursor isn't in a mention token.
export function detectMentionQuery(text) {
  const m = text.match(/(?:^|\s)@([^\s@]{0,24})$/);
  return m ? m[1] : null;
}

// Replaces the trailing "@partial" in `text` with "@username " and returns
// the new text.
export function insertMention(text, username) {
  return text.replace(/@([^\s@]{0,24})$/, `@${username} `);
}

// Scans the final text for @tokens and resolves them against `mentionMap`
// ({ [usernameLower]: { id, username } }), plus the fixed "VOCA" sentinel.
// Returns a deduped array of userIds (or 'VOCA').
export function resolveMentions(text, mentionMap) {
  const ids = new Set();
  const matches = text.matchAll(/@([^\s@]{2,24})/g);
  for (const m of matches) {
    const token = m[1].toLowerCase();
    if (token === 'voca') { ids.add('VOCA'); continue; }
    const hit = mentionMap[token];
    if (hit) ids.add(hit.id);
  }
  return [...ids];
}

// Renders text with @mention tokens highlighted. Returns an array of
// strings/elements suitable as React children.
export function renderMentionText(text) {
  if (!text) return text;
  const parts = text.split(/(@[^\s@]{2,24})/g);
  return parts.map((part, i) => {
    if (part.startsWith('@') && part.length > 1) {
      const isVoca = part.slice(1).toLowerCase() === 'voca';
      return (
        <span key={i} style={{ color: 'var(--purple)', fontWeight: 700, ...(isVoca ? { background: 'var(--purple-light)', borderRadius: 4, padding: '0 2px' } : {}) }}>
          {part}
        </span>
      );
    }
    return part;
  });
}
