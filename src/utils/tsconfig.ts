export function hasImportUnusedAsType(tsConfig: Record<string, any>) {
  if (
    tsConfig &&
    tsConfig.compilerOptions &&
    tsConfig.compilerOptions.importsNotUsedAsValues
  ) {
    const rule = tsConfig.compilerOptions.importsNotUsedAsValues.toLowerCase();

    if (rule === "error" || rule === "remove") {
      return true;
    }

    return false;
  }

  return false;
}
