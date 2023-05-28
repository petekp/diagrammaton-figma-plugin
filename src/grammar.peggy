Diagram
  = _ statements:Statement+ { return statements; }

Statement
  = nodeLink:NodeLinkNode _ { return nodeLink; }

NodeLinkNode
  = from:Node link:Link to:Node { return { from, link, to }; }

Node
  = id:Text { return { id }; }

Link
  = "--" description:Text "-->" { return { description }; }

Text
  = chars:[a-zA-Z0-9 ]+ { return chars.join(''); }

_ "whitespace"
  = [ \t\n\r]*
