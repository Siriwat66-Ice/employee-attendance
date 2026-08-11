/*
  เชื่อม Google Sheets แบบหลังบ้าน
  ไม่แสดงสถานะบนหน้าเว็บไซต์
*/

const BACKEND_QUEUE_KEY =
  "employeeTimeBackendQueueV2";


function isBackendConfigured() {
  if (
    typeof GOOGLE_SHEETS_CONFIG ===
    "undefined"
  ) {
    return false;
  }

  const url =
    GOOGLE_SHEETS_CONFIG.webAppUrl || "";

  return (
    url.startsWith(
      "https://script.google.com/"
    ) &&
    url.includes("/exec")
  );
}


function readBackendQueue() {
  try {
    const saved =
      localStorage.getItem(
        BACKEND_QUEUE_KEY
      );

    const queue =
      saved
        ? JSON.parse(saved)
        : [];

    return Array.isArray(queue)
      ? queue
      : [];

  } catch (error) {
    console.error(
      "อ่านรายการรอส่งไม่สำเร็จ",
      error
    );

    return [];
  }
}


function saveBackendQueue(queue) {
  try {
    localStorage.setItem(
      BACKEND_QUEUE_KEY,
      JSON.stringify(queue)
    );

  } catch (error) {
    console.error(
      "บันทึกรายการรอส่งไม่สำเร็จ",
      error
    );
  }
}


function addBackendQueueItem(item) {
  const queue =
    readBackendQueue();

  queue.push(item);

  saveBackendQueue(queue);
}


function removeBackendQueueItem(
  queueId
) {
  const queue =
    readBackendQueue().filter(
      item =>
        item.queueId !== queueId
    );

  saveBackendQueue(queue);
}


function postPayloadWithHiddenForm(
  payload
) {
  return new Promise(
    (resolve, reject) => {

      if (!isBackendConfigured()) {
        reject(
          new Error(
            "ยังไม่ได้ตั้งค่า Google Sheets ใน config.js"
          )
        );

        return;
      }

      const frameName =
        "googleSheetsFrame_" +
        Date.now() +
        "_" +
        Math.random()
          .toString(36)
          .slice(2);

      const iframe =
        document.createElement(
          "iframe"
        );

      iframe.name =
        frameName;

      iframe.style.display =
        "none";


      const form =
        document.createElement(
          "form"
        );

      form.method =
        "POST";

      form.action =
        GOOGLE_SHEETS_CONFIG
          .webAppUrl;

      form.target =
        frameName;

      form.style.display =
        "none";

      form.acceptCharset =
        "UTF-8";


      const input =
        document.createElement(
          "input"
        );

      input.type =
        "hidden";

      input.name =
        "payload";

      input.value =
        JSON.stringify({
          ...payload,

          accessKey:
            GOOGLE_SHEETS_CONFIG
              .accessKey || ""
        });


      form.appendChild(input);

      document.body.appendChild(
        iframe
      );

      document.body.appendChild(
        form
      );


      const cleanup = () => {
        form.remove();
        iframe.remove();
      };


      try {
        form.submit();

        setTimeout(
          () => {
            cleanup();
            resolve(true);
          },
          2000
        );

      } catch (error) {
        cleanup();
        reject(error);
      }
    }
  );
}


async function sendBackendEvent(
  payload
) {
  if (!isBackendConfigured()) {
    console.error(
      "Google Sheets ยังเชื่อมต่อไม่สมบูรณ์"
    );

    return false;
  }

  const item = {
    queueId:
      "queue-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .slice(2),

    createdAt:
      new Date().toISOString(),

    payload
  };


  addBackendQueueItem(item);


  try {
    await postPayloadWithHiddenForm(
      item.payload
    );

    removeBackendQueueItem(
      item.queueId
    );

    console.log(
      "ส่งข้อมูลไป Google Sheets แล้ว",
      payload.action
    );

    return true;

  } catch (error) {
    console.error(
      "ส่งข้อมูลไป Google Sheets ไม่สำเร็จ",
      error
    );

    return false;
  }
}


async function flushBackendQueue() {
  if (!isBackendConfigured()) {
    return;
  }

  const queue =
    readBackendQueue();

  for (const item of queue) {
    try {
      await postPayloadWithHiddenForm(
        item.payload
      );

      removeBackendQueueItem(
        item.queueId
      );

    } catch (error) {
      console.error(
        "ส่งรายการที่ค้างไม่สำเร็จ",
        error
      );

      break;
    }
  }
}


window.addEventListener(
  "online",
  flushBackendQueue
);


window.addEventListener(
  "focus",
  flushBackendQueue
);


setTimeout(
  flushBackendQueue,
  1200
);