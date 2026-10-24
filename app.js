
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://nxpfaispvioujkfhewas.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_N-P-wI7MaTwLUJRbzf_C7Q_Nea2I6QZ";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const $ = (id) => document.getElementById(id);

const sections = [
  "send-section",
  "login-section",
  "dashboard-section"
];

let currentPrayers = [];
let currentRecipientName = "";
let currentFilter = "all";
let currentPrayerView = "list";

function showSection(id) {
  sections.forEach((section) => {
    $(section).classList.toggle("hidden", section !== id);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function status(id, message, isError = false) {
  const node = $(id);
  node.textContent = message;
  node.classList.toggle("error", isError);
}

function setBusy(form, busy) {
  const button = form.querySelector('button[type="submit"]');
  if (button) button.disabled = busy;
}

function safeText(tag, className, value) {
  const node = document.createElement(tag);

  if (className) node.className = className;

  node.textContent = value ?? "";
  return node;
}

function formatDate(value, includeTime = true) {
  if (!value) return "Tarikh tidak tersedia";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tarikh tidak tersedia";
  }

  return date.toLocaleString("ms-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? { hour: "2-digit", minute: "2-digit" }
      : {})
  });
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
      "Tak dapat memuatkan senarai penerima.",
      true
    );
    return;
  }

  select.replaceChildren(new Option("Pilih nama", ""));

  for (const recipient of data ?? []) {
    select.add(
      new Option(recipient.display_name, recipient.id)
    );
  }
}

/* SEND PRAYER */

$("prayer-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const sender_name = $("sender").value.trim();
  const prayer = $("prayer").value.trim();
  const recipientValue = $("recipient").value;
  const recipient_id = Number(recipientValue);

  if (
    !sender_name ||
    !prayer ||
    !recipientValue ||
    !Number.isSafeInteger(recipient_id) ||
    recipient_id <= 0
  ) {
    status(
      "send-status",
      "Sila lengkapkan semua ruangan.",
      true
    );
    return;
  }

  setBusy(form, true);
  status("send-status", "Sedang menghantar doa…");

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
    status("send-status", "");

    // Popup ringkas tanpa emoji.
    window.alert("Doa dah selamat dihantar.");

  } catch (error) {
    console.error("Send prayer:", error);

    status(
      "send-status",
      "Doa tak berjaya dihantar. Cuba sekali lagi.",
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
  status("login-status", "Sedang log masuk…");

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
      "Tak dapat log masuk. Semak e-mel dan kata laluan.",
      true
    );
  } finally {
    setBusy(form, false);
  }
});

/* LOGOUT */

$("logout-button").addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout:", error);
    status("dashboard-status", "Tak dapat log keluar.", true);
    return;
  }

  currentPrayers = [];
  currentPrayerView = "list";
  showSection("send-section");
});

/* FILTER TABS */

$("prayer-tabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");

  if (!button) return;

  currentFilter = button.dataset.filter;

  $("prayer-tabs")
    .querySelectorAll("[data-filter]")
    .forEach((tab) => {
      const active = tab === button;

      tab.classList.toggle("active", active);
      tab.setAttribute("aria-pressed", String(active));
    });

  renderPrayerList();
});

function getFilteredPrayers() {
  if (currentFilter === "unread") {
    return currentPrayers.filter((prayer) => !prayer.is_read);
  }

  if (currentFilter === "read") {
    return currentPrayers.filter((prayer) => prayer.is_read);
  }

  return currentPrayers;
}

/* PRAYER LIST */

