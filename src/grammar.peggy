graph
  = nodes:nodeList { return nodes; }
  
nodeList
  = first:word _ "=>" _ second:nodeList { return [first, '=>'].concat(second); }
  / word

word
  = chars:[a-z0-9]+ { return chars.join(''); }

_ "whitespace"
  = [ \t\n\r]*
