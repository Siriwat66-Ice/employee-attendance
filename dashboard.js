const PROCESS_COLORS = [
    "blue",
    "purple",
    "green",
    "orange"
  ];
  
  function updateDashboardClock() {
    const now =
      new Date();
  
    document.getElementById(
      "dashboardTime"
    ).textContent =
      now.toLocaleTimeString(
        "th-TH",
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }
      );
  
    document.getElementById(
      "dashboardDate"
    ).textContent =
      formatThaiDate(now);
  }
  
  function renderDashboardSummary(
    employees,
    todayRecords
  ) {
    const statuses =
      employees.map(
        employee =>
          getEmployeeTodayStatus(
            employee.employeeId,
            todayRecords
          )
      );
  
    const total =
      employees.length;
  
    const working =
      statuses.filter(
        status =>
          status.key === "working"
      ).length;
  
    const finished =
      statuses.filter(
        status =>
          status.key === "finished"
      ).length;
  
    const absent =
      statuses.filter(
        status =>
          status.key === "absent"
      ).length;
  
    const workingPercent =
      total === 0
        ? 0
        : Math.round(
            (working / total) *
            100
          );
  
    document.getElementById(
      "totalEmployees"
    ).textContent =
      total;
  
    document.getElementById(
      "workingEmployees"
    ).textContent =
      working;
  
    document.getElementById(
      "finishedEmployees"
    ).textContent =
      finished;
  
    document.getElementById(
      "notCheckedInEmployees"
    ).textContent =
      absent;
  
    document.getElementById(
      "workingPercent"
    ).textContent =
      `${workingPercent}% ของพนักงาน`;
  
    document.getElementById(
      "todayRecordBadge"
    ).textContent =
      `${todayRecords.length} รายการวันนี้`;
  }
  
  function createProcessData(
    employees,
    todayRecords
  ) {
    const departmentMap = {};
  
    employees.forEach(employee => {
      const department =
        employee.department ||
        "ไม่ระบุแผนก";
  
      if (!departmentMap[department]) {
        departmentMap[department] = {
          name: department,
          total: 0,
          working: 0
        };
      }
  
      departmentMap[
        department
      ].total += 1;
  
      const status =
        getEmployeeTodayStatus(
          employee.employeeId,
          todayRecords
        );
  
      if (status.key === "working") {
        departmentMap[
          department
        ].working += 1;
      }
    });
  
    return Object.values(
      departmentMap
    );
  }
  
  function renderProcessCards(
    employees,
    todayRecords
  ) {
    const processGrid =
      document.getElementById(
        "processGrid"
      );
  
    const processData =
      createProcessData(
        employees,
        todayRecords
      );
  
    processGrid.innerHTML =
      processData.map(
        (process, index) => {
          const percent =
            process.total === 0
              ? 0
              : Math.round(
                  (
                    process.working /
                    process.total
                  ) * 100
                );
  
          const color =
            PROCESS_COLORS[
              index %
              PROCESS_COLORS.length
            ];
  
          let statusText =
            "กำลังทำงาน";
  
          if (percent < 40) {
            statusText =
              "ต้องติดตาม";
          } else if (percent < 75) {
            statusText =
              "บางส่วนทำงาน";
          }
  
          return `
            <article class="process-card">
  
              <div class="process-top">
  
                <span
                  class="process-tag ${color}"
                >
                  ${escapeHtml(
                    process.name
                  )}
                </span>
  
                <span class="process-status">
                  ${statusText}
                </span>
  
              </div>
  
              <div>
  
                <h3 class="process-name">
                  ${escapeHtml(
                    process.name
                  )}
                </h3>
  
                <p class="process-count">
  
                  <strong>
                    ${process.working}
                  </strong>
  
                  /
                  ${process.total} คน
  
                </p>
  
                <p class="process-description">
                  กำลังปฏิบัติงาน
                </p>
  
                <div class="progress-track">
  
                  <div
                    class="progress-fill ${color}"
                    style="width:${percent}%"
                  ></div>
  
                </div>
  
                <div class="progress-labels">
                  <span>กำลังทำงาน</span>
                  <span>${percent}%</span>
                </div>
  
              </div>
  
            </article>
          `;
        }
      ).join("");
  }
  
  function renderDepartmentFilter(
    employees
  ) {
    const departmentFilter =
      document.getElementById(
        "departmentFilter"
      );
  
    const currentValue =
      departmentFilter.value;
  
    const departments = [
      ...new Set(
        employees.map(
          employee =>
            employee.department
        )
      )
    ];
  
    departmentFilter.innerHTML = `
      <option value="">
        ทุกแผนก
      </option>
  
      ${departments.map(
        department => `
          <option
            value="${escapeHtml(department)}"
          >
            ${escapeHtml(department)}
          </option>
        `
      ).join("")}
    `;
  
    departmentFilter.value =
      currentValue;
  }
  
  function renderDashboardTable(
    employees,
    todayRecords
  ) {
    const tableBody =
      document.getElementById(
        "dashboardTableBody"
      );
  
    const emptyMessage =
      document.getElementById(
        "dashboardEmpty"
      );
  
    const searchText =
      document.getElementById(
        "dashboardSearch"
      ).value
        .trim()
        .toLowerCase();
  
    const departmentValue =
      document.getElementById(
        "departmentFilter"
      ).value;
  
    const statusValue =
      document.getElementById(
        "statusFilter"
      ).value;
  
    const filteredRows =
      employees
        .map(employee => ({
          employee,
  
          status:
            getEmployeeTodayStatus(
              employee.employeeId,
              todayRecords
            )
        }))
        .filter(
          ({ employee, status }) => {
            const searchableText = [
              employee.name,
              employee.employeeId,
              employee.department,
              employee.position
            ]
              .join(" ")
              .toLowerCase();
  
            return (
              (
                !searchText ||
                searchableText.includes(
                  searchText
                )
              ) &&
              (
                !departmentValue ||
                employee.department ===
                  departmentValue
              ) &&
              (
                !statusValue ||
                status.key ===
                  statusValue
              )
            );
          }
        );
  
    if (filteredRows.length === 0) {
      tableBody.innerHTML = "";
  
      emptyMessage.style.display =
        "block";
  
      return;
    }
  
    emptyMessage.style.display =
      "none";
  
    tableBody.innerHTML =
      filteredRows.map(
        ({ employee, status }) => `
          <tr>
  
            <td>
  
              <div class="person-cell">
  
                ${createPersonAvatarHtml(
                  employee
                )}
  
                <div class="person-text">
  
                  <strong>
                    ${escapeHtml(
                      employee.name
                    )}
                  </strong>
  
                  <small>
                    ${escapeHtml(
                      employee.employeeId
                    )}
                    •
                    ${escapeHtml(
                      employee.position
                    )}
                  </small>
  
                </div>
  
              </div>
  
            </td>
  
            <td>
              ${escapeHtml(
                employee.department
              )}
            </td>
  
            <td>
              ${formatThaiTime(
                status.record?.checkIn
              )}
            </td>
  
            <td>
              ${formatThaiTime(
                status.record?.checkOut
              )}
            </td>
  
            <td>
              ${formatDuration(
                status.record?.checkIn,
                status.record?.checkOut
              )}
            </td>
  
            <td>
  
              <span
                class="status-pill ${
                  status.key
                }"
              >
                ${status.label}
              </span>
  
            </td>
  
          </tr>
        `
      ).join("");
  }
  
  function renderDashboard() {
    const employees =
      getEmployees();
  
    const todayRecords =
      getTodayRecords();
  
    renderDashboardSummary(
      employees,
      todayRecords
    );
  
    renderProcessCards(
      employees,
      todayRecords
    );
  
    renderDepartmentFilter(
      employees
    );
  
    renderDashboardTable(
      employees,
      todayRecords
    );
  
    document.getElementById(
      "dashboardUpdated"
    ).textContent =
      `อัปเดตล่าสุด: ${
        formatThaiTime(new Date())
      }`;
  }
  
  document.getElementById(
    "refreshDashboard"
  ).addEventListener(
    "click",
    renderDashboard
  );
  
  document.getElementById(
    "dashboardSearch"
  ).addEventListener(
    "input",
    renderDashboard
  );
  
  document.getElementById(
    "departmentFilter"
  ).addEventListener(
    "change",
    renderDashboard
  );
  
  document.getElementById(
    "statusFilter"
  ).addEventListener(
    "change",
    renderDashboard
  );
  
  window.addEventListener(
    "focus",
    renderDashboard
  );
  
  updateDashboardClock();
  
  setInterval(
    updateDashboardClock,
    1000
  );
  
  renderDashboard();