const fs = require('fs');
const path = require('path');
const { unified } = require('unified');
const _remarkParse = require('remark-parse');
const _remarkGfm = require('remark-gfm');
const _remarkRehype = require('remark-rehype');
const _rehypeSanitize = require('rehype-sanitize');
const _rehypeHighlight = require('rehype-highlight');
const _rehypeReact = require('rehype-react');
const { jsx, jsxs, Fragment } = require('react/jsx-runtime');

const remarkParse = _remarkParse.default || _remarkParse;
const remarkGfm = _remarkGfm.default || _remarkGfm;
const remarkRehype = _remarkRehype.default || _remarkRehype;
const rehypeSanitize = _rehypeSanitize.default || _rehypeSanitize;
const rehypeHighlight = _rehypeHighlight.default || _rehypeHighlight;
const rehypeReact = _rehypeReact.default || _rehypeReact;

(async () => {
  const filePath = path.join(process.cwd(), 'content', 'docs', 'example.md');
  const md = await fs.promises.readFile(filePath, 'utf8');
  try {
    const file = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeHighlight)
      .use(rehypeSanitize)
      .use(rehypeReact, { jsx, jsxs, Fragment })
      .processSync(md);
    console.log('result type:', typeof file.result);
    console.dir(file.result, { depth: 4 });
  } catch (e) {
    console.error('error:', e);
  }
})();
