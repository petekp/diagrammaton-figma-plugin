Diagram
  = head:NodeLink tail:(Whitespace NodeLink)* { return [head, ...tail.map(([_, element]) => element)]; }

Flowchart
  = Diagram

NodeLink
  = from:Node Whitespace link:Link Whitespace? to:Node { return { from, link, to }; }

Node
  = id:NodeID label:NodeLabel shape:NodeShape? { return { id: id.join(''), label: label || id.join(''), shape: shape || 'SQUARE' }; }

NodeShape
  = "(" shape:[a-zA-Z0-9]+ ")" { return shape.join(""); }

NodeID
  = [a-zA-Z0-9]+

NodeLabel
  = "(" label:[^)]+ ")" { return { text: label.join(""), shape: 'ELLIPSE' }; }
  / "{" label:[^}]+ "}" { return { text: label.join(""), shape: 'DIAMOND' }; }
  / "[" label:[^\]]+ "]" { return { text: label.join(""), shape: 'ROUNDED_RECTANGLE' }; }
  / "[/" label:[^/]+ "/]" { return { text: label.join(""), shape: 'PARALLELOGRAM_RIGHT' }; }
  / "[\\" label:[^\\]+ "\\]" { return { text: label.join(""), shape: 'PARALLELOGRAM_LEFT' }; }
  / "[(Database)]" { return { text: 'Database', shape: 'CYLINDER' }; }

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
