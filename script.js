"use strict";

/* =========================================================
   THINKIX MANAGEMENT DASHBOARD
   REGISTRATION + PERSISTENT DEVICE HISTORY
========================================================= */

/* =========================================================
   FORM ELEMENTS
========================================================= */

const form = document.getElementById("deviceForm");
const description = document.getElementById("description");
const characterCount = document.getElementById("characterCount");
const successMessage = document.getElementById("successMessage");
const loadingBox = document.getElementById("loadingBox");
const resetButton = document.getElementById("resetButton");

/* =========================================================
   DASHBOARD ELEMENTS
========================================================= */

const totalDevicesElement = document.getElementById("totalDevices");
const onlineDevicesElement = document.getElementById("onlineDevices");
const alertCountElement = document.getElementById("alertCount");

const deviceList = document.querySelector(".device-list");
const emailHistory = document.querySelector(".email-history");

const trafficSummary = document.querySelectorAll(".traffic-summary strong");

const trafficLine = document.querySelector(".traffic-line");

const trafficArea = document.querySelector(".traffic-area");

/* =========================================================
   SIMULATION / CURRENT LAB VALUES

   These 4 devices are the existing simulated lab devices
   shown directly inside management.html.

   Sensor1
   PLC-01
   MQTT Broker
   Sensor2
========================================================= */

const SIMULATED_LAB_DEVICE_COUNT = 4;
const SIMULATED_ONLINE_COUNT = 3;

let registeredDeviceCount = 0;

let totalDevices = SIMULATED_LAB_DEVICE_COUNT;

let onlineDevices = SIMULATED_ONLINE_COUNT;

let securityAlerts = 2;
let mqttMessages = 128;

/* =========================================================
   CHANGE OLD "DEMO" WORDING
========================================================= */

function updateSimulationLabels() {
  document.querySelectorAll(".demo-badge").forEach((badge) => {
    const text = badge.textContent.trim().toUpperCase();

    if (text === "DEMO DATA") {
      badge.textContent = "SIMULATION ENVIRONMENT";
    }
  });

  document.querySelectorAll(".live-badge").forEach((badge) => {
    const text = badge.textContent.trim().toUpperCase();

    if (text.includes("DEMO LIVE")) {
      badge.textContent = "● SIMULATION MODE";
    }
  });
}

/* =========================================================
   HISTORY HELPERS
========================================================= */

function getDeviceHistory() {
  try {
    return JSON.parse(localStorage.getItem("thinkixDeviceHistory") || "[]");
  } catch (error) {
    console.error("Unable to read ThinkiX device history:", error);

    return [];
  }
}

function saveDeviceHistory(history) {
  localStorage.setItem("thinkixDeviceHistory", JSON.stringify(history));
}

/* =========================================================
   ERROR FUNCTIONS
========================================================= */

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);

  const error = document.getElementById(`${fieldId}Error`);

  if (field) {
    field.classList.add("invalid");
  }

  if (error) {
    error.textContent = message;
  }
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);

  const error = document.getElementById(`${fieldId}Error`);

  if (field) {
    field.classList.remove("invalid");
  }

  if (error) {
    error.textContent = "";
  }
}

/* =========================================================
   VALIDATION HELPERS
========================================================= */

function validEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return pattern.test(email);
}

function validIp(ip) {
  const parts = ip.split(".");

  if (parts.length !== 4) {
    return false;
  }

  return parts.every((part) => {
    if (!/^\d+$/.test(part)) {
      return false;
    }

    const number = Number(part);

    return number >= 0 && number <= 255;
  });
}

function validMac(mac) {
  const pattern = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

  return pattern.test(mac);
}

/* =========================================================
   FORM VALIDATION
========================================================= */

