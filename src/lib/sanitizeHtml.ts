const ALLOWED_TAGS = new Set(['strong', 'b', 'em', 'i', 'span', 'br']);
const HEX_COLOR = /^#[0-9a-f]{3}([0-9a-f]{3})?$/i;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const sanitizeHtml = (value = '') => {
  if (typeof window === 'undefined' || !value) return escapeHtml(value);

  const template = document.createElement('template');
  template.innerHTML = value;

  const cleanNode = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        if (!ALLOWED_TAGS.has(tagName)) {
          element.replaceWith(document.createTextNode(element.textContent ?? ''));
          return;
        }

        const color = (element.getAttribute('style') ?? '').match(/color:\s*(#[0-9a-f]{3}(?:[0-9a-f]{3})?)/i)?.[1];
        [...element.attributes].forEach((attribute) => element.removeAttribute(attribute.name));
        if (tagName === 'span') {
          if (color && HEX_COLOR.test(color)) {
            element.setAttribute('style', `color: ${color}`);
          }
        }
      }

      cleanNode(child);
    });
  };

  cleanNode(template.content);
  return template.innerHTML;
};
