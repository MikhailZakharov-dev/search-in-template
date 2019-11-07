{
  const debounce = (fn, time = 250) => {
    let interval;
    return (...args) => {
      clearTimeout(interval);
      interval = setTimeout(() => fn(...args), time);
    }
  }
  class SearchInTemplate {
    constructor({ input, output, template }) {
      this.input = this.setElement(input)
      this.output = this.setElement(output)
      this.template = this.setElement(template)
      this.onChange = debounce(this.search.bind(this), 750);

      this.init();
    }
    search(e) {
      if(e.target.value) {
        const regx = new RegExp(e.target.value, 'ig');
        const matches = this.findMatches(regx);
        if(!matches.length) {
          this.output.innerHTML = 'Not found';
        } else {
          this.render(matches);
        }
      } else {
        this.output.innerHTML = ''
      }
    }
    findMatches(regx) {
      const matches = [];
      (function findMatchesInTemplate(template) {
        template.childNodes.forEach((node) => {
          const { nodeType, nodeValue } = node;
          const isTextNode = nodeType === 3;
          if (isTextNode && nodeValue.trim().replace(/\s/g, '').length) {
            const curMatches = [...nodeValue.matchAll(regx)];
            if (curMatches.length) matches.push({
              ref: node, 
              curMatches
            })
          }
          if (node.childNodes) findMatchesInTemplate(node);
        })
      })(this.template);
      return matches;
    }
    setElement(el) {
      return typeof el === 'string' ? document.querySelector(el) : el;
    }
    init() {
      this.input.addEventListener('input', this.onChange)
    }
    render(matches) {
      const items = matches.reduce((total, match) => {
        return total+= `
          <li>
            <b>${match.curMatches[0]}:</b>
            <span>${match.curMatches[0].index}</span>
          </li>`
      }, '')
      const list = `<ul>${items}</ul>`;
      this.output.innerHTML = list;
    }
  }

  new SearchInTemplate({
    input: '[data-js="input"]',
    output: '[data-js="output"]',
    template: '[data-js="template"]'
  });
}
