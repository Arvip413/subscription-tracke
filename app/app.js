/* =====================================================
   app.js - the page code.
   It uses ONLY the functions from lib/sublib.js (SubLib).
   ===================================================== */

const form = SubLib.get("sub-form");
const tableBody = SubLib.get("table-body");
const errorBox = SubLib.get("form-error");
const emptyMessage = SubLib.get("empty-message");

// Get the latest data from the server and draw the page
async function loadAndRender() {
  try {
    const subscriptions = await SubLib.fetchAll();
    render(subscriptions);
  } catch (error) {
    errorBox.textContent = error.message;
  }
}

// Draw the table and the summary
function render(subscriptions) {
  tableBody.innerHTML = "";

  for (let i = 0; i < subscriptions.length; i++) {
    const sub = subscriptions[i];
    const row = document.createElement("tr");

    // Service cell: coloured circle with the first letter + name
    const serviceCell = document.createElement("td");
    serviceCell.className = "ui-cell-service";
    const serviceBox = document.createElement("div");
    serviceBox.className = "ui-service";
    const avatar = document.createElement("span");
    avatar.className = SubLib.avatarClass(sub.service);
    avatar.textContent = sub.service.charAt(0).toUpperCase();
    const serviceName = document.createElement("span");
    serviceName.textContent = sub.service;
    serviceBox.appendChild(avatar);
    serviceBox.appendChild(serviceName);
    serviceCell.appendChild(serviceBox);
    row.appendChild(serviceCell);

    row.appendChild(SubLib.makeCell(sub.provider, "Provider"));
    row.appendChild(SubLib.makeCell(sub.subscriber, "Subscriber"));

    // Renewal date cell: date + "in 5 days" note
    const dateCell = document.createElement("td");
    dateCell.setAttribute("data-label", "Renewal date");
    const dateBox = document.createElement("div");
    const dateMain = document.createElement("span");
    dateMain.className = "ui-date";
    dateMain.textContent = SubLib.formatDate(sub.renewal);
    const dateNote = document.createElement("span");
    dateNote.className = "ui-date-note";
    dateNote.textContent = SubLib.daysText(sub.renewal);
    dateBox.appendChild(dateMain);
    dateBox.appendChild(dateNote);
    dateCell.appendChild(dateBox);
    row.appendChild(dateCell);

    // Category cell shown as a small chip
    const categoryCell = document.createElement("td");
    categoryCell.setAttribute("data-label", "Category");
    const chip = document.createElement("span");
    chip.className = "ui-chip";
    chip.textContent = sub.category;
    categoryCell.appendChild(chip);
    row.appendChild(categoryCell);

    // Status cell with a coloured badge
    const status = SubLib.getStatus(sub);
    const statusCell = document.createElement("td");
    statusCell.setAttribute("data-label", "Status");
    const badge = document.createElement("span");
    badge.textContent = status;
    badge.className = "ui-badge ui-badge-" + status.toLowerCase();
    statusCell.appendChild(badge);
    row.appendChild(statusCell);

    // Action cell with a delete button
    const actionCell = document.createElement("td");
    actionCell.setAttribute("data-label", "Action");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "ui-btn ui-btn-danger";
    deleteBtn.addEventListener("click", function () {
      deleteSubscription(sub.id);
    });
    actionCell.appendChild(deleteBtn);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  }

  // Show or hide the "no subscriptions" message
  if (subscriptions.length === 0) {
    emptyMessage.classList.remove("ui-hidden");
  } else {
    emptyMessage.classList.add("ui-hidden");
  }

  // Update the summary numbers
  SubLib.get("total-count").textContent = subscriptions.length;
  SubLib.get("expired-count").textContent = SubLib.countExpired(subscriptions);
}

// Add a new subscription when the form is submitted
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const newSub = {
    service: SubLib.get("service").value.trim(),
    provider: SubLib.get("provider").value.trim(),
    subscriber: SubLib.get("subscriber").value.trim(),
    renewal: SubLib.get("renewal").value,
    category: SubLib.get("category").value
  };

  if (!SubLib.isValid(newSub)) {
    errorBox.textContent = "Please fill in all fields.";
    return;
  }

  try {
    await SubLib.create(newSub);
    errorBox.textContent = "";
    form.reset();
    loadAndRender();
  } catch (error) {
    errorBox.textContent = error.message;
  }
});

// Remove a subscription
async function deleteSubscription(id) {
  try {
    await SubLib.remove(id);
    loadAndRender();
  } catch (error) {
    errorBox.textContent = error.message;
  }
}

// Show everything when the page first loads
loadAndRender();
