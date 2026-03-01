import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve(process.cwd(), 'src');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    if (/\.d\.ts$/.test(entry.name)) continue;
    if (/\.css$/.test(entry.name)) continue;
    files.push(full);
  }
  return files;
}

function toLineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 10) starts.push(i + 1);
  }
  return starts;
}

function getLineIndent(text, pos) {
  const lineStart = text.lastIndexOf('\n', pos - 1) + 1;
  let i = lineStart;
  while (i < text.length && (text[i] === ' ' || text[i] === '\t')) i++;
  return text.slice(lineStart, i);
}

function hasImmediateLeadingComment(text, nodePos) {
  const ranges = ts.getLeadingCommentRanges(text, nodePos) || [];
  if (ranges.length === 0) return false;
  const nearest = ranges[ranges.length - 1];
  const between = text.slice(nearest.end, nodePos);
  return /^[\s\r\n]*$/.test(between);
}

function describeFunction(node, sourceFile) {
  if (ts.isFunctionDeclaration(node)) {
    const name = node.name?.getText(sourceFile) || 'anonymous function';
    return `Function ${name}: handles a specific piece of application logic.`;
  }

  if (ts.isMethodDeclaration(node)) {
    const name = node.name.getText(sourceFile);
    return `Method ${name}: performs work for this object/component.`;
  }

  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    const parent = node.parent;
    if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
      const name = parent.name.text;
      const looksLikeComponent = /^[A-Z]/.test(name);
      if (looksLikeComponent) {
        return `Component ${name}: renders part of the user interface.`;
      }
      return `Function ${name}: implements reusable behavior.`;
    }
    return 'Function: implements scoped behavior for this module.';
  }

  return 'Function: executes a focused unit of logic.';
}

function collectInsertions(sourceFile, text) {
  const insertions = [];

  function visit(node) {
    const isFnLike =
      (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) &&
      !!node.body;

    if (isFnLike) {
      const pos = node.getStart(sourceFile, false);
      if (!hasImmediateLeadingComment(text, pos)) {
        const indent = getLineIndent(text, pos);
        const summary = describeFunction(node, sourceFile);
        const comment = `${indent}// ${summary}\n`;
        insertions.push({ pos, comment });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return insertions.sort((a, b) => b.pos - a.pos);
}

const files = walk(root);
let changed = 0;
let totalComments = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, original, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const insertions = collectInsertions(sourceFile, original);

  if (insertions.length === 0) continue;

  let updated = original;
  for (const insertion of insertions) {
    updated = updated.slice(0, insertion.pos) + insertion.comment + updated.slice(insertion.pos);
  }

  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    changed++;
    totalComments += insertions.length;
  }
}

console.log(`Updated ${changed} file(s), inserted ${totalComments} comment(s).`);
