const fs = require("fs");
const ts = require("typescript");
const lines = fs.readFileSync("app/dashboard/page.tsx", "utf8").split(/\r?\n/);
const block = lines.slice(578, 815).join("\n");
const code = `const x = (<>{\n${block}\n}</>);`;
fs.writeFileSync('temp_fragment.tsx', code, 'utf8');
const source = fs.readFileSync('temp_fragment.tsx', 'utf8');
const sf = ts.createSourceFile('temp_fragment.tsx', source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
const diags = sf.parseDiagnostics;
if (diags.length === 0) {
  console.log('fragment ok');
} else {
  diags.forEach(d => {
    const pos = sf.getLineAndCharacterOfPosition(d.start);
    console.log(`${pos.line+1}:${pos.character+1}: ${d.messageText}`);
    const start = Math.max(0, d.start - 40);
    const end = Math.min(source.length, d.start + 40);
    console.log(source.slice(start, end));
  });
}
fs.unlinkSync('temp_fragment.tsx');
