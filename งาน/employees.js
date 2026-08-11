const employeeTableBody =
  document.getElementById(
    "employeeTableBody"
  );

const employeeEmpty =
  document.getElementById(
    "employeeEmpty"
  );

const employeeSearch =
  document.getElementById(
    "employeeSearch"
  );

const employeeTotalText =
  document.getElementById(
    "employeeTotalText"
  );

const addEmployeeButton =
  document.getElementById(
    "addEmployeeButton"
  );

const employeeModal =
  document.getElementById(
    "employeeModal"
  );

const employeeForm =
  document.getElementById(
    "employeeForm"
  );

const modalTitle =
  document.getElementById(
    "modalTitle"
  );

const formError =
  document.getElementById(
    "formError"
  );

const employeePhotoInput =
  document.getElementById(
    "employeePhoto"
  );

const photoPreview =
  document.getElementById(
    "photoPreview"
  );

const photoPreviewInitial =
  document.getElementById(
    "photoPreviewInitial"
  );

const removePhotoButton =
  document.getElementById(
    "removePhotoButton"
  );

const fields = {
  recordId:
    document.getElementById(
      "employeeRecordId"
    ),

  name:
    document.getElementById(
      "employeeName"
    ),

  employeeId:
    document.getElementById(
      "employeeId"
    ),

  cardId:
    document.getElementById(
      "cardId"
    ),

  department:
    document.getElementById(
      "department"
    ),

  position:
    document.getElementById(
      "position"
    ),

  shift:
    document.getElementById(
      "shift"
    )
};

let currentPhotoData = "";

function updatePhotoPreview(
  photoData,
  employeeName = ""
) {
  currentPhotoData =
    photoData || "";

  if (currentPhotoData) {
    photoPreview.src =
      currentPhotoData;

    photoPreview.style.display =
      "block";

    photoPreviewInitial.style.display =
      "none";

    return;
  }

  photoPreview.style.display =
    "none";

  photoPreviewInitial.style.display =
    "grid";

  photoPreviewInitial.textContent =
    getInitials(employeeName);
}

function openEmployeeModal(
  employee = null
) {
  employeeForm.reset();

  formError.textContent = "";

  employeePhotoInput.value = "";

  if (employee) {
    modalTitle.textContent =
      "แก้ไขข้อมูลพนักงาน";

    fields.recordId.value =
      employee.recordId;

    fields.name.value =
      employee.name;

    fields.employeeId.value =
      employee.employeeId;

    fields.cardId.value =
      employee.cardId;

    fields.department.value =
      employee.department;

    fields.position.value =
      employee.position;

    fields.shift.value =
      employee.shift;

    updatePhotoPreview(
      employee.photo || "",
      employee.name
    );
  } else {
    modalTitle.textContent =
      "เพิ่มพนักงาน";

    fields.recordId.value = "";

    updatePhotoPreview("", "");
  }

  employeeModal.classList.add(
    "open"
  );
}

function closeEmployeeModal() {
  employeeModal.classList.remove(
    "open"
  );
}

function getFilteredEmployees() {
  const query =
    employeeSearch.value
      .trim()
      .toLowerCase();

  const employees =
    getEmployees();

  if (!query) {
    return employees;
  }

  return employees.filter(
    employee => {
      const searchableText = [
        employee.name,
        employee.employeeId,
        employee.cardId,
        employee.department,
        employee.position,
        employee.shift
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        query
      );
    }
  );
}

function renderEmployees() {
  const employees =
    getEmployees();

  const filteredEmployees =
    getFilteredEmployees();

  const todayRecords =
    getTodayRecords();

  employeeTotalText.textContent =
    `${employees.length} คน`;

  employeeTableBody.innerHTML = "";

  if (filteredEmployees.length === 0) {
    employeeEmpty.style.display =
      "block";

    return;
  }

  employeeEmpty.style.display =
    "none";

  employeeTableBody.innerHTML =
    filteredEmployees.map(employee => {
      const status =
        getEmployeeTodayStatus(
          employee.employeeId,
          todayRecords
        );

      return `
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
                    employee.position
                  )}
                </small>

              </div>

            </div>

          </td>

          <td>
            ${escapeHtml(
              employee.employeeId
            )}
          </td>

          <td>
            ${escapeHtml(
              employee.cardId
            )}
          </td>

          <td>

            <strong>
              ${escapeHtml(
                employee.department
              )}
            </strong>

            <small
              style="
                display:block;
                margin-top:3px;
                color:#8792a7;
              "
            >
              ${escapeHtml(
                employee.position
              )}
            </small>

          </td>

          <td>
            ${escapeHtml(
              employee.shift
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

          <td>

            <div class="employee-actions">

              <button
                class="icon-button"
                type="button"
                data-edit-id="${
                  employee.recordId
                }"
              >
                ✎
              </button>

              <button
                class="icon-button delete"
                type="button"
                data-delete-id="${
                  employee.recordId
                }"
              >
                ×
              </button>

            </div>

          </td>

        </tr>
      `;
    }).join("");
}

