export function calculateTotalPages(findingsCount: number): number {
  const checklistPages = findingsCount > 0 ? Math.ceil(findingsCount / 3) : 0;
  const detailPages = findingsCount > 0 ? findingsCount : 1;
  return 2 + checklistPages + detailPages;
}
