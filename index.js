{
  const debounce = (fn, time = 250) => {
    let interval;
    return (...args) => {
      clearTimeout(interval);
      interval = setTimeout(() => fn(...args), time);
    }
  }
  class SearchInTemplate {
    constructor({ input, template }) {
      this.input = this.setElement(input)
      this.template = this.setElement(template)
      this.savedContent = this.template.innerHTML;
      this.onChange = debounce(this.search.bind(this), 750);

      this.init();
    }
    search(e) {
      const { value } = e.target
      this.template.innerHTML = this.savedContent;
      if (value) {
        const regx = new RegExp(value, 'ig');
        const matches = this.findMatchesRange(regx);
        if(matches.length) {
          this.render(matches);
        }
      }
    }
    findMatchesRange(regx) {
      const allRanges = [];
      (function findMatchesInTemplate(template) {
        template.childNodes.forEach((node) => {
          const { nodeType, nodeValue } = node;
          const isTextNode = nodeType === 3;
          if (isTextNode && nodeValue.trim().replace(/\s/g, '').length) {
            const curMatches = [...nodeValue.matchAll(regx)];
            if (curMatches.length) {
              curMatches.forEach(match => {
                const range = document.createRange();
                const { index } = match;
                const searchLength = match[0].length;
                range.setStart(node, index);
                range.setEnd(node, index + searchLength);
                allRanges.push(range)
              });
            }
          }
          if (node.childNodes) findMatchesInTemplate(node);
        })
      })(this.template);
      return allRanges;
    }
    setElement(el) {
      return typeof el === 'string' ? document.querySelector(el) : el;
    }
    init() {
      this.input.addEventListener('input', this.onChange)
    }
    render(matchesRange) {
      matchesRange.forEach((range) => {
        const mark = document.createElement('mark');
        range.surroundContents(mark);
      })
    }
  }

  new SearchInTemplate({
    input: '[data-js="input"]',
    template: '[data-js="template"]'
  });
}
