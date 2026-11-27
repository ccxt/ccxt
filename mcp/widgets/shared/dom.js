const Dom = {
  byId(id) {
    return document.getElementById(id);
  },

  element(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  },

  definitionRow(list, label, text) {
    const row = Dom.element('div');
    const term = Dom.element('dt', label);
    const detail = Dom.element('dd', text);
    row.append(term, detail);
    list.append(row);
    return detail;
  },
};
