import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Usamos el AST de TypeScript directo porque los plugins de ESLint para complejidad
// se vuelven locos con funciones flecha anidadas en JSX o cambian las reglas entre versiones.
// Si una funcion pasa de CC = 5, esto rompe el build antes de que llegue al PR.

const MAX_CC = 5;
const MIN_MI = 75;

const BRANCH_KINDS = new Set([
  ts.SyntaxKind.IfStatement,
  ts.SyntaxKind.ForStatement,
  ts.SyntaxKind.ForInStatement,
  ts.SyntaxKind.ForOfStatement,
  ts.SyntaxKind.WhileStatement,
  ts.SyntaxKind.DoStatement,
  ts.SyntaxKind.CaseClause,
  ts.SyntaxKind.CatchClause,
  ts.SyntaxKind.ConditionalExpression
]);

function isFunctionNode(node) {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isArrowFunction(node) ||
    ts.isFunctionExpression(node) ||
    ts.isConstructorDeclaration(node)
  );
}

function isLogicalBranch(node) {
  if (!ts.isBinaryExpression(node)) return false;
  const op = node.operatorToken.kind;
  return (
    op === ts.SyntaxKind.AmpersandAmpersandToken ||
    op === ts.SyntaxKind.BarBarToken ||
    op === ts.SyntaxKind.QuestionQuestionToken
  );
}

function countBranchesInFunction(rootNode) {
  let branches = 0;

  function visit(node) {
    if (node !== rootNode && isFunctionNode(node)) {
      return;
    }
    if (BRANCH_KINDS.has(node.kind) || isLogicalBranch(node)) {
      branches += 1;
    }
    ts.forEachChild(node, visit);
  }

  visit(rootNode);
  return branches + 1;
}

function getFunctionName(node, sourceFile) {
  if (node.name && ts.isIdentifier(node.name)) {
    return node.name.text;
  }
  if (ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) {
    return node.parent.name.text;
  }
  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return `<anon_line_${line + 1}>`;
}

function computeMaintainabilityIndex(loc, totalCc) {
  const safeLoc = Math.max(1, loc);
  const raw = ((171 - 5.2 * Math.log(safeLoc) - 0.23 * totalCc) / 171) * 100;
  return Math.max(0, Number(raw.toFixed(2)));
}

function collectSourceFiles(dirPath, collected = []) {
  if (!fs.existsSync(dirPath)) return collected;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(fullPath, collected);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      collected.push(fullPath);
    }
  }
  return collected;
}

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const violations = [];
  let maxCcInFile = 1;

  function walk(node) {
    if (isFunctionNode(node)) {
      const cc = countBranchesInFunction(node);
      if (cc > maxCcInFile) maxCcInFile = cc;
      if (cc > MAX_CC) {
        const fnName = getFunctionName(node, sourceFile);
        violations.push(`${filePath} -> '${fnName}' tiene CC=${cc} (maximo permitido: ${MAX_CC})`);
      }
    }
    ts.forEachChild(node, walk);
  }

  walk(sourceFile);
  const nonEmptyLines = content.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
  const mi = computeMaintainabilityIndex(nonEmptyLines, maxCcInFile);
  if (mi < MIN_MI) {
    violations.push(`${filePath} -> MI=${mi} (minimo requerido: ${MIN_MI}, LOC=${nonEmptyLines})`);
  }
  return { violations, maxCcInFile, mi, loc: nonEmptyLines };
}

const roots = [
  'packages/simulation-domain/src',
  'packages/simulation-infrastructure/src',
  'packages/web-presentation/src'
];

const files = roots.flatMap((root) => collectSourceFiles(path.resolve(process.cwd(), root)));
const allViolations = [];

for (const file of files) {
  const result = auditFile(file);
  allViolations.push(...result.violations);
}

if (allViolations.length > 0) {
  console.error('Violaciones de calidad determinista detectadas:');
  for (const v of allViolations) {
    console.error(`  - ${v}`);
  }
  process.exit(1);
}

console.log(`Auditoria de complejidad superada en ${files.length} archivos (CC <= ${MAX_CC}, MI >= ${MIN_MI}).`);