function validateForm() {
  let valid = true;

  const deviceName = document.getElementById("deviceName").value.trim();

  const deviceId = document.getElementById("deviceId").value.trim();

  const deviceType = document.getElementById("deviceType").value;

  const vlan = document.getElementById("vlan").value;

  const ipAddress = document.getElementById("ipAddress").value.trim();

  const macAddress = document.getElementById("macAddress").value.trim();

  const ownerName = document.getElementById("ownerName").value.trim();

  const email = document.getElementById("email").value.trim();

  const descriptionValue = description.value.trim();

  const agreement = document.getElementById("agreement");

  /* DEVICE NAME */

  if (deviceName.length < 3) {
    showError("deviceName", "Enter a valid device name.");

    valid = false;
  } else {
    clearError("deviceName");
  }

  /* DEVICE ID */

  if (deviceId.length < 3) {
    showError("deviceId", "Enter a valid device ID.");

    valid = false;
  } else {
    clearError("deviceId");
  }

  /* DEVICE TYPE */

  if (!deviceType) {
    showError("deviceType", "Select a device type.");

    valid = false;
  } else {
    clearError("deviceType");
  }

  /* VLAN */

  if (!vlan) {
    showError("vlan", "Select a VLAN.");

    valid = false;
  } else {
    clearError("vlan");
  }

  /* IP ADDRESS */

  if (!validIp(ipAddress)) {
    showError("ipAddress", "Enter a valid IPv4 address.");

    valid = false;
  } else {
    clearError("ipAddress");
  }

  /* MAC ADDRESS */

  if (!validMac(macAddress)) {
    showError("macAddress", "Format: 00:1A:2B:3C:4D:5E");

    valid = false;
  } else {
    clearError("macAddress");
  }

  /* OWNER */

  if (ownerName.length < 2) {
    showError("ownerName", "Enter the device owner.");

    valid = false;
  } else {
    clearError("ownerName");
  }

  /* EMAIL */

  if (!validEmail(email)) {
    showError("email", "Enter a valid email.");

    valid = false;
  } else {
    clearError("email");
  }

  /* DESCRIPTION */

  if (descriptionValue.length < 10) {
    showError("description", "Enter at least 10 characters.");

    valid = false;
  } else {
    clearError("description");
  }

  /* SECURITY AGREEMENT */

  if (!agreement.checked) {
    document.getElementById("agreementError").textContent =
      "Please confirm the security policy.";

    valid = false;
  } else {
    document.getElementById("agreementError").textContent = "";
  }

  return valid;
}

/* =========================================================
   DESCRIPTION COUNTER
========================================================= */

if (description && characterCount) {
  description.addEventListener("input", () => {
    characterCount.textContent = `${description.value.length} / 300 characters`;
  });
}

/* =========================================================
   COUNTER ANIMATION
========================================================= */

