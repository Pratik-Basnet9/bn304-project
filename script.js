"use strict";

const form = document.getElementById("deviceForm");
const description = document.getElementById("description");
const characterCount = document.getElementById("characterCount");

const successMessage = document.getElementById("successMessage");

const loadingBox = document.getElementById("loadingBox");

const resetButton = document.getElementById("resetButton");

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);

  const error = document.getElementById(`${fieldId}Error`);

  field.classList.add("invalid");
  error.textContent = message;
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);

  const error = document.getElementById(`${fieldId}Error`);

  field.classList.remove("invalid");
  error.textContent = "";
}

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

  if (deviceName.length < 3) {
    showError("deviceName", "Enter a valid device name.");

    valid = false;
  } else {
    clearError("deviceName");
  }

  if (deviceId.length < 3) {
    showError("deviceId", "Enter a valid device ID.");

    valid = false;
  } else {
    clearError("deviceId");
  }

  if (!deviceType) {
    showError("deviceType", "Select a device type.");

    valid = false;
  } else {
    clearError("deviceType");
  }

  if (!vlan) {
    showError("vlan", "Select a VLAN.");

    valid = false;
  } else {
    clearError("vlan");
  }

  if (!validIp(ipAddress)) {
    showError("ipAddress", "Enter a valid IPv4 address.");

    valid = false;
  } else {
    clearError("ipAddress");
  }

  if (!validMac(macAddress)) {
    showError("macAddress", "Format: 00:1A:2B:3C:4D:5E");

    valid = false;
  } else {
    clearError("macAddress");
  }

  if (ownerName.length < 2) {
    showError("ownerName", "Enter the device owner.");

    valid = false;
  } else {
    clearError("ownerName");
  }

  if (!validEmail(email)) {
    showError("email", "Enter a valid email.");

    valid = false;
  } else {
    clearError("email");
  }

  if (descriptionValue.length < 10) {
    showError("description", "Enter at least 10 characters.");

    valid = false;
  } else {
    clearError("description");
  }

  if (!agreement.checked) {
    document.getElementById("agreementError").textContent =
      "Please confirm the security policy.";

    valid = false;
  } else {
    document.getElementById("agreementError").textContent = "";
  }

  return valid;
}

description.addEventListener("input", () => {
  characterCount.textContent = `${description.value.length} / 300 characters`;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  successMessage.classList.remove("show");

  loadingBox.classList.remove("show");

  if (!validateForm()) {
    return;
  }

  loadingBox.classList.add("show");

  setTimeout(() => {
    loadingBox.classList.remove("show");

    successMessage.classList.add("show");

    const formData = {
      deviceName: document.getElementById("deviceName").value,

      deviceId: document.getElementById("deviceId").value,

      deviceType: document.getElementById("deviceType").value,

      vlan: document.getElementById("vlan").value,

      ipAddress: document.getElementById("ipAddress").value,

      macAddress: document.getElementById("macAddress").value,

      tlsEnabled: document.getElementById("tlsEnabled").checked,

      certificateInstalled: document.getElementById("certificateInstalled")
        .checked,

      monitoringEnabled: document.getElementById("monitoringEnabled").checked,
    };

    console.log("Submitted Device:", formData);

    successMessage.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, 1200);
});

resetButton.addEventListener("click", () => {
  setTimeout(() => {
    document.querySelectorAll(".invalid").forEach((field) => {
      field.classList.remove("invalid");
    });

    document.querySelectorAll(".error-message").forEach((error) => {
      error.textContent = "";
    });

    characterCount.textContent = "0 / 300 characters";

    successMessage.classList.remove("show");

    loadingBox.classList.remove("show");
  }, 0);
});
