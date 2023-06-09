Diagram
  = head:NodeLink tail:(Whitespace NodeLink)* { return [head, ...tail.map(([_, element]) => element)]; }

Flowchart
  = Diagram

NodeLink
  = from:Node Whitespace link:Link Whitespace? to:Node { return { from, link, to }; }

Node
  = id:NodeID shape:NodeShape? { return { id: id.join(''), ...shape, shape: shape?.shape || 'SQUARE' }; }

NodeID
  = [a-zA-Z0-9]+

NodeShape
  = "(" label:NodeLabel ")" { return { label: label.join(""), shape: 'ROUNDED_RECTANGLE' }; }
  / "((" label:NodeLabel "))" { return { label: label.join(""), shape: 'ELLIPSE' }; }
  / "{" label:NodeLabel "}" { return { label: label.join(""), shape: 'DIAMOND' }; }
  / "[" label:NodeLabel "]" { return { label: label.join(""), shape: 'SQUARE' }; }
  / "[/" label:NodeLabel "/]" { return { label: label.join(""), shape: 'PARALLELOGRAM_RIGHT' }; }
  / "[\\" label:NodeLabel "\\]" { return { label: label.join(""), shape: 'PARALLELOGRAM_LEFT' }; }
  / "[/" label:NodeLabel "\\]" { return { label: label.join(""), shape: 'TRIANGLE_UP' }; }
  / "[\\" label:NodeLabel "/]" { return { label: label.join(""), shape: 'TRIANGLE_DOWN' }; }
  / "[(" label:NodeLabel ")]" { return { label: label.join(""), shape: 'ENG_DATABASE' }; }

NodeLabel
  = label:[^(){}[\]/\\]+ { return label; }

Link
  = "--" condition:LinkCondition? label:LinkLabel? ">" { return { label: label || '', condition: condition || '' }; }

LinkLabel
  = label:[a-zA-Z0-9 ]* "--" { return label.join("").trim(); }
  / ""

LinkCondition
  = condition:[a-zA-Z0-9 ]* "--" { return condition.join("").trim(); }
  / ""

Whitespace
  = [ \t\n\r]+
