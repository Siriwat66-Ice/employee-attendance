const STORAGE_KEYS = {
    employees: "employeeSystemV2Employees",
    attendance: "employeeSystemV2Attendance"
  };
  
  const DEFAULT_EMPLOYEES = [
    {
      recordId: "employee-1",
      employeeId: "EMP001",
      cardId: "CARD001",
      name: "สมชาย ใจดี",
      department: "CUT",
      position: "พนักงานตัด",
      shift: "กะเช้า 08:00–17:00",
      photo: ""
    },
    {
      recordId: "employee-2",
      employeeId: "EMP002",
      cardId: "CARD002",
      name: "สุดา มั่นคง",
      department: "ASM",
      position: "พนักงานประกอบ",
      shift: "กะเช้า 08:00–17:00",
      photo: ""
    },
    {
      recordId: "employee-3",
      employeeId: "EMP003",
      cardId: "CARD003",
      name: "อนันต์ ตั้งใจ",
      department: "QC",
      position: "เจ้าหน้าที่ตรวจสอบคุณภาพ",
      shift: "กะกลางวัน 09:00–18:00",
      photo: ""
    },
    {
      recordId: "employee-4",
      employeeId: "EMP004",
      cardId: "CARD004",
      name: "วรัญญา มีสุข",
      department: "PKG",
      position: "พนักงานบรรจุสินค้า",
      shift: "กะเช้า 08:00–17:00",
      photo: ""
    }
  ];
  
  function readJson(key, fallback) {
    try {
      const savedValue =
        localStorage.getItem(key);
  
      return savedValue
        ? JSON.parse(savedValue)
        : fallback;
    } catch (error) {
      console.error(error);
      return fallback;
    }
  }
  
  function writeJson(key, value) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );
  
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  
  function getEmployees() {
    const savedEmployees =
      readJson(
        STORAGE_KEYS.employees,
        null
      );
  
    if (!Array.isArray(savedEmployees)) {
      writeJson(
        STORAGE_KEYS.employees,
        DEFAULT_EMPLOYEES
      );
  
      return DEFAULT_EMPLOYEES.map(
        employee => ({
          ...employee
        })
      );
    }
  
    return savedEmployees.map(
      employee => ({
        ...employee,
        photo: employee.photo || ""
      })
    );
  }
  
  function saveEmployees(employees) {
    return writeJson(
      STORAGE_KEYS.employees,
      employees
    );
  }
  
  function getAttendanceRecords() {
    const records =
      readJson(
        STORAGE_KEYS.attendance,
        []
      );
  
    return Array.isArray(records)
      ? records
      : [];
  }
  
  function saveAttendanceRecords(records) {
    return writeJson(
      STORAGE_KEYS.attendance,
      records
    );
  }
  
  function getDateKey(date = new Date()) {
    const year =
      date.getFullYear();
  
    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");
  
    const day =
      String(
        date.getDate()
      ).padStart(2, "0");
  
    return `${year}-${month}-${day}`;
  }
  
  function formatThaiTime(
    dateValue,
    showSeconds = true
  ) {
    if (!dateValue) {
      return "-";
    }
  
    const options = {
      hour: "2-digit",
      minute: "2-digit"
    };
  
    if (showSeconds) {
      options.second = "2-digit";
    }
  
    return new Date(dateValue)
      .toLocaleTimeString(
        "th-TH",
        options
      );
  }
  
  function formatThaiDate(dateValue) {
    return new Date(dateValue)
      .toLocaleDateString(
        "th-TH",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        }
      );
  }
  
  function getInitials(name = "") {
    const words =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);
  
    if (words.length === 0) {
      return "HR";
    }
  
    return words
      .slice(0, 2)
      .map(word => word[0])
      .join("");
  }
  
  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  
  function getTodayRecords(
    records = getAttendanceRecords()
  ) {
    const today =
      getDateKey();
  
    return records.filter(
      record =>
        record.dateKey === today
    );
  }
  
  function getLatestRecordForEmployee(
    employeeId,
    records = getTodayRecords()
  ) {
    return [...records]
      .filter(
        record =>
          record.employeeId ===
          employeeId
      )
      .sort(
        (recordA, recordB) =>
          new Date(recordB.checkIn) -
          new Date(recordA.checkIn)
      )[0] || null;
  }
  
  function getEmployeeTodayStatus(
    employeeId,
    records = getTodayRecords()
  ) {
    const latestRecord =
      getLatestRecordForEmployee(
        employeeId,
        records
      );
  
    if (!latestRecord) {
      return {
        key: "absent",
        label: "ยังไม่เข้างาน",
        record: null
      };
    }
  
    if (!latestRecord.checkOut) {
      return {
        key: "working",
        label: "กำลังทำงาน",
        record: latestRecord
      };
    }
  
    return {
      key: "finished",
      label: "ออกงานแล้ว",
      record: latestRecord
    };
  }
  
  function formatDuration(
    checkIn,
    checkOut
  ) {
    if (!checkIn || !checkOut) {
      return "-";
    }
  
    const difference =
      new Date(checkOut) -
      new Date(checkIn);
  
    const totalMinutes =
      Math.floor(
        difference / 60000
      );
  
    const hours =
      Math.floor(
        totalMinutes / 60
      );
  
    const minutes =
      totalMinutes % 60;
  
    if (hours === 0) {
      return `${minutes} นาที`;
    }
  
    return `${hours} ชม. ${minutes} นาที`;
  }
  
  function createPersonAvatarHtml(employee) {
    if (employee.photo) {
      return `
        <img
          class="person-photo"
          src="${employee.photo}"
          alt="${escapeHtml(employee.name)}"
        >
      `;
    }
  
    return `
      <div class="person-initial">
        ${escapeHtml(
          getInitials(employee.name)
        )}
      </div>
    `;
  }