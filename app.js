
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://nxpfaispvioujkfhewas.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_N-P-wI7MaTwLUJRbzf_C7Q_Nea2I6QZ";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const $ = (id) => document.getElementById(id);

let currentPrayers = [];
let currentFilter = "all";
let publicStatusCache = [];
let publicStatusLoaded = false;

/* GENERAL */

function showSection(id) {
  ["send-section", "login-section", "dashboard-section"].forEach(
    (sectionId) => {
      $(sectionId).classList.toggle("hidden", sectionId !== id);
    }
  );

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function status(id, message, isError = false) {
  const node = $(id);
  node.textContent = message;
  node.classList.toggle("error", isError);
}

function safeText(tag, className, value) {
  const node = document.createElement(tag);

  if (className) node.className = className;

  node.textContent = value ?? "";
  return node;
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function setBusy(form, busy) {
  const button = form.querySelector('button[type="submit"]');

  if (button) button.disabled = busy;
}

/* NAVIGATION */

$("nav-login").addEventListener("click", () => {
  status("login-status", "");
  showSection("login-section");
});

$("back-to-form").addEventListener("click", () => {
  showSection("send-section");
});

/* LOAD RECIPIENTS */

async function loadRecipients() {
  const select = $("recipient");

  const { data, error } = await supabase
    .from("recipients")
    .select("id, display_name")
    .order("display_name");

  if (error) {
    console.error("Load recipients:", error);
    status(
      "send-status",
      "Couldn't load names. Please refresh.",
      true
    );
    return;
  }

  select.replaceChildren(new Option("Choose a name", ""));

  for (const recipient of data ?? []) {
    select.add(new Option(recipient.display_name, recipient.id));
  }
}

/* SEND PRAYER */

$("prayer-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const sender_name = $("sender").value.trim();
  const prayer = $("prayer").value.trim();
  const recipient_id = $("recipient").value;

  if (!sender_name || !prayer || !recipient_id) {
    status("send-status", "Please fill in every field.", true);
    return;
  }

  setBusy(form, true);
  status("send-status", "Sending your prayer...");

  try {
    const { error } = await supabase
      .from("prayers")
      .insert({
        sender_name,
        prayer,
        recipient_id
      });

    if (error) throw error;

    form.reset();
    status("send-status", "Your prayer has been sent.");

    if (publicStatusLoaded) {
      await loadPublicStatus();
    }
  } catch (error) {
    console.error("Send prayer:", error);
    status(
      "send-status",
      "Couldn't send your prayer. Please try again.",
      true
    );
  } finally {
    setBusy(form, false);
  }
});

/* LOGIN */

$("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  setBusy(form, true);
  status("login-status", "Logging in...");

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: $("email").value.trim(),
      password: $("password").value
    });

    if (error) throw error;

    status("login-status", "");
    await renderDashboard();
  } catch (error) {
    console.error("Login:", error);
    status(
      "login-status",
      "Incorrect email or password. Please try again.",
      true
    );
  } finally {
    setBusy(form, false);
  }
});

/* LOG OUT */

$("logout-button").addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Log out:", error);
    status("dashboard-status", "Couldn't log out. Try again.", true);
    return;
  }

  currentPrayers = [];
  showSection("send-section");
});

/* FILTER TABS */

$("prayer-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-filter]");

  if (!tab) return;

  currentFilter = tab.dataset.filter;

  $("prayer-tabs")
    .querySelectorAll("[data-filter]")
    .forEach((button) => {
      const active = button === tab;

      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

  renderPrayerList();
});

function getFilteredPrayers() {
  if (currentFilter === "unread") {
    return currentPrayers.filter((item) => !item.is_read);
  }

  if (currentFilter === "read") {
    return currentPrayers.filter((item) => item.is_read);
  }

  return currentPrayers;
}

/* PRAYER LIST */

function renderPrayerList() {
  const list = $("prayer-list");
  list.replaceChildren();

  const prayers = getFilteredPrayers();

  if (!prayers.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";

    const message =
      currentFilter === "unread"
        ? "You're all caught up."
        : currentFilter === "read"
          ? "No read prayers yet."
          : "No prayers yet.";

    empty.append(
      safeText("strong", "", message),
      safeText("p", "", "New prayers will show up here.")
    );

    list.append(empty);
    return;
  }

  for (const prayer of prayers) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sender-row";

    const info = document.createElement("span");
    info.className = "sender-info";

    info.append(
      safeText("strong", "sender-name", prayer.sender_name),
      safeText(
        "small",
        "sender-hint",
        `${formatDate(prayer.created_at)} · ${
          prayer.is_read ? "Read" : "Unread"
        }`
      )
    );

    button.append(
      info,
      safeText("span", "sender-arrow", "→")
    );

    button.addEventListener("click", () => openPrayer(prayer));

    list.append(button);
  }
}

/* PRAYER DETAILS */

