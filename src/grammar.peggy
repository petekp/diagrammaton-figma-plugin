Start
  = nodes:Node* { return nodes; }

Node
  = id:Label ws1:Whitespace "--" ws2:Whitespace label:Label ws3:Whitespace "-->" ws4:Whitespace target:Label "\n" { return { id: id.id, label: label.label, target: target.id }; }
  / id:Label ws1:Whitespace "-->" ws2:Whitespace target:Label "\n" { return { id: id.id, label: id.label, target: target.id }; }

Connection
  = "--" label:Label "-->" { return { label: label }; }
  / "-->"

Label
  = id:LabelName "[" label:LabelName "]" { return { id: id, label: label }; }
  / id:LabelName { return { id: id, label: id }; }

LabelName
  = chars:[a-zA-Z0-9: ]+ { return chars.join(''); }

Whitespace
  = [ \t\n]*