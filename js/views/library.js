/* ==========================================================================
   ORIC-IOAP View: Document Library & Research Repository
   Salim Habib University (SHU), Karachi
   ========================================================================== */

const LibraryView = {
  currentPage: 1,
  pageSize: 15,

  render(container, store) {
    const courses = [...new Set(store.projects.map(p => p.courseTitle).filter(Boolean))].sort();
    const domains = [...new Set(store.projects.map(p => p.domain).filter(Boolean))].sort();
    const areas = store.industrialAreas || [];

    const filtered = store.getFilteredProjects();
    const totalPages = Math.ceil(filtered.length / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = 1;

    const startIdx = (this.currentPage - 1) * this.pageSize;
    const paginatedProjects = filtered.slice(startIdx, startIdx + this.pageSize);

    container.innerHTML = `
      <div class="view-header" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: var(--shu-navy);">
            Document Library & Research Repository
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Search, filter, and inspect ${store.projects.length} university research projects from Salim Habib University's Faculty of Pharmacy.
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary btn-sm" onclick="window.oricApp.navigate('upload')">
            <i class="fa-solid fa-plus"></i> Ingest New Research
          </button>
          <button class="btn btn-secondary btn-sm" onclick="LibraryView.exportFilteredCSV()">
            <i class="fa-solid fa-file-csv"></i> Export Table (CSV)
          </button>
        </div>
      </div>

      <!-- Filter Controls Bar -->
      <div class="library-filter-bar">
        <div class="search-input-wrap">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="libSearchInput" placeholder="Search by title, abstract keyword, PI, or ID..." value="${store.filters.searchQuery || ''}" oninput="LibraryView.handleSearch(this.value)">
        </div>

        <select class="filter-select" id="libCourseSelect" onchange="LibraryView.handleCourseFilter(this.value)">
          <option value="">All Pharmacy Courses (${courses.length})</option>
          ${courses.map(c => `<option value="${c}" ${store.filters.course === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>

        <select class="filter-select" id="libDomainSelect" onchange="LibraryView.handleDomainFilter(this.value)">
          <option value="">All Research Domains</option>
          ${domains.map(d => `<option value="${d}" ${store.filters.domain === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>

        <select class="filter-select" id="libPrioritySelect" onchange="LibraryView.handlePriorityFilter(this.value)">
          <option value="">All Priorities</option>
          <option value="High Priority" ${store.filters.priority === 'High Priority' ? 'selected' : ''}>High Priority (Deals)</option>
          <option value="Medium Priority" ${store.filters.priority === 'Medium Priority' ? 'selected' : ''}>Medium Priority</option>
          <option value="Standard Priority" ${store.filters.priority === 'Standard Priority' ? 'selected' : ''}>Standard Priority</option>
        </select>

        <select class="filter-select" id="libAreaSelect" onchange="LibraryView.handleAreaFilter(this.value)">
          <option value="">All Karachi Areas</option>
          ${areas.map(a => `<option value="${a.name}" ${store.filters.area === a.name ? 'selected' : ''}>${a.name}</option>`).join('')}
        </select>

        ${(store.filters.searchQuery || store.filters.course || store.filters.domain || store.filters.priority || store.filters.area) ? `
          <button class="btn btn-sm btn-secondary" onclick="LibraryView.resetFilters()">
            <i class="fa-solid fa-xmark"></i> Clear Filters
          </button>
        ` : ''}
      </div>

      <!-- Projects Data Table -->
      <div class="table-responsive">
        <table class="oric-table">
          <thead>
            <tr>
              <th style="width: 110px;">Project ID</th>
              <th>Innovation Title & Abstract</th>
              <th>Course / Department</th>
              <th>Faculty PI</th>
              <th>TRL</th>
              <th>Priority</th>
              <th>Target Market (SOM)</th>
              <th>Primary Industrial Fit</th>
              <th style="text-align: right; width: 140px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${paginatedProjects.length === 0 ? `
              <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
                  <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 8px; display: block;"></i>
                  No research projects found matching your search and filter criteria.
                </td>
              </tr>
            ` : paginatedProjects.map(p => {
              const priorityClass = p.commercialization.priority === 'High Priority' ? 'badge-high' :
                                    p.commercialization.priority === 'Medium Priority' ? 'badge-medium' : 'badge-standard';
              const topArea = p.matchedAreas && p.matchedAreas[0] ? p.matchedAreas[0].name : 'Korangi Industrial Area';
              return `
                <tr>
                  <td>
                    <span style="font-family: monospace; font-weight: 700; color: var(--shu-navy); font-size: 0.8rem;">
                      ${p.id}
                    </span>
                  </td>
                  <td>
                    <a class="table-project-title" onclick="window.oricApp.openProjectDossier('${p.id}')">
                      ${p.title}
                    </a>
                    <div style="font-size: 0.74rem; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; margin-top: 3px;">
                      ${p.abstract}
                    </div>
                  </td>
                  <td>
                    <div style="font-size: 0.78rem; font-weight: 600; color: var(--shu-navy);">${p.courseCode || 'PHR'}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${p.courseTitle || 'Pharmacy'}</div>
                  </td>
                  <td>
                    <div style="font-size: 0.8rem; font-weight: 500; color: var(--text-secondary);">${p.facultyPI}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">${p.studentGroup || ''}</div>
                  </td>
                  <td>
                    <span class="badge badge-gray" style="font-size: 0.72rem; font-weight: 700;">
                      TRL ${p.commercialization ? p.commercialization.trlLevel : 3}
                    </span>
                  </td>
                  <td>
                    <span class="badge ${priorityClass}">
                      ${p.commercialization ? p.commercialization.priority.replace(' Priority', '') : 'Standard'}
                    </span>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--shu-navy); font-size: 0.82rem;">
                      ${store.formatMoney(p.marketSizing ? p.marketSizing.somPKR : 150)}
                    </div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">Serviceable Obtainable</div>
                  </td>
                  <td>
                    <span class="sector-tag" style="white-space: nowrap;">
                      <i class="fa-solid fa-location-dot"></i> ${topArea.replace(' Industrial Area', '').replace(' Industrial Zone', '')}
                    </span>
                  </td>
                  <td style="text-align: right; white-space: nowrap;">
                    <button class="btn btn-sm btn-primary" title="Open AI Analytical Dossier" onclick="window.oricApp.openProjectDossier('${p.id}')">
                      <i class="fa-solid fa-microscope"></i> Dossier
                    </button>
                    <button class="btn btn-sm btn-secondary" title="View Commercial Forecast" onclick="window.oricApp.openForecast('${p.id}')">
                      <i class="fa-solid fa-chart-line"></i>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Pagination Bar -->
      <div class="pagination-bar">
        <div>
          Showing <strong>${filtered.length > 0 ? startIdx + 1 : 0}</strong> to <strong>${Math.min(startIdx + this.pageSize, filtered.length)}</strong> of <strong>${filtered.length}</strong> research projects
        </div>
        <div class="pagination-controls">
          <button class="page-btn" ${this.currentPage <= 1 ? 'disabled' : ''} onclick="LibraryView.setPage(${this.currentPage - 1})">
            <i class="fa-solid fa-chevron-left"></i> Previous
          </button>
          
          ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pNum = i + 1;
            if (totalPages > 5 && this.currentPage > 3) {
              pNum = this.currentPage - 3 + i;
              if (pNum > totalPages) pNum = totalPages - (4 - i);
            }
            return `
              <button class="page-btn ${this.currentPage === pNum ? 'active' : ''}" onclick="LibraryView.setPage(${pNum})">
                ${pNum}
              </button>
            `;
          }).join('')}

          <button class="page-btn" ${this.currentPage >= totalPages ? 'disabled' : ''} onclick="LibraryView.setPage(${this.currentPage + 1})">
            Next <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;
  },

  handleSearch(val) {
    window.oricStore.filters.searchQuery = val;
    this.currentPage = 1;
    this.render(document.getElementById('libraryViewContainer'), window.oricStore);
  },

  handleCourseFilter(val) {
    window.oricStore.filters.course = val;
    this.currentPage = 1;
    this.render(document.getElementById('libraryViewContainer'), window.oricStore);
  },

  handleDomainFilter(val) {
    window.oricStore.filters.domain = val;
    this.currentPage = 1;
    this.render(document.getElementById('libraryViewContainer'), window.oricStore);
  },

  handlePriorityFilter(val) {
    window.oricStore.filters.priority = val;
    this.currentPage = 1;
    this.render(document.getElementById('libraryViewContainer'), window.oricStore);
  },

  handleAreaFilter(val) {
    window.oricStore.filters.area = val;
    this.currentPage = 1;
    this.render(document.getElementById('libraryViewContainer'), window.oricStore);
  },

  resetFilters() {
    window.oricStore.filters = { searchQuery: '', course: '', domain: '', priority: '', trl: '', area: '' };
    this.currentPage = 1;
    this.render(document.getElementById('libraryViewContainer'), window.oricStore);
  },

  setPage(num) {
    this.currentPage = num;
    this.render(document.getElementById('libraryViewContainer'), window.oricStore);
  },

  exportFilteredCSV() {
    const list = window.oricStore.getFilteredProjects();
    if (list.length === 0) {
      window.oricApp.showToast('No projects to export', 'warning');
      return;
    }

    const headers = ["Project ID", "Title", "Course Code", "Course Title", "Faculty PI", "Domain", "TRL", "Priority", "TAM PKR (M)", "SOM PKR (M)", "Top Karachi Area"];
    const csvRows = [headers.join(',')];

    list.forEach(p => {
      const topArea = p.matchedAreas && p.matchedAreas[0] ? p.matchedAreas[0].name : '';
      const row = [
        `"${p.id}"`,
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${p.courseCode || ''}"`,
        `"${(p.courseTitle || '').replace(/"/g, '""')}"`,
        `"${(p.facultyPI || '').replace(/"/g, '""')}"`,
        `"${p.domain || ''}"`,
        p.commercialization ? p.commercialization.trlLevel : 3,
        `"${p.commercialization ? p.commercialization.priority : ''}"`,
        p.marketSizing ? p.marketSizing.tamPKR : 0,
        p.marketSizing ? p.marketSizing.somPKR : 0,
        `"${topArea}"`
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SHU_ORIC_Research_Repository_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    window.oricApp.showToast(`Exported ${list.length} projects to CSV`, 'success');
  }
};
