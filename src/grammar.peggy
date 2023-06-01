Diagram
  = head:NodeLink tail:(Whitespace NodeLink)* { return [head, ...tail.map(([_, element]) => element)]; }

Flowchart
  = Diagram

NodeLink
  = from:Node Whitespace Arrow Whitespace? link:LinkLabel? Whitespace? to:Node { return { from, link: { label: link || '' }, to }; }

Node
  = id:NodeID label:NodeLabel? { return { id: id.join(''), label: label || id.join('') }; }

NodeID
  = [a-zA-Z0-9]+

NodeLabel
  = "[" label:[^\]]+ "]" { return label.join(""); }

Arrow
  = "--" ArrowEnd?

ArrowEnd
  = ">" { return "->"; }

LinkLabel
  = "[" label:[a-zA-Z0-9 ]+ "]" { return label.join(""); }

Whitespace
  = [ \t\n\r]+