/* =====================================================
   SubLib - JavaScript library
   File: lib/sublib.js

   Functions:
   - SubLib.get(id)             get an element by id
   - SubLib.fetchAll()          API: get all subscriptions
   - SubLib.create(sub)         API: add a subscription
   - SubLib.remove(id)          API: delete a subscription
   - SubLib.parseDate(text)     "2026-12-01" -> Date
   - SubLib.daysLeft(text)      days until a date
   - SubLib.isExpired(text)     is the date in the past?
   - SubLib.getStatus(sub)      "Active" or "Expired"
   - SubLib.formatDate(text)    "1 Dec 2026"
   - SubLib.daysText(text)      "in 5 days"
   - SubLib.avatarClass(name)   avatar colour class
   - SubLib.countExpired(list)  number of expired items
   - SubLib.isValid(sub)        are all fields filled?
   - SubLib.makeCell(text, l)   create a table cell
   ===================================================== */
const SubLib = {

  // Get an element by its id
  get: function (id) {
    return document.getElementById(id);
  },

  // ---------- Talking to the backend (API) ----------

  // Ask the server for all subscriptions
  fetchAll: async function () {
    const response = await fetch("/api/subscriptions");
    if (!response.ok) {
      throw new Error("Could not load subscriptions");
    }
    return await response.json();
  },

  // Send a new subscription to the server
  create: async function (sub) {
    const response = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub)
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Could not add subscription");
    }
  },

  // Ask the server to delete a subscription
  remove: async function (id) {
    const response = await fetch("/api/subscriptions/" + id, {
      method: "DELETE"
    });
    if (!response.ok) {
      throw new Error("Could not delete subscription");
    }
  },

  // ---------- Helpers ----------

  // Turn "2026-12-01" into a Date at midnight (local time)
  parseDate: function (dateString) {
    const parts = dateString.split("-");
    return new Date(parts[0], parts[1] - 1, parts[2]);
  },

  // How many days until the renewal date (negative = in the past)
  daysLeft: function (dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const renewal = SubLib.parseDate(dateString);
    return Math.round((renewal - today) / (1000 * 60 * 60 * 24));
  },

  // Check if a renewal date is in the past
  isExpired: function (dateString) {
    return SubLib.daysLeft(dateString) < 0;
  },

  // Return "Active" or "Expired" for a subscription
  getStatus: function (sub) {
    if (SubLib.isExpired(sub.renewal)) {
      return "Expired";
    }
    return "Active";
  },

  // Friendly date like "1 Dec 2026"
  formatDate: function (dateString) {
    return SubLib.parseDate(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  },

  // Friendly text like "in 5 days" or "3 days ago"
  daysText: function (dateString) {
    const days = SubLib.daysLeft(dateString);
    if (days === 0) return "today";
    if (days === 1) return "tomorrow";
    if (days === -1) return "yesterday";
    if (days > 1) return "in " + days + " days";
    return Math.abs(days) + " days ago";
  },

  // Pick an avatar colour (1 to 5) based on the service name
  avatarClass: function (name) {
    const number = (name.toLowerCase().charCodeAt(0) % 5) + 1;
    return "ui-avatar ui-avatar-" + number;
  },

  // Count how many subscriptions are expired
  countExpired: function (list) {
    let count = 0;
    for (let i = 0; i < list.length; i++) {
      if (SubLib.isExpired(list[i].renewal)) {
        count++;
      }
    }
    return count;
  },

  // Check that every required field has a value
  isValid: function (sub) {
    return (
      sub.service !== "" &&
      sub.provider !== "" &&
      sub.subscriber !== "" &&
      sub.renewal !== "" &&
      sub.category !== ""
    );
  },

  // Create a table cell with some text in it
  // (the label is shown on phones)
  makeCell: function (text, label) {
    const td = document.createElement("td");
    td.textContent = text;
    td.setAttribute("data-label", label);
    return td;
  }
};
