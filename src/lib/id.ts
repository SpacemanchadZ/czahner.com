let counter = 0;
/** Short unique id for list items (stable React keys, drag-and-drop handles). */
export function uid(prefix = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}
