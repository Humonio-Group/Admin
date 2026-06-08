type ContentType = "html" | "markdown" | "plain";

const HTML_TAG_PATTERN = /<\/?(?:p|div|span|h[1-6]|ul|ol|li|a|strong|em|b|i|u|s|del|br|hr|img|blockquote|pre|code|table|tr|td|th|thead|tbody|mark|article|section)[^>]*\/?>/i;

const MARKDOWN_PATTERNS = [
  /^#{1,6}\s+/m,
  /\*\*[^*]+\*\*/,
  /\*[^*]+\*/,
  /~~[^~]+~~/,
  /`[^`]+`/,
  /^\s*[-*+]\s+/m,
  /^\s*\d+\.\s+/m,
  /^\s*>/m,
  /\[.+]\(.+\)/,
  /!\[.*]\(.+\)/,
  /^---$/m,
  /^```/m,
];

export const useContentDetector = () => {
  const detect = (content: string): ContentType => {
    if (!content || content.trim() === "") return "plain";

    if (HTML_TAG_PATTERN.test(content)) return "html";

    if (MARKDOWN_PATTERNS.some(pattern => pattern.test(content))) return "markdown";

    return "plain";
  };

  const isHTML = (content: string): boolean => detect(content) === "html";
  const isMarkdown = (content: string): boolean => detect(content) === "markdown";

  return { detect, isHTML, isMarkdown };
};