function renderPrayerList() {
  const list = $("prayer-list");
  list.replaceChildren();
  currentPrayerView = "list";

  const prayers = getFilteredPrayers();

  if (!prayers.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";

    const message =
      currentFilter === "unread"
        ? "Tiada doa yang belum dibaca."
        : currentFilter === "read"
          ? "Belum ada doa yang ditandakan sebagai dibaca."
          : "Belum ada kiriman doa.";

    empty.append(
      safeText("strong", "", message),
      safeText(
        "p",
        "",
        "Kiriman doa akan muncul di sini apabila diterima."
      )
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

    const sender = safeText(
      "strong",
      "sender-name",
      prayer.sender_name
    );

    const hint = safeText(
      "small",
      "sender-hint",
      `${formatDate(prayer.created_at)} · ${
        prayer.is_read ? "Dah dibaca" : "Belum dibaca"
      }`
    );

    info.append(sender, hint);

    const arrow = safeText("span", "sender-arrow", "→");

    button.append(info, arrow);

    button.addEventListener("click", () => {
      openPrayer(prayer);
    });

    list.append(button);
  }
}

/* OPEN A PRAYER */

function openPrayer(prayer) {
  const list = $("prayer-list");

  list.replaceChildren();
  currentPrayerView = "detail";

  const back = document.createElement("button");
  back.type = "button";
  back.className = "text-button prayer-back";
  back.textContent = "← Kembali ke senarai";

  back.addEventListener("click", () => {
    renderPrayerList();
  });

  const card = document.createElement("article");
  card.className = "prayer-card prayer-detail";

  const sender = safeText(
    "h3",
    "detail-sender",
    prayer.sender_name
  );

  const date = safeText(
    "time",
    "detail-date",
    formatDate(prayer.created_at)
  );

  const divider = document.createElement("hr");

  const text = safeText(
    "p",
    "prayer-text",
    prayer.prayer
  );

  const readStatus = safeText(
    "p",
    "detail-read-status",
    prayer.is_read
      ? `Dah dibaca${prayer.read_at ? ` · ${formatDate(prayer.read_at)}` : ""}`
      : "Belum dibaca"
  );

  const readButton = document.createElement("button");
  readButton.type = "button";
  readButton.className = "primary-button";

  readButton.textContent = prayer.is_read
    ? "Doa sudah dibaca"
    : "Tandakan sebagai dah dibaca";

  readButton.disabled = Boolean(prayer.is_read);

  readButton.addEventListener("click", async () => {
    if (prayer.is_read) return;

    readButton.disabled = true;
    readButton.textContent = "Menyimpan status…";

    const readAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("prayers")
      .update({
        is_read: true,
        read_at: readAt
      })
      .eq("id", prayer.id)
      .eq("recipient_id", prayer.recipient_id)
      .eq("is_read", false)
      .select("id, is_read, read_at");

    if (error || !data?.length) {
      console.error("Update read status:", error);

      readButton.disabled = false;
      readButton.textContent = "Cuba tandakan sekali lagi";

      status(
        "dashboard-status",
        "Status tak berjaya disimpan. Semak polisi RLS dan cuba lagi.",
        true
      );
      return;
    }

    prayer.is_read = true;
    prayer.read_at = data[0].read_at;

    const savedPrayer = currentPrayers.find(
      (item) => String(item.id) === String(prayer.id)
    );

    if (savedPrayer) {
      savedPrayer.is_read = true;
      savedPrayer.read_at = data[0].read_at;
    }

    $("prayer-count").textContent = String(currentPrayers.length);

    status("dashboard-status", "Status bacaan berjaya dikemas kini.");

    openPrayer(savedPrayer ?? prayer);
  });

  card.append(
    sender,
    date,
    readStatus,
    divider,
    text,
    document.createElement("br"),
    readButton
  );

  list.append(back, card);
}

/* LOAD RECIPIENT DASHBOARD */

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
      "Akaun ini belum dipautkan kepada penerima.",
      true
    );

    showSection("login-section");
    return;
  }

  const recipientId = account.recipient_id;
  currentRecipientName =
    account.recipients?.display_name ?? "Penerima";

  $("welcome-title").textContent =
    `Assalamualaikum, ${currentRecipientName}`;

  $("dashboard-subtitle").textContent =
    "Doa-doa yang orang kirim untuk dibacakan di Tanah Suci.";

  showSection("dashboard-section");
  status("dashboard-status", "Memuatkan kiriman…");

  const { data: prayers, error } = await supabase
    .from("prayers")
    .select("id, recipient_id, sender_name, prayer, created_at, is_read, read_at")
    .eq("recipient_id", recipientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Load prayers:", error);

    $("prayer-count").textContent = "—";

    status(
      "dashboard-status",
      "Tak dapat memuatkan doa. Semak polisi RLS database.",
      true
    );
    return;
  }

  currentPrayers = prayers ?? [];
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

/* PUBLIC STATUS
   Calls the metadata-only Supabase RPC function.
   Never fetches prayer text for the public section.
*/

$("load-public-status").addEventListener("click", loadPublicStatus);

async function loadPublicStatus() {
  const button = $("load-public-status");
  const list = $("public-status-list");

  button.disabled = true;
  list.replaceChildren();

  status("public-status-message", "Memuatkan status kiriman…");

  try {
    const { data, error } = await supabase.rpc(
      "get_public_prayer_status"
    );

    if (error) throw error;

    if (!data?.length) {
      status(
        "public-status-message",
        "Belum ada status kiriman untuk dipaparkan."
      );
      return;
    }

    for (const item of data) {
      const card = document.createElement("article");
      card.className = "public-status-card";

      const sender = safeText(
        "strong",
        "public-status-sender",
        item.sender_name
      );

      const recipient = safeText(
        "p",
        "public-status-recipient",
        `Penerima: ${item.recipient_name}`
      );

      const date = safeText(
        "time",
        "public-status-date",
        formatDate(item.created_at)
      );

      const readStatus = safeText(
        "span",
        item.is_read
          ? "public-read-badge"
          : "public-unread-badge",
        item.is_read ? "Dah dibaca" : "Belum dibaca"
      );

      card.append(sender, recipient, date, readStatus);

      if (item.is_read && item.read_at) {
        card.append(
          safeText(
            "p",
            "public-status-read-time",
            `Dibaca pada ${formatDate(item.read_at)}`
          )
        );
      }

      list.append(card);
    }

    status("public-status-message", "");

  } catch (error) {
    console.error("Public prayer status:", error);

    status(
      "public-status-message",
      "Status tak dapat dimuatkan. Semak fungsi database dan akses RPC.",
      true
    );
  } finally {
    button.disabled = false;
  }
}

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

  supabase.auth.onAuthStateChange((event, sessionNow) => {
    if (event === "SIGNED_IN" && sessionNow) {
      renderDashboard();
    }
  });
}

init();
