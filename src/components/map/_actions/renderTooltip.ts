export function renderTooltipContent(
  container: HTMLDivElement,
  properties: Record<string, unknown>
) {
  container.innerHTML = '';

  const entries = Object.entries(properties);

  if (entries.length === 0) {
    container.textContent = '---';
    return;
  }

  entries.forEach(([key, value]) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '6px';
    row.style.alignItems = 'center';

    const keyEl = document.createElement('strong');
    keyEl.textContent = `${key}:`;

    const valueEl = document.createElement('span');
    valueEl.textContent = String(value);

    valueEl.style.overflow = 'hidden';
    valueEl.style.textOverflow = 'ellipsis';
    valueEl.style.whiteSpace = 'nowrap';
    valueEl.style.flex = '1';
    valueEl.style.minWidth = '0';

    row.appendChild(keyEl);
    row.appendChild(valueEl);

    container.appendChild(row);
  });
}
