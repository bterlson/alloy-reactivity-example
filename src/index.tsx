// of course, something like this works...

import {
  Block,
  Children,
  computed,
  effect,
  For,
  List,
  Match,
  memo,
  onCleanup,
  Output,
  reactive,
  ref,
  Ref,
  Refkey,
  refkey,
  StatementList,
  Switch,
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

// or more advanced things
function createDeclarationStore() {
  const refCounts = new WeakMap<Refkey, Ref<number>>();
  const declarations: Map<Refkey, Children> = reactive(new Map()) as any;

  function InlineOrReference({ refkey }: any) {
    if (!refCounts.has(refkey)) {
      // initialize reactives for this decl
      refCounts.set(refkey, ref(0));

      // compute whether we need a decl
      const needsDecl = computed(() => refCounts.get(refkey)!.value > 1);

      // effect is run when needsDecl changes
      effect(() => {
        if (needsDecl.value) {
          declarations.set(
            refkey,
            <InterfaceDeclaration name="iface" refkey={refkey} />
          );
        } else {
          declarations.delete(refkey);
        }
      });
    }

    // get the ref for the ref count
    const refCount = refCounts.get(refkey)!;
    refCount.value++;

    // decrement count when the component is unmounted
    onCleanup(() => {
      refCount.value--;
    });

    return (
      <Switch>
        <Match when={refCount.value < 2}>
          <Block>Inline declaration</Block>
        </Match>
        <Match else>{refkey}</Match>
      </Switch>
    );
  }

  return {
    declarations: computed(() => [...declarations.values()]),
    InlineOrReference,
  };
}

const { declarations, InlineOrReference } = createDeclarationStore();
console.log("=== inline or reference ===");
print(
  <Output>
    <SourceFile path="decls.ts">
      <For each={declarations} hardline>
        {(decl) => decl}
      </For>
    </SourceFile>
    <SourceFile path="refs.ts">
      <StatementList>
        <VarDeclaration
          name="v1"
          type={<InlineOrReference refkey={r1} />}
          value="{}"
        />
        <VarDeclaration
          name="v2"
          type={<InlineOrReference refkey={r2} />}
          value="{}"
        />
        <VarDeclaration
          name="v3"
          type={<InlineOrReference refkey={r1} />}
          value="{}"
        />
      </StatementList>
    </SourceFile>
  </Output>
);