function animateCounter(element, start, end, duration) {
  if (!element) {
    return;
  }

  let startTime = null;

  function animation(currentTime) {
    if (!startTime) {
      startTime = currentTime;
    }

    const progress = Math.min((currentTime - startTime) / duration, 1);

    const value = Math.floor(progress * (end - start) + start);

    element.textContent = value;

    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

/* =========================================================
   FORMAT DEVICE TYPE
========================================================= */

function formatDeviceType(type) {
  const types = {
    temperature: "Temperature Sensor",

    pressure: "Pressure Sensor",

    vibration: "Vibration Sensor",

    plc: "PLC Controller",

    robotic: "Robotic Arm",

    monitoring: "Monitoring Server",
  };

  return types[type] || type || "Industrial IoT Device";
}

/* =========================================================
   CREATE REGISTERED DEVICE CARD

   IMPORTANT:
   Registered does NOT mean online.
   GNS3 must verify the device later.
========================================================= */

function createRegisteredDeviceRow(device) {
  if (!deviceList) {
    return;
  }

  /* Prevent duplicate rendering */

  if (
    device.registrationId &&
    deviceList.querySelector(
      `[data-registration-id="${device.registrationId}"]`,
    )
  ) {
    return;
  }

  const deviceRow = document.createElement("div");

  deviceRow.className = "device-row registered-device-row";

  if (device.registrationId) {
    deviceRow.dataset.registrationId = device.registrationId;
  }

  deviceRow.innerHTML = `

    <span
      class="device-status"
      style="
        background:#facc15;
        box-shadow:0 0 10px rgba(250,204,21,.7);
      "
    ></span>

    <div class="device-info">

      <strong>
        ${device.deviceName || "Unknown Device"}
      </strong>

      <small>
        ${device.ipAddress || "No IP"}
        •
        ${device.vlan ? `VLAN ${device.vlan}` : "No VLAN"}
      </small>

      <small
        style="
          color:#facc15;
          margin-top:4px;
        "
      >
        ${formatDeviceType(device.deviceType)}
        • GNS3 Pending
      </small>

    </div>

    <span
      class="status-label"
      style="color:#fde047;"
    >
      REGISTERED
    </span>

  `;

  deviceList.prepend(deviceRow);

  deviceRow.animate(
    [
      {
        opacity: 0,
        transform: "translateY(-12px)",
      },

      {
        opacity: 1,
        transform: "translateY(0)",
      },
    ],
    {
      duration: 400,
      easing: "ease",
    },
  );
}

/* =========================================================
   LOAD REGISTERED DEVICES FROM HISTORY

   This is what makes devices remain after page refresh.
========================================================= */

function loadRegisteredDevices() {
  const history = getDeviceHistory();

  registeredDeviceCount = history.length;

  history
    .slice()
    .reverse()
    .forEach((device) => {
      createRegisteredDeviceRow(device);
    });

  /* ---------------------------------------------------------
     TOTAL DEVICES

     Existing lab devices = 4
     Registered devices = history count

     ONLINE DEVICES stays at 3 because registrations
     are NOT considered live until GNS3 confirms them.
  --------------------------------------------------------- */

  totalDevices = SIMULATED_LAB_DEVICE_COUNT + registeredDeviceCount;

  onlineDevices = SIMULATED_ONLINE_COUNT;

  if (totalDevicesElement) {
    totalDevicesElement.textContent = totalDevices;
  }

  if (onlineDevicesElement) {
    onlineDevicesElement.textContent = onlineDevices;
  }
}

/* =========================================================
   SIMULATED NETWORK TRAFFIC
========================================================= */

function randomTraffic(minimum, maximum) {
  return (Math.random() * (maximum - minimum) + minimum).toFixed(1);
}

function updateTrafficNumbers() {
  const incoming = randomTraffic(1.1, 3.9);

  const outgoing = randomTraffic(0.4, 2.2);

  mqttMessages += Math.floor(Math.random() * 12) + 2;

  if (trafficSummary.length >= 3) {
    trafficSummary[0].textContent = `${incoming} Mbps`;

    trafficSummary[1].textContent = `${outgoing} Mbps`;

    trafficSummary[2].textContent = mqttMessages;
  }
}

/* =========================================================
   TRAFFIC GRAPH
========================================================= */

let trafficPoints = [190, 160, 175, 110, 135, 75, 120, 85, 140, 95, 115];

function updateTrafficGraph() {
  if (!trafficLine || !trafficArea) {
    return;
  }

  trafficPoints.shift();

  const newPoint = Math.floor(Math.random() * 110) + 65;

  trafficPoints.push(newPoint);

  const spacing = 70;

  const points = trafficPoints
    .map((point, index) => `${index * spacing},${point}`)
    .join(" ");

  trafficLine.setAttribute("points", points);

  let areaPath = `M0 ${trafficPoints[0]} `;

  trafficPoints.forEach((point, index) => {
    if (index > 0) {
      areaPath += `L${index * spacing} ${point} `;
    }
  });

  areaPath += "L700 250 L0 250 Z";

  trafficArea.setAttribute("d", areaPath);
}

/* NETWORK SIMULATION UPDATE */

setInterval(() => {
  updateTrafficNumbers();
  updateTrafficGraph();
}, 3000);

/* =========================================================
   CURRENT TIME
========================================================= */

function getCurrentTime() {
  const now = new Date();

  return now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================================================
   MANAGEMENT ACTIVITY ENTRY
========================================================= */

function addEmailHistory(title, message) {
  if (!emailHistory) {
    return;
  }

  const row = document.createElement("div");

  row.className = "email-row";

  row.innerHTML = `

    <div
      class="email-icon-small"
    >
      ✉
    </div>

    <div>

      <strong>
        ${title}
      </strong>

      <p>
        ${message}
      </p>

      <small>
        ${getCurrentTime()}
      </small>

    </div>

    <span
      class="email-sent"
    >
      RECORDED
    </span>

  `;

  emailHistory.prepend(row);

  row.animate(
    [
      {
        opacity: 0,
        transform: "translateX(-15px)",
      },

      {
        opacity: 1,
        transform: "translateX(0)",
      },
    ],
    {
      duration: 450,
      easing: "ease",
    },
  );
}

/* =========================================================
   FLASH DASHBOARD CARD
========================================================= */

function flashElement(element) {
  if (!element) {
    return;
  }

  const card = element.closest(".dashboard-stat-card");

  if (!card) {
    return;
  }

  card.animate(
    [
      {
        boxShadow: "0 0 0 rgba(56,189,248,0)",
      },

      {
        boxShadow: "0 0 35px rgba(56,189,248,.35)",
      },

      {
        boxShadow: "0 0 0 rgba(56,189,248,0)",
      },
    ],
    {
      duration: 850,
    },
  );
}

/* =========================================================
   REGISTER DEVICE
========================================================= */

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (successMessage) {
      successMessage.classList.remove("show");
    }

    if (loadingBox) {
      loadingBox.classList.remove("show");
    }

    if (!validateForm()) {
      return;
    }

    if (loadingBox) {
      loadingBox.classList.add("show");
    }

    setTimeout(() => {
      if (loadingBox) {
        loadingBox.classList.remove("show");
      }

      if (successMessage) {
        successMessage.classList.add("show");
      }

      /* =====================================
             COLLECT DEVICE INFORMATION
          ====================================== */

      const deviceName = document.getElementById("deviceName").value.trim();

      const deviceId = document.getElementById("deviceId").value.trim();

      const deviceType = document.getElementById("deviceType").value;

      const vlan = document.getElementById("vlan").value;

      const ipAddress = document.getElementById("ipAddress").value.trim();

      const macAddress = document.getElementById("macAddress").value.trim();

      const ownerName = document.getElementById("ownerName").value.trim();

      const email = document.getElementById("email").value.trim();

      const deviceDescription = document
        .getElementById("description")
        .value.trim();

      const tlsEnabled = document.getElementById("tlsEnabled").checked;

      const certificateInstalled = document.getElementById(
        "certificateInstalled",
      ).checked;

      const monitoringEnabled =
        document.getElementById("monitoringEnabled").checked;

      /* =====================================
             CREATE DEVICE RECORD
          ====================================== */

      const formData = {
        registrationId: `REG-${Date.now()}`,

        registeredAt: new Date().toLocaleString(),

        deviceName,
        deviceId,
        deviceType,
        vlan,
        ipAddress,
        macAddress,
        ownerName,
        email,

        description: deviceDescription,

        tlsEnabled,

        certificateInstalled,

        monitoringEnabled,

        registrationStatus: "Processing",

        securityProfile: "Preparing",

        monitoringStatus: "Preparing",

        gns3Status: "Pending",

        liveStatus: "Not Verified",

        overallStatus: "Awaiting Live Network Connection",
      };

      console.log("ThinkiX Device Registration:", formData);

      /* =====================================
             CURRENT DEVICE FOR STATUS PAGE
          ====================================== */

      sessionStorage.setItem(
        "thinkixRegisteredDevice",
        JSON.stringify(formData),
      );

      /* =====================================
             SAVE PERMANENT BROWSER HISTORY
          ====================================== */

      const history = getDeviceHistory();

      history.unshift(formData);

      saveDeviceHistory(history);

      /* =====================================
             SHOW REGISTERED DEVICE ON DASHBOARD

             NOTE:
             It is NOT marked online.
          ====================================== */

      createRegisteredDeviceRow(formData);

      /* =====================================
             UPDATE ONLY TOTAL COUNT

             DO NOT increase onlineDevices.
          ====================================== */

      const previousTotal = totalDevices;

      totalDevices++;

      registeredDeviceCount++;

      animateCounter(totalDevicesElement, previousTotal, totalDevices, 450);

      flashElement(totalDevicesElement);

      /*
            IMPORTANT:

            onlineDevices stays unchanged.

            The device cannot be considered online
            until GNS3 confirms it.
          */

      /* =====================================
             MANAGEMENT ACTIVITY
          ====================================== */

      addEmailHistory(
        "Device Registration Received",
        `${deviceName} (${ipAddress}) registered for VLAN ${vlan}. GNS3 verification pending.`,
      );

      /* =====================================
             SHOW SUCCESS
          ====================================== */

      if (successMessage) {
        successMessage.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }

      /* =====================================
             GO TO DEVICE STATUS PAGE
          ====================================== */

      setTimeout(() => {
        window.location.href = "device-status.html";
      }, 1400);
    }, 1200);
  });
}

