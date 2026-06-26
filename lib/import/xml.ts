/**
 * Compact, dependency-free XML reader for agency property feeds.
 *
 * South African listing feeds (agency CRM and portal exports) are
 * almost always XML with a repeated record element — e.g. `<property>` repeated
 * under a `<properties>` root, with an `<images><image>…</image></images>`
 * block. This module parses that shape into flat field records that the import
 * mapping layer can normalise.
 *
 * It is intentionally not a general-purpose XML DOM: it handles elements,
 * attributes, text, CDATA, comments, the XML declaration, and DOCTYPE, which
 * covers real feeds. Unknown constructs are skipped rather than throwing.
 */

export type XmlNode = {
  tag: string;
  attrs: Record<string, string>;
  children: XmlNode[];
  text: string;
};

/** Field value from a record: a single string, or repeated values (e.g. images). */
export type XmlFieldValue = string | string[];
export type XmlRecord = Record<string, XmlFieldValue>;

export function parseXml(input: string): XmlNode {
  const root: XmlNode = { tag: '#root', attrs: {}, children: [], text: '' };
  const stack: XmlNode[] = [root];
  let i = 0;
  const len = input.length;

  while (i < len) {
    const lt = input.indexOf('<', i);
    if (lt === -1) {
      appendText(stack[stack.length - 1], input.slice(i));
      break;
    }

    if (lt > i) {
      appendText(stack[stack.length - 1], input.slice(i, lt));
    }

    // Comment
    if (input.startsWith('<!--', lt)) {
      const end = input.indexOf('-->', lt + 4);
      i = end === -1 ? len : end + 3;
      continue;
    }

    // CDATA
    if (input.startsWith('<![CDATA[', lt)) {
      const end = input.indexOf(']]>', lt + 9);
      const raw = input.slice(lt + 9, end === -1 ? len : end);
      stack[stack.length - 1].text += raw;
      i = end === -1 ? len : end + 3;
      continue;
    }

    // Declaration <?xml ?> / processing instruction
    if (input.startsWith('<?', lt)) {
      const end = input.indexOf('?>', lt + 2);
      i = end === -1 ? len : end + 2;
      continue;
    }

    // DOCTYPE / other markup declaration
    if (input.startsWith('<!', lt)) {
      const end = input.indexOf('>', lt + 2);
      i = end === -1 ? len : end + 1;
      continue;
    }

    const gt = input.indexOf('>', lt);
    if (gt === -1) break;

    let tagContent = input.slice(lt + 1, gt);
    const selfClosing = tagContent.endsWith('/');
    if (selfClosing) tagContent = tagContent.slice(0, -1);

    if (tagContent.startsWith('/')) {
      // Closing tag: pop the matching element.
      const closeTag = tagContent.slice(1).trim();
      for (let s = stack.length - 1; s > 0; s -= 1) {
        if (stack[s].tag === closeTag) {
          stack.length = s;
          break;
        }
      }
      i = gt + 1;
      continue;
    }

    const { tag, attrs } = parseTag(tagContent);
    const node: XmlNode = { tag, attrs, children: [], text: '' };
    stack[stack.length - 1].children.push(node);
    if (!selfClosing) stack.push(node);
    i = gt + 1;
  }

  return root;
}

function appendText(node: XmlNode, raw: string): void {
  if (!raw) return;
  node.text += decodeEntities(raw);
}

function parseTag(content: string): { tag: string; attrs: Record<string, string> } {
  const trimmed = content.trim();
  const match = trimmed.match(/^([^\s/>]+)/);
  const tag = match ? match[1] : trimmed;
  const attrs: Record<string, string> = {};
  const attrRegex = /([^\s=]+)\s*=\s*"([^"]*)"|([^\s=]+)\s*=\s*'([^']*)'/g;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(trimmed)) !== null) {
    const key = (m[1] ?? m[3]).trim();
    const value = decodeEntities(m[2] ?? m[4] ?? '');
    attrs[key] = value;
  }
  return { tag, attrs };
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, body: string) => {
    if (body.startsWith('#x') || body.startsWith('#X')) {
      const code = Number.parseInt(body.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    if (body.startsWith('#')) {
      const code = Number.parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    const named = ENTITIES[body.toLowerCase()];
    return named ?? whole;
  });
}

/**
 * Extract repeating listing records from a parsed feed.
 *
 * If `recordTag` is supplied, every descendant element with that tag becomes a
 * record. Otherwise we pick the most-repeated child tag of the document root's
 * primary element (e.g. `property` under `properties`).
 */
export function extractXmlRecords(root: XmlNode, recordTag?: string): XmlRecord[] {
  const recordNodes = findRecordNodes(root, recordTag);
  return recordNodes.map(nodeToRecord);
}

function findRecordNodes(root: XmlNode, recordTag?: string): XmlNode[] {
  if (recordTag) {
    const found: XmlNode[] = [];
    collectByTag(root, recordTag, found);
    return found;
  }

  // Descend to the document element, then choose its most repeated child tag.
  const docElement = root.children[0];
  if (!docElement) return [];

  const container = docElement.children.length > 0 ? docElement : root;
  const counts = new Map<string, XmlNode[]>();
  for (const child of container.children) {
    const list = counts.get(child.tag) ?? [];
    list.push(child);
    counts.set(child.tag, list);
  }

  let best: XmlNode[] = [];
  for (const list of counts.values()) {
    if (list.length > best.length) best = list;
  }

  // A single record feed (one property) still yields one record.
  if (best.length === 0 && docElement.children.length > 0) {
    return [docElement];
  }
  return best;
}

function collectByTag(node: XmlNode, tag: string, out: XmlNode[]): void {
  for (const child of node.children) {
    if (child.tag === tag) out.push(child);
    else collectByTag(child, tag, out);
  }
}

function nodeToRecord(node: XmlNode): XmlRecord {
  const record: XmlRecord = {};

  // Attributes of the record element itself (e.g. <property ref="123">).
  for (const [key, value] of Object.entries(node.attrs)) {
    record[key] = value;
  }

  for (const child of node.children) {
    const key = child.tag;
    let value: XmlFieldValue;

    if (child.children.length > 0) {
      // Nested container (e.g. <images><image>…</image></images>) -> array of
      // the leaf text values found beneath it.
      const leaves = child.children
        .map((grandChild) => grandChild.text.trim())
        .filter((text) => text.length > 0);
      value = leaves.length > 0 ? leaves : child.text.trim();
    } else {
      value = child.text.trim();
    }

    const existing = record[key];
    if (existing === undefined) {
      record[key] = value;
    } else {
      // Repeated sibling elements collapse into an array.
      const merged = Array.isArray(existing) ? existing : [existing];
      record[key] = merged.concat(value);
    }
  }

  return record;
}
