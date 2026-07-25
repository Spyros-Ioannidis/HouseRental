export function preventEnterSubmit(event) {
  if (event.key === "Enter") {
    event.preventDefault();
  }
}

export function toIdNameOptions(items = []) {
  return items.map(({ id, name }) => ({
    value: id,
    label: name,
  }));
}

export function toValueLabelOptions(items = []) {
  return items.map(({ value, label }) => ({
    value,
    label,
  }));
}