function openPrayer(prayer) {
  const list = $("prayer-list");
  list.replaceChildren();

  const back = document.createElement("button");
  back.type = "button";
  back.className = "prayer-back";
  back.textContent = "← Back to prayers";
  back.addEventListener("click", renderPrayerList);

  const card = document.createElement("article");
  card.className = "prayer-card prayer-detail";

  const sender = safeText("h3", "detail-sender", prayer.sender_name);
  const date = safeText(
    "time",
    "detail-date",
    formatDate(prayer.created_at)
  );

  const readStatus = safeText(
    "p",
    "detail-read-status",
    prayer.is_read
      ? `Read${
          prayer.read_at ? ` · ${formatDate(prayer.read_at)}` : ""
        }`
      : "Unread"
  );

  const divider = document.createElement("hr");
  const text = safeText("p", "prayer-text", prayer.prayer);

  const readButton = document.createElement("button");
  readButton.type = "button";
  readButton.className = "primary-button";
  readButton.textContent = prayer.is_read ? "Already read" : "Mark as read";
  readButton.disabled = Boolean(prayer.is_read);

  readButton.addEventListener("click", async () => {
    readButton.disabled = true;
    readButton.textContent = "Saving...";

    const { data, error } = await supabase
      .from("prayers")
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq("id", prayer.id)
      .eq("recipient_id", prayer.recipient_id)
      .eq("is_read", false)
      .select("id, is_read, read_at");

    if (error || !data?.length) {
      console.error("Update read status:", error);

      readButton.disabled = false;
      readButton.textContent = "Try again";

      status(
        "dashboard-status",
        "Couldn't update status. Check your access policies and try again.",
        true
      );
      return;
    }

    const saved = currentPrayers.find(
      (item) => String(item.id) === String(prayer.id)
    );

    if (saved) {
      saved.is_read = true;
      saved.read_at = data[0].read_at;
    }

    status("dashboard-status", "Marked as read.");

    if (saved) {
      openPrayer(saved);
    } else {
      renderPrayerList();
    }
  });

  card.append(sender, date, readStatus, divider, text, readButton);
  list.append(back, card);
}

/* RECIPIENT DASHBOARD */

async function renderDashboard() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    showSection("login-section");
    return;
  }

  const { data: account, error: accountError } = await supabase
    .from("recipient_accounts")
    .select("recipient_id, recipients(display_name)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (accountError || !account) {
    console.error("Recipient account:", accountError);

    status(
      "login-status",
      "This account isn't linked to a recipient yet.",
      true
    );

    showSection("login-section");
    return;
  }

  $("welcome-title").textContent =
    `Hi, ${account.recipients?.display_name ?? "there"}`;

  $("dashboard-subtitle").textContent =
    "Prayers sent just for you.";

  showSection("dashboard-section");
  status("dashboard-status", "Loading prayers...");

  const { data, error } = await supabase
    .from("prayers")
    .select(
      "id, recipient_id, sender_name, prayer, created_at, is_read, read_at"
    )
    .eq("recipient_id", account.recipient_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Load prayers:", error);

    $("prayer-count").textContent = "—";

    status(
      "dashboard-status",
      "Couldn't load prayers. Please refresh.",
      true
    );
    return;
  }

  currentPrayers = data ?? [];
  currentFilter = "all";

  $("prayer-count").textContent = String(currentPrayers.length);

  $("prayer-tabs")
    .querySelectorAll("[data-filter]")
    .forEach((tab) => {
      const active = tab.dataset.filter === "all";

      tab.classList.toggle("active", active);
      tab.setAttribute("aria-pressed", String(active));
    });

  status("dashboard-status", "");
  renderPrayerList();
}

/* PUBLIC PRAYER STATUS: METADATA ONLY */

$("load-public-status").addEventListener("click", loadPublicStatus);

async function loadPublicStatus() {
  const button = $("load-public-status");

  button.disabled = true;
  status("public-status-message", "Loading...");

  try {
    const { data, error } = await supabase.rpc(
      "get_public_prayer_status"
    );

    if (error) throw error;

    publicStatusCache = data ?? [];
    publicStatusLoaded = true;

    renderPublicStatus();
  } catch (error) {
    console.error("Public status:", error);

    $("public-status-list").replaceChildren();

    status(
      "public-status-message",
      "Couldn't load status. Please try again.",
      true
    );
  } finally {
    button.disabled = false;
  }
}

function renderPublicStatus() {
  const list = $("public-status-list");

  const query = $("public-status-search")
    .value.trim()
    .toLocaleLowerCase("en-MY");

  list.replaceChildren();

  const results = publicStatusCache.filter((item) => {
    const sender = (item.sender_name ?? "").toLocaleLowerCase("en-MY");
    const recipient = (item.recipient_name ?? "").toLocaleLowerCase("en-MY");

    return sender.includes(query) || recipient.includes(query);
  });

  if (!results.length) {
    status(
      "public-status-message",
      query ? "No matching names found." : "No prayers to show yet."
    );
    return;
  }

  status("public-status-message", "");

  for (const item of results) {
    const card = document.createElement("article");
    card.className = "public-status-card";

    card.append(
      safeText("strong", "public-status-sender", item.sender_name),
      safeText("p", "public-status-recipient", `For ${item.recipient_name}`),
      safeText("time", "public-status-date", formatDate(item.created_at)),
      safeText(
        "span",
        item.is_read ? "public-read-badge" : "public-unread-badge",
        item.is_read ? "Read" : "Unread"
      )
    );

    if (item.is_read && item.read_at) {
      card.append(
        safeText(
          "p",
          "public-status-read-time",
          `Read on ${formatDate(item.read_at)}`
        )
      );
    }

    list.append(card);
  }
}

$("public-status-search").addEventListener("input", () => {
  if (publicStatusLoaded) {
    renderPublicStatus();
  }
});

/* INITIALISE */

async function init() {
  await loadRecipients();

  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Get session:", error);
  }

  if (session) {
    await renderDashboard();
  } else {
    showSection("send-section");
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session) {
      renderDashboard();
    }
  });
}

init();