function validateEmployee(
  employee,
  employees
) {
  const duplicateEmployeeId =
    employees.some(
      item =>
        item.employeeId
          .toUpperCase() ===
          employee.employeeId
            .toUpperCase() &&
        item.recordId !==
          employee.recordId
    );

  if (duplicateEmployeeId) {
    return "รหัสพนักงานนี้มีอยู่ในระบบแล้ว";
  }

  const duplicateCardId =
    employees.some(
      item =>
        item.cardId
          .toUpperCase() ===
          employee.cardId
            .toUpperCase() &&
        item.recordId !==
          employee.recordId
    );

  if (duplicateCardId) {
    return "รหัสบัตรนี้มีอยู่ในระบบแล้ว";
  }

  return "";
}

function loadImage(file) {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      const objectUrl =
        URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(
          objectUrl
        );

        resolve(image);
      };

      image.onerror = () => {
        URL.revokeObjectURL(
          objectUrl
        );

        reject(
          new Error(
            "ไม่สามารถเปิดรูปได้"
          )
        );
      };

      image.src =
        objectUrl;
    }
  );
}

async function compressPhoto(file) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (
    !allowedTypes.includes(
      file.type
    )
  ) {
    throw new Error(
      "กรุณาเลือกรูป JPG, PNG หรือ WebP"
    );
  }

  const image =
    await loadImage(file);

  const maximumSize =
    420;

  let width =
    image.naturalWidth;

  let height =
    image.naturalHeight;

  const scale =
    Math.min(
      1,
      maximumSize /
      Math.max(width, height)
    );

  width =
    Math.round(width * scale);

  height =
    Math.round(height * scale);

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    width;

  canvas.height =
    height;

  const context =
    canvas.getContext("2d");

  context.drawImage(
    image,
    0,
    0,
    width,
    height
  );

  return canvas.toDataURL(
    "image/jpeg",
    0.82
  );
}

employeePhotoInput.addEventListener(
  "change",
  async event => {
    const file =
      event.target.files[0];

    if (!file) {
      return;
    }

    try {
      const photoData =
        await compressPhoto(file);

      updatePhotoPreview(
        photoData,
        fields.name.value
      );

      formError.textContent = "";
    } catch (error) {
      formError.textContent =
        error.message;
    }
  }
);

removePhotoButton.addEventListener(
  "click",
  () => {
    employeePhotoInput.value =
      "";

    updatePhotoPreview(
      "",
      fields.name.value
    );
  }
);

fields.name.addEventListener(
  "input",
  () => {
    if (!currentPhotoData) {
      photoPreviewInitial.textContent =
        getInitials(
          fields.name.value
        );
    }
  }
);

employeeForm.addEventListener(
  "submit",
  event => {
    event.preventDefault();

    const employees =
      getEmployees();

    const employee = {
      recordId:
        fields.recordId.value ||
        `employee-${Date.now()}`,

      name:
        fields.name.value.trim(),

      employeeId:
        fields.employeeId.value
          .trim()
          .toUpperCase(),

      cardId:
        fields.cardId.value
          .trim()
          .toUpperCase(),

      department:
        fields.department.value
          .trim(),

      position:
        fields.position.value
          .trim(),

      shift:
        fields.shift.value,

      photo:
        currentPhotoData || ""
    };

    const errorMessage =
      validateEmployee(
        employee,
        employees
      );

    if (errorMessage) {
      formError.textContent =
        errorMessage;

      return;
    }

    const existingIndex =
      employees.findIndex(
        item =>
          item.recordId ===
          employee.recordId
      );

    if (existingIndex >= 0) {
      employees[existingIndex] =
        employee;
    } else {
      employees.push(employee);
    }

    const saved =
      saveEmployees(employees);

    if (!saved) {
      formError.textContent =
        "บันทึกไม่สำเร็จ พื้นที่จัดเก็บอาจเต็ม";

      return;
    }

    closeEmployeeModal();

    renderEmployees();
  }
);

employeeTableBody.addEventListener(
  "click",
  event => {
    const editButton =
      event.target.closest(
        "[data-edit-id]"
      );

    const deleteButton =
      event.target.closest(
        "[data-delete-id]"
      );

    if (editButton) {
      const employee =
        getEmployees().find(
          item =>
            item.recordId ===
            editButton.dataset.editId
        );

      if (employee) {
        openEmployeeModal(
          employee
        );
      }

      return;
    }

    if (deleteButton) {
      const employee =
        getEmployees().find(
          item =>
            item.recordId ===
            deleteButton.dataset
              .deleteId
        );

      if (!employee) {
        return;
      }

      const confirmed =
        confirm(
          `ต้องการลบ ${employee.name} หรือไม่?`
        );

      if (!confirmed) {
        return;
      }

      const updatedEmployees =
        getEmployees().filter(
          item =>
            item.recordId !==
            employee.recordId
        );

      saveEmployees(
        updatedEmployees
      );

      renderEmployees();
    }
  }
);

addEmployeeButton.addEventListener(
  "click",
  () => {
    openEmployeeModal();
  }
);

employeeSearch.addEventListener(
  "input",
  renderEmployees
);

document
  .querySelectorAll(
    "[data-close-modal]"
  )
  .forEach(element => {
    element.addEventListener(
      "click",
      closeEmployeeModal
    );
  });

document.addEventListener(
  "keydown",
  event => {
    if (event.key === "Escape") {
      closeEmployeeModal();
    }
  }
);

renderEmployees();