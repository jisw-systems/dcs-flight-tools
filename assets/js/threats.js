document.addEventListener('DOMContentLoaded', function () {
  var database = window.rwrWorkbook;
  var searchInput = document.getElementById('threat-search');
  var resultsCount = document.getElementById('threat-results-count');
  var tablesRoot = document.getElementById('threat-tables');
  var stickyHeader = document.createElement('div');
  var stickyTable = document.createElement('table');
  var stickyFrame = 0;

  if (!database || !searchInput || !resultsCount || !tablesRoot) return;

  stickyHeader.className = 'threat-sticky-header';
  stickyHeader.setAttribute('aria-hidden', 'true');
  stickyTable.className = 'threat-table threat-sticky-table';
  stickyHeader.appendChild(stickyTable);
  document.documentElement.appendChild(stickyHeader);

  function createCell(value) {
    var cell = document.createElement('td');
    cell.textContent = value || '—';
    return cell;
  }

  function renderTable(section, sectionIndex) {
    if (!section.headers.length) return null;
    var wrapper = document.createElement('section');
    wrapper.className = 'threat-workbook-section';
    var heading = document.createElement('div');
    heading.className = 'threat-category-heading';
    heading.innerHTML = '<span class="threat-category-index">' + String(sectionIndex).padStart(2, '0') + '</span><h2>' + section.title + '</h2><span class="threat-category-count">' + section.rows.length + ' entries</span>';
    wrapper.appendChild(heading);

    var tableWrapper = document.createElement('div');
    tableWrapper.className = 'threat-table-wrapper';
    var table = document.createElement('table');
    table.className = 'threat-table threat-workbook-table';
    table.setAttribute('aria-label', section.title);

    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    section.headers.forEach(function (header) {
      var th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    var filterRow = document.createElement('tr');
    filterRow.className = 'threat-filter-row';
    section.headers.forEach(function (header) {
      var th = document.createElement('th');
      var input = document.createElement('input');
      input.className = 'threat-column-filter';
      input.type = 'search';
      input.placeholder = header;
      input.setAttribute('aria-label', 'Filter ' + header);
      th.appendChild(input);
      filterRow.appendChild(th);
    });
    thead.appendChild(filterRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    section.rows.forEach(function (row) {
      var tr = document.createElement('tr');
      row.forEach(function (value, index) {
        var cell = createCell(value);
        if (index === 0) cell.className = 'threat-code-cell';
        if (index === 1 || (section.title === 'Surface Threats' && index === 3) || (section.title === 'Naval Threats' && index === 3)) cell.className = 'threat-name-cell';
        tr.appendChild(cell);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    wrapper.appendChild(tableWrapper);
    return wrapper;
  }

  var renderedSections = [];
  database.sections.forEach(function (section, index) {
    var table = renderTable(section, index + 1);
    if (table) {
      renderedSections.push({ section: section, element: table });
      tablesRoot.appendChild(table);
    }
  });

  function filterTables() {
    var query = searchInput.value.trim().toLowerCase();
    var visibleRows = 0;
    renderedSections.forEach(function (item) {
      var filters = Array.from(item.element.querySelectorAll('.threat-column-filter')).map(function (input) { return input.value.trim().toLowerCase(); });
      var rows = item.element.querySelectorAll('tbody tr');
      item.section.rows.forEach(function (row, rowIndex) {
        var searchable = row.join(' ').toLowerCase();
        var matches = (!query || searchable.indexOf(query) !== -1) && filters.every(function (filter, columnIndex) {
          return !filter || String(row[columnIndex] || '').toLowerCase().indexOf(filter) !== -1;
        });
        rows[rowIndex].hidden = !matches;
        if (matches) visibleRows += 1;
      });
      item.element.hidden = !Array.from(rows).some(function (row) { return !row.hidden; });
    });
    resultsCount.textContent = visibleRows + (visibleRows === 1 ? ' entry' : ' entries') + ' shown';
    scheduleStickyHeaderUpdate();
  }

  function updateStickyHeader() {
    var stickyTop = 0;
    var activeTable = null;

    renderedSections.some(function (item) {
      if (item.element.hidden) return false;
      var tableWrapper = item.element.querySelector('.threat-table-wrapper');
      var table = tableWrapper.querySelector('.threat-table');
      var headerRow = table.tHead.rows[0];
      var wrapperRect = tableWrapper.getBoundingClientRect();
      var headerRect = headerRow.getBoundingClientRect();
      if (headerRect.top < stickyTop && wrapperRect.bottom > stickyTop + headerRect.height) {
        activeTable = { wrapper: tableWrapper, table: table, headerRow: headerRow };
        return true;
      }
      return false;
    });

    if (!activeTable) {
      stickyHeader.classList.remove('is-visible');
      stickyTable.replaceChildren();
      return;
    }

    var wrapper = activeTable.wrapper;
    var wrapperRect = wrapper.getBoundingClientRect();
    var tableRect = activeTable.table.getBoundingClientRect();
    var clonedRow = activeTable.headerRow.cloneNode(true);
    Array.from(clonedRow.cells).forEach(function (cell, index) {
      cell.style.width = activeTable.headerRow.cells[index].getBoundingClientRect().width + 'px';
      cell.style.position = 'static';
    });
    var stickyHead = document.createElement('thead');
    stickyHead.appendChild(clonedRow);
    stickyTable.replaceChildren(stickyHead);
    stickyHeader.style.left = wrapperRect.left + wrapper.clientLeft + 'px';
    stickyHeader.style.width = wrapper.clientWidth + 'px';
    stickyTable.style.width = tableRect.width + 'px';
    stickyTable.style.transform = 'translateX(' + -wrapper.scrollLeft + 'px)';
    stickyHeader.classList.add('is-visible');
  }

  function scheduleStickyHeaderUpdate() {
    if (stickyFrame) return;
    stickyFrame = window.requestAnimationFrame(function () {
      stickyFrame = 0;
      updateStickyHeader();
    });
  }

  window.addEventListener('scroll', scheduleStickyHeaderUpdate, { passive: true });
  window.addEventListener('resize', scheduleStickyHeaderUpdate);
  tablesRoot.querySelectorAll('.threat-table-wrapper').forEach(function (wrapper) {
    wrapper.addEventListener('scroll', scheduleStickyHeaderUpdate, { passive: true });
  });

  searchInput.addEventListener('input', filterTables);
  tablesRoot.querySelectorAll('.threat-column-filter').forEach(function (input) {
    input.addEventListener('input', filterTables);
  });
  filterTables();
});
