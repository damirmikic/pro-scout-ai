import createDOMPurify from 'dompurify';

const DOMPurifyInstance = typeof window !== 'undefined' ? createDOMPurify(window) : null;

const BASE_SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'a',
    'article',
    'blockquote',
    'br',
    'code',
    'div',
    'em',
    'figure',
    'figcaption',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'li',
    'ol',
    'p',
    'pre',
    'section',
    'span',
    'strong',
    'sub',
    'sup',
    'table',
    'tbody',
    'td',
    'thead',
    'th',
    'tr',
    'ul'
  ],
  ALLOWED_ATTR: [
    'aria-label',
    'class',
    'colspan',
    'data-accent-color',
    'data-highlight-ignore',
    'data-text-color',
    'href',
    'rel',
    'role',
    'rowspan',
    'scope',
    'target'
  ]
};

export function sanitizeHtmlContent(dirty = '', overrides = {}) {
  if (!dirty) return '';
  if (!DOMPurifyInstance) return dirty;

  const config = { ...BASE_SANITIZE_CONFIG };
  if (overrides.ALLOWED_TAGS) {
    config.ALLOWED_TAGS = Array.from(
      new Set([...BASE_SANITIZE_CONFIG.ALLOWED_TAGS, ...overrides.ALLOWED_TAGS])
    );
  }
  if (overrides.ALLOWED_ATTR) {
    config.ALLOWED_ATTR = Array.from(
      new Set([...BASE_SANITIZE_CONFIG.ALLOWED_ATTR, ...overrides.ALLOWED_ATTR])
    );
  }

  return DOMPurifyInstance.sanitize(dirty, config);
}

export function applySectionAccents(root) {
  if (!root) return;
  root.querySelectorAll('[data-accent-color]').forEach(node => {
    const accent = node.getAttribute('data-accent-color');
    if (accent) {
      node.style.backgroundColor = accent;
    }
  });
  root.querySelectorAll('[data-text-color]').forEach(node => {
    const color = node.getAttribute('data-text-color');
    if (color) {
      node.style.color = color;
    }
  });
}

export function renderSafeContent(element, html, options = {}) {
  if (!element) return;
  const safeHtml = sanitizeHtmlContent(html || '');
  element.innerHTML = safeHtml;
  if (options.applyAccents) {
    applySectionAccents(element);
  }
}
