// of course, something like this works...

import {
  Children,
  For,
  List,
  Output,
  reactive,
  refkey,
  StatementList,
} from "@alloy-js/core";
import {
  InterfaceDeclaration,
  SourceFile,
  VarDeclaration,
} from "@alloy-js/typescript";
import { print } from "./utils.js";

const r1 = refkey();
const r2 = refkey();

function DeclareThings() {
  return (
    <List hardline>
      <InterfaceDeclaration name="Foo" refkey={r1} />
      <InterfaceDeclaration name="Bar" refkey={r2} />
    </List>
  );
}

function RefThings() {
  return (
    <StatementList>
      <VarDeclaration let name="foo" type={r1} value="{}" />
      <VarDeclaration let name="bar" type={r2} value="{}" />
    </StatementList>
  );
}

// so obviously we can do this...
console.log("=== simple ===");
print(
  <Output>
    <SourceFile path="decls.ts">
      <DeclareThings />
    </SourceFile>
    <SourceFile path="refs.ts">
      <RefThings />
    </SourceFile>
  </Output>
);

// but we can put the references first too, that's fine.
console.log("=== reverse ===");
print(
  <Output>
    <SourceFile path="refs.ts">
      <RefThings />
    </SourceFile>
    <SourceFile path="decls.ts">
      <DeclareThings />
    </SourceFile>
  </Output>
);

// we can even do something like this:
console.log("=== declaration store ===");
const decls: Children[] = reactive([]);

function DefAndRefThings() {
  // any time anywhere we can push to decls to add declarations
  decls.push(<InterfaceDeclaration name="Foo" refkey={r1} />);
  decls.push(<InterfaceDeclaration name="Bar" refkey={r2} />);
  return (
    <StatementList>
      <VarDeclaration let name="foo" type={r1} value="{}" />
      <VarDeclaration let name="bar" type={r2} value="{}" />
    </StatementList>
  );
}
print(
  <Output>
    <SourceFile path="decls.ts">
      <For each={decls} hardline>
        {(decl) => decl}
      </For>
    </SourceFile>
    <SourceFile path="refs.ts">
      <DefAndRefThings />
    </SourceFile>
  </Output>
);
