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
      this.debouncedSearch = debounce(this.search);

      this.init();
    }
    search = (e) => {
      const { value } = e.target
      this.template.innerHTML = this.savedContent;
      if (value) {
        const regx = new RegExp(value, 'ig');
        const matches = this.findMatchesRange(regx, this.walkNodes(this.template));
        if (matches.length) this.render(matches);
      }
    }
        
    findMatchesRange = (regx, nodesGenerator) => {
      const allRanges = [];
      for (let node of nodesGenerator) {
        const { nodeType, nodeValue } = node;
        const isTextNode = nodeType === 3;
        if (isTextNode && this.checkStringNotEmpty(nodeValue)) {
          const matches = [...nodeValue.matchAll(regx)];
          if (matches.length) allRanges.push(...this.createRangesByMatches(node, matches))
        }
      }
      return allRanges;
    }
    
    *walkNodes (node) {  
      yield node;
      let element = node.firstChild;
      while(element) {
        yield* this.walkNodes(element)
        element = element.nextSibling
      }
    }
    
    createRangesByMatches = (node, matches) => matches.map((match) => {
      const range = document.createRange();
      const { index } = match;
      const searchLength = match[0].length;
      range.setStart(node, index);
      range.setEnd(node, index + searchLength);
      return range
    })
    
    checkStringNotEmpty = (nodeValue) => nodeValue.trim().replace(/\s/g, '').length > 0
    
    setElement = (el) => typeof el === 'string' ? document.querySelector(el) : el;
    
    init = () => this.input.addEventListener('input', this.debouncedSearch)
    
    render = (matchesRange) => {
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
