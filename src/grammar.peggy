Diagram
  = head:NodeLink tail:(Whitespace NodeLink)* { return [head, ...tail.map(([_, element]) => element)]; }

Flowchart
  = Diagram

NodeLink
  = from:Node Whitespace link:Link Whitespace? to:Node { return { from, link, to }; }

Node
  = id:NodeID label:NodeLabel? { return { id: id.join(''), label: label || id.join('') }; }

NodeID
  = [a-zA-Z0-9]+

NodeLabel
  = "[" label:[^\]]+ "]" { return label.join(""); }

Link
  = "--" label:LinkLabel? ">" { return { label: label || '' }; }

LinkLabel
  = label:[a-zA-Z0-9 ]* "--" { return label.join("").trim(); }
  / ""

Whitespace
  = [ \t\n\r]+
