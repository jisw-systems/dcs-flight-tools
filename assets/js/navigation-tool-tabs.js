function initNavigationToolTabs() {
  var tabList = document.querySelector('[role="tablist"]');
  if (!tabList) return;

  var tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
  var panels = tabs.map(function (tab) {
    return document.getElementById(tab.getAttribute('aria-controls'));
  });

  function tabForCurrentHash() {
    var hash = window.location.hash.slice(1);
    return tabs.find(function (tab) {
      return tab.dataset.tabHash === hash || tab.id === hash;
    });
  }

  function activateTab(activeTab, moveFocus) {
    tabs.forEach(function (tab, index) {
      var isActive = tab === activeTab;
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      panels[index].hidden = !isActive;
    });
    if (moveFocus) activeTab.focus();
  }

  function updateTabHash(tab) {
    var hash = tab.dataset.tabHash ? '#' + tab.dataset.tabHash : '';
    window.history.replaceState(null, '', window.location.pathname + window.location.search + hash);
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      activateTab(tab, false);
      updateTabHash(tab);
    });

    tab.addEventListener('keydown', function (event) {
      var nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      activateTab(tabs[nextIndex], true);
      updateTabHash(tabs[nextIndex]);
    });
  });

  var linkedTab = tabForCurrentHash();
  if (linkedTab) activateTab(linkedTab, false);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigationToolTabs, { once: true });
} else {
  initNavigationToolTabs();
}
