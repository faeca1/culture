export const not = pred => it => !pred(it);

export const or = (...preds) => it => {
  for (const p of preds) {
    if (p(it)) return true;
  }
  return false;
}

export const and = (...preds) => it => {
  for (const p of preds) {
    if (!p(it)) return false;
  }
  return true;
};

