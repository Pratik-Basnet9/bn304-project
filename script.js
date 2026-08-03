"use strict";

const form = document.getElementById("deviceForm");
const description = document.getElementById("description");
const characterCount = document.getElementById("characterCount");
const successMessage = document.getElementById("successMessage");
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

function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);
}

function isValidIpAddress(ipAddress) {
  const parts = ipAddress.split(".");

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

function isValidMacAddress(macAddress) {
  const macPattern = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

  return macPattern.test(macAddress);
}

function validateForm() {
  let isValid = true;

  const deviceName = document.getElementById("deviceName").value.trim();

  const deviceId = document.getElementById("deviceId").value.trim();

  const deviceType = document.getElementById("deviceType").value;

  const vlan = document.getElementById("vlan").value;

  const ipAddress = document.getElementById("ipAddress").value.trim();

  const macAddress = document.getElementById("macAddress").value.trim();

  const ownerName = document.getElementById("ownerName").value.trim();

  const email = document.getElementById("email").value.trim();

  const deviceDescription = description.value.trim();

  const agreement = document.getElementById("agreement");

  if (deviceName.length < 3) {
    showError("deviceName", "Enter a device name with at least 3 characters.");

    isValid = false;
  } else {
    clearError("deviceName");
  }

  if (deviceId.length < 3) {
    showError("deviceId", "Enter a valid device ID.");

    isValid = false;
  } else {
    clearError("deviceId");
  }

  if (!deviceType) {
    showError("deviceType", "Select a device type.");

    isValid = false;
  } else {
    clearError("deviceType");
  }

  if (!vlan) {
    showError("vlan", "Select a network VLAN.");

    isValid = false;
  } else {
    clearError("vlan");
  }

  if (!isValidIpAddress(ipAddress)) {
    showError("ipAddress", "Enter a valid IPv4 address.");

    isValid = false;
  } else {
    clearError("ipAddress");
  }

  if (!isValidMacAddress(macAddress)) {
    showError("macAddress", "Use this format: 00:1A:2B:3C:4D:5E");

    isValid = false;
  } else {
    clearError("macAddress");
  }

  if (ownerName.length < 2) {
    showError("ownerName", "Enter the device owner's name.");

    isValid = false;
  } else {
    clearError("ownerName");
  }

  if (!isValidEmail(email)) {
    showError("email", "Enter a valid email address.");

    isValid = false;
  } else {
    clearError("email");
  }

  if (deviceDescription.length < 10) {
    showError("description", "Enter at least 10 characters.");

    isValid = false;
  } else if (deviceDescription.length > 300) {
    showError("description", "Description cannot exceed 300 characters.");

    isValid = false;
  } else {
    clearError("description");
  }

  if (!agreement.checked) {
    document.getElementById("agreementError").textContent =
      "You must confirm the security policy.";

    isValid = false;
  } else {
    document.getElementById("agreementError").textContent = "";
  }

  return isValid;
}

description.addEventListener("input", () => {
  const totalCharacters = description.value.length;

  characterCount.textContent = `${totalCharacters} / 300 characters`;

  if (totalCharacters > 300) {
    characterCount.style.color = "#dc2626";
  } else {
    characterCount.style.color = "#64748b";
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  successMessage.classList.remove("show");

  if (!validateForm()) {
    return;
  }

  const formData = {
    deviceName: document.getElementById("deviceName").value.trim(),

    deviceId: document.getElementById("deviceId").value.trim(),

    deviceType: document.getElementById("deviceType").value,

    vlan: document.getElementById("vlan").value,

    ipAddress: document.getElementById("ipAddress").value.trim(),

    macAddress: document.getElementById("macAddress").value.trim(),

    ownerName: document.getElementById("ownerName").value.trim(),

    email: document.getElementById("email").value.trim(),

    description: description.value.trim(),

    tlsEnabled: document.getElementById("tlsEnabled").checked,

    certificateInstalled: document.getElementById("certificateInstalled")
      .checked,

    monitoringEnabled: document.getElementById("monitoringEnabled").checked,
  };

  console.log("Submitted device:", formData);

  successMessage.classList.add("show");
  successMessage.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
});

resetButton.addEventListener("click", () => {
  const invalidFields = document.querySelectorAll(".invalid");

  const errors = document.querySelectorAll(".error-message");

  invalidFields.forEach((field) => {
    field.classList.remove("invalid");
  });

  errors.forEach((error) => {
    error.textContent = "";
  });

  characterCount.textContent = "0 / 300 characters";
  characterCount.style.color = "#64748b";
  successMessage.classList.remove("show");
});
