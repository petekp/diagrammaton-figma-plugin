Diagram
  = head:NodeLink tail:(Whitespace NodeLink Whitespace?)* {
      return [head, ...tail.map(([_, element]) => element)].flat();
    }

Flowchart
  = Diagram

NodeID
  = [a-zA-Z0-9_\-:.]+

AnyNodeShape
  = "(" label:NodeLabel "))" { return { label, shape: 'ROUNDED_RECTANGLE' }; }
  / "(" label:NodeLabel ")" { return { label, shape: 'ELLIPSE' }; }
  / "((" label:NodeLabel "))" { return { label, shape: 'ELLIPSE' }; }
  / "(" label:NodeLabel "})" { return { label, shape: 'ELLIPSE' }; }
  / "{" label:NodeLabel "}" { return { label, shape: 'DIAMOND' }; }
  / "[" label:NodeLabel "]]" { return { label, shape: 'SQUARE' }; }
  / "[" label:NodeLabel "]" { return { label, shape: 'SQUARE' }; }
  / "[/" label:NodeLabel "/]" { return { label, shape: 'PARALLELOGRAM_RIGHT' }; }
  / "[\\" label:NodeLabel "\\]" { return { label, shape: 'PARALLELOGRAM_LEFT' }; }
  / "[/" label:NodeLabel "\\]" { return { label, shape: 'TRIANGLE_UP' }; }
  / "[\\" label:NodeLabel "/]" { return { label, shape: 'TRIANGLE_DOWN' }; }
  / "[(" label:NodeLabel ")]" { return { label, shape: 'ENG_DATABASE' }; }
  / "(" label:NodeLabel "]" { return { label, shape: 'SQUARE' }; }
  / "[" label:NodeLabel ")" { return { label, shape: 'SQUARE' }; }
  / "{" label:NodeLabel "]" { return { label, shape: 'SQUARE' }; }
  / "[" label:NodeLabel "}" { return { label, shape: 'SQUARE' }; }
  / "[/" label:NodeLabel "]" { return { label, shape: 'SQUARE' }; }
  / "[" label:NodeLabel "/]" { return { label, shape: 'SQUARE' }; }
  / "[\\" label:NodeLabel "]" { return { label, shape: 'SQUARE' }; }
  / "[" label:NodeLabel "\\]" { return { label, shape: 'SQUARE' }; }
  / "[/" label:NodeLabel "\\]" { return { label, shape: 'SQUARE' }; }
  / "[\\" label:NodeLabel "/]" { return { label, shape: 'SQUARE' }; }
  / "[(" label:NodeLabel "]" { return { label, shape: 'SQUARE' }; }
  / "[" label:NodeLabel ")]" { return { label, shape: 'SQUARE' }; }

NodeShapeChars
  = [()[\]/\\]+

Node
  = id:NodeID shape:AnyNodeShape? { return { id: id.join(''), ...shape, shape: shape?.shape || 'SQUARE' }; }

NodeLabel
  = label:[^(){}[\]\\-]+ { return label.join("").trim() };

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

NodeLink
  = head:Node tail:(Whitespace? Link Whitespace? Node)* {
      const elements = tail.map(([_, link, __, node]) => ({ from: head, link, to: node }));
      return [elements[0], ...elements.slice(1)];
    }

Link
  = "-->|" label:LinkLabel "|" { return { label: label || '' }; }
  / "--" Whitespace? label:LinkLabel Whitespace? "-->" { return { label: label || '' }; }
  / "--" Whitespace? label:LinkLabel Whitespace? "--" { return { label: label || '' }; }
  / "-->" { return { label: '' }; }
  / "--" { return { label: '' }; }

LinkLabel
  = label:[a-zA-Z0-9 ]+  { return label.join("").trim(); }
  / ""

Whitespace
  = [ \t\n\r]*
