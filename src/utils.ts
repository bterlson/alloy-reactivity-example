import { Children, OutputDirectory, render } from "@alloy-js/core";

export function visualize(rootDir: OutputDirectory, indent: string = "") {
  const subdirs = rootDir.contents.filter((f) => f.kind === "directory");
  const files = rootDir.contents.filter((f) => f.kind === "file");

  for (const subdir of subdirs) {
    visualize(subdir, `${indent}  `);
  }

  for (const file of files) {
    console.log(`${indent}${file.path}:`);
    console.log("-".repeat(indent.length + file.path.length));
    console.log(`${indent}${file.contents.split("\n").join(`\n${indent}`)}`);
    console.log();
  }
}

export function print(children: Children) {
  return visualize(render(children));
}