/* =========================================================
   RESET FORM
========================================================= */

if (resetButton) {
  resetButton.addEventListener("click", () => {
    setTimeout(() => {
      document.querySelectorAll(".invalid").forEach((field) => {
        field.classList.remove("invalid");
      });

      document.querySelectorAll(".error-message").forEach((error) => {
        error.textContent = "";
      });

      if (characterCount) {
        characterCount.textContent = "0 / 300 characters";
      }

      if (successMessage) {
        successMessage.classList.remove("show");
      }

      if (loadingBox) {
        loadingBox.classList.remove("show");
      }
    }, 0);
  });
}

/* =========================================================
   PANEL ENTRANCE EFFECT
========================================================= */

const panels = document.querySelectorAll(".dashboard-panel");

panels.forEach((panel, index) => {
  panel.style.animationDelay = `${index * 0.08}s`;
});

/* =========================================================
   INITIALISE DASHBOARD
========================================================= */

window.addEventListener("load", () => {
  updateSimulationLabels();

  /*
      Load devices saved from previous registrations.
    */

  loadRegisteredDevices();

  /*
      Animate counters after history has been loaded.
    */

  animateCounter(totalDevicesElement, 0, totalDevices, 900);

  animateCounter(onlineDevicesElement, 0, onlineDevices, 1100);

  animateCounter(alertCountElement, 0, securityAlerts, 1300);
});

/* =========================================================
   DEVELOPMENT INFORMATION
========================================================= */

console.log(
  "%cThinkiX Management Dashboard",
  "color:#38bdf8;font-size:18px;font-weight:bold",
);

console.log(
  "Registered devices persist in browser history. Registered devices remain GNS3 Pending until live network verification is available.",
);
