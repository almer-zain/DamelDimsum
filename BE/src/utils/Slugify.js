module.exports = (text) => {
  if (!text) return ""; // THE FIX: Handle undefined/null gracefully
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};