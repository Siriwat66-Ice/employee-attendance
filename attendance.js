const cardInput =
  document.getElementById(
    "cardInput"
  );

const scanButton =
  document.getElementById(
    "scanButton"
  );

const scanResult =
  document.getElementById(
    "scanResult"
  );

const resultPhoto =
  document.getElementById(
    "resultPhoto"
  );

const resultInitial =
  document.getElementById(
    "resultInitial"
  );

const resultTitle =
  document.getElementById(
    "resultTitle"
  );

const resultName =
  document.getElementById(
    "resultName"
  );

const resultPosition =
  document.getElementById(
    "resultPosition"
  );

const resultEmployeeId =
  document.getElementById(
    "resultEmployeeId"
  );

const resultTime =
  document.getElementById(
    "resultTime"
  );

const latestAttendance =
  document.getElementById(
    "latestAttendance"
  );

let lastScanCode = "";
let lastScanTimestamp = 0;

function updateAttendanceClock() {
  const now =
    new Date();

  document.getElementById(
    "currentDate"
  ).textContent =
    formatThaiDate(now);

  document.getElementById(
    "currentTime"
  ).textContent =
    now.toLocaleTimeString(
      "th-TH",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    );
}

function showEmployeePhoto(
  employee,
  fallbackText = "HR"
) {
  if (
    employee &&
    employee.photo
  ) {
    resultPhoto.src =
      employee.photo;

    resultPhoto.style.display =
      "block";

    resultInitial.style.display =
      "none";

    return;
  }

  resultPhoto.style.display =
    "none";

  resultInitial.style.display =
    "grid";

  resultInitial.textContent =
    employee
      ? getInitials(employee.name)
      : fallbackText;
}

function showScanResult({
  type,
  title,
  employee = null,
  timeText = "",
  message = "",
  fallbackText = "HR"
}) {
  scanResult.className =
    `scan-result ${type}`;

  resultTitle.textContent =
    title;

  resultTime.textContent =
    timeText;

  showEmployeePhoto(
    employee,
    fallbackText
  );

  if (employee) {
    resultName.textContent =
      employee.name;

    resultPosition.textContent =
      `${employee.department} • ${employee.position}`;

    resultEmployeeId.textContent =
      `รหัสพนักงาน ${employee.employeeId}`;
  } else {
    resultName.textContent =
      message;

    resultPosition.textContent =
      "";

    resultEmployeeId.textContent =
      "";
  }
}

function isDuplicateScan(code) {
  const currentTime =
    Date.now();

  const duplicate =
    code === lastScanCode &&
    currentTime -
      lastScanTimestamp < 3000;

  lastScanCode =
    code;

  lastScanTimestamp =
    currentTime;

  return duplicate;
}

function scanEmployee() {
  const code =
    cardInput.value
      .trim()
      .toUpperCase();

  if (!code) {
    showScanResult({
      type: "error",
      title:
        "กรุณากรอกรหัสพนักงาน",
      message:
        "ตัวอย่าง CARD001 หรือ EMP001",
      fallbackText: "!"
    });

    cardInput.focus();
    return;
  }

  if (isDuplicateScan(code)) {
    showScanResult({
      type: "error",
      title: "กรุณารอสักครู่",
      message:
        "ไม่สามารถลงเวลารหัสเดิมซ้ำภายใน 3 วินาที",
      fallbackText: "⌛"
    });

    cardInput.value = "";
    cardInput.focus();
    return;
  }

  const employees =
    getEmployees();

  const employee =
    employees.find(
      item =>
        item.cardId.toUpperCase() ===
          code ||
        item.employeeId.toUpperCase() ===
          code
    );

  if (!employee) {
    showScanResult({
      type: "error",
      title:
        "ไม่พบข้อมูลพนักงาน",
      message:
        `ไม่มีรหัส ${code} อยู่ในระบบ`,
      fallbackText: "×"
    });

    cardInput.select();
    return;
  }

  const now =
    new Date();

  const today =
    getDateKey(now);

  const records =
    getAttendanceRecords();

  const openRecord =
    [...records]
      .reverse()
      .find(
        record =>
          record.employeeId ===
            employee.employeeId &&
          record.dateKey ===
            today &&
          !record.checkOut
      );

  if (openRecord) {
    openRecord.checkOut =
      now.toISOString();

    showScanResult({
      type: "check-out",
      title:
        "ลงเวลาออกงานสำเร็จ",
      employee,
      timeText:
        `เวลาออก ${formatThaiTime(now)}`
    });
  } else {
    records.push({
      recordId:
        `attendance-${Date.now()}`,

      employeeId:
        employee.employeeId,

      cardId:
        employee.cardId,

      name:
        employee.name,

      department:
        employee.department,

      position:
        employee.position,

      photo:
        employee.photo || "",

      dateKey:
        today,

      checkIn:
        now.toISOString(),

      checkOut:
        null
    });

    showScanResult({
      type: "check-in",
      title:
        "ลงเวลาเข้างานสำเร็จ",
      employee,
      timeText:
        `เวลาเข้า ${formatThaiTime(now)}`
    });
  }

  saveAttendanceRecords(records);

  renderLatestAttendance();

  cardInput.value = "";
  cardInput.focus();
}

function renderLatestAttendance() {
  const employees =
    getEmployees();

  const employeeMap =
    new Map(
      employees.map(
        employee => [
          employee.employeeId,
          employee
        ]
      )
    );

  const records =
    getTodayRecords()
      .sort(
        (recordA, recordB) => {
          const timeA =
            new Date(
              recordA.checkOut ||
              recordA.checkIn
            );

          const timeB =
            new Date(
              recordB.checkOut ||
              recordB.checkIn
            );

          return timeB - timeA;
        }
      )
      .slice(0, 5);

  if (records.length === 0) {
    latestAttendance.innerHTML = `
      <div
        class="empty-state"
        style="display:block"
      >
        ยังไม่มีรายการลงเวลาในวันนี้
      </div>
    `;

    return;
  }

  latestAttendance.innerHTML =
    records.map(record => {
      const employee =
        employeeMap.get(
          record.employeeId
        ) || record;

      const isWorking =
        !record.checkOut;

      const timeText =
        isWorking
          ? `เข้า ${formatThaiTime(
              record.checkIn,
              false
            )}`
          : `ออก ${formatThaiTime(
              record.checkOut,
              false
            )}`;

      return `
        <article class="latest-item">

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
                  employee.department
                )}
                •
                ${escapeHtml(
                  employee.position
                )}
              </small>

            </div>

          </div>

          <div class="status-box">

            <span
              class="status-pill ${
                isWorking
                  ? "working"
                  : "finished"
              }"
            >
              ${
                isWorking
                  ? "กำลังทำงาน"
                  : "ออกงานแล้ว"
              }
            </span>

            <small>${timeText}</small>

          </div>

        </article>
      `;
    }).join("");
}

scanButton.addEventListener(
  "click",
  scanEmployee
);

cardInput.addEventListener(
  "keydown",
  event => {
    if (event.key === "Enter") {
      scanEmployee();
    }
  }
);

document
  .querySelectorAll(
    "[data-test-code]"
  )
  .forEach(button => {
    button.addEventListener(
      "click",
      () => {
        cardInput.value =
          button.dataset.testCode;

        scanEmployee();
      }
    );
  });

window.addEventListener(
  "focus",
  renderLatestAttendance
);

updateAttendanceClock();

setInterval(
  updateAttendanceClock,
  1000
);

renderLatestAttendance();