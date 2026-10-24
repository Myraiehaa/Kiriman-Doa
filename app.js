
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

function showSection(id) {
  ["send-section", "login-section", "dashboard-section"].forEach(
    (sectionId) => {
      $(sectionId).classList.toggle("hidden", sectionId !== id);
    }
  );

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function status(id, message, isError = false) {
  const element = $(id);
  element.textContent = message;
  element.classList.toggle("error", isError);
}

function safeText(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value ?? "";
  return element;
}

function formatDate(value) {
  if (!value) return "Tarikh tidak tersedia";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tarikh tidak tersedia";
  }

  return date.toLocaleString("ms-MY", {
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

/* RECIPIENTS */

async function loadRecipients() {
  const select = $("recipient");

  const { data, error } = await supabase
    .from("recipients")
    .select("id, display_name")
    .order("display_name");

  if (error) {
    console.error(error);
    status(
      "send-status",
      "Tak dapat muatkan senarai nama. Cuba refresh halaman.",
      true
    );
    return;
  }

  select.replaceChildren(new Option("Pilih nama", ""));

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
  const recipientValue = $("recipient").value;
  const recipient_id = Number(recipientValue);

  if (
    !sender_name ||
    !prayer ||
    !recipientValue ||
    !Number.isSafeInteger(recipient_id) ||
    recipient_id <= 0
  ) {
    status("send-status", "Lengkapkan semua ruangan dulu ya.", true);
    return;
  }

  setBusy(form, true);
  status("send-status", "Sedang hantar doa…");

  try {
    const { error } = await supabase
      .from("prayers")
      .insert({ sender_name, prayer, recipient_id });

    if (error) throw error;

    form.reset();
    status("send-status", "");

    window.alert("Doa dah selamat dihantar.");

    // Refresh status if the public list has already been opened.
    if (publicStatusLoaded) {
      await loadPublicStatus();
    }
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    status("dashboard-status", "Tak dapat log keluar. Cuba lagi.", true);
    return;
  }

  currentPrayers = [];
  showSection("send-section");
});

/* PRAYER FILTERS */

$("prayer-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-filter]");
  if (!tab) return;

  currentFilter = tab.dataset.filter;

  $("prayer-tabs").querySelectorAll("[data-filter]").forEach((button) => {
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
        ? "Semua doa dah dibaca."
        : currentFilter === "read"
          ? "Belum ada doa yang ditandakan dah dibaca."
          : "Belum ada kiriman doa.";

    empty.append(
      safeText("strong", "", message),
      safeText("p", "", "Bila ada kiriman baru, nama pengirim akan muncul dekat sini.")
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
          prayer.is_read ? "Dah dibaca" : "Belum dibaca"
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
  back.className = "text-button prayer-back";
  back.textContent = "← Kembali ke senarai";
  back.addEventListener("click", renderPrayerList);

  const card = document.createElement("article");
  card.className = "prayer-card prayer-detail";

  const heading = safeText("h3", "detail-sender", prayer.sender_name);
  const date = safeText("time", "detail-date", formatDate(prayer.created_at));
  const readStatus = safeText(
    "p",
    "detail-read-status",
    prayer.is_read
      ? `Dah dibaca${prayer.read_at ? ` · ${formatDate(prayer.read_at)}` : ""}`
      : "Belum dibaca"
  );
  const divider = document.createElement("hr");
  const text = safeText("p", "prayer-text", prayer.prayer);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "primary-button";
  button.textContent = prayer.is_read
    ? "Dah dibaca"
    : "Tandakan sebagai dah dibaca";
  button.disabled = Boolean(prayer.is_read);

  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "Menyimpan…";

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
      console.error(error);
      button.disabled = false;
      button.textContent = "Cuba sekali lagi";
      status(
        "dashboard-status",
        "Status tak berjaya dikemas kini. Cuba lagi.",
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

    status("dashboard-status", "Status bacaan dah dikemas kini.");
    renderPrayerList();

    // Reopen the selected prayer so the recipient sees the updated status.
    if (saved) openPrayer(saved);
  });

  card.append(heading, date, readStatus, divider, text, button);
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
    console.error(accountError);
    status(
      "login-status",
      "Akaun ini belum dipautkan kepada nama penerima.",
      true
    );
    showSection("login-section");
    return;
  }

  $("welcome-title").textContent =
    `Assalamualaikum, ${account.recipients?.display_name ?? "awak"}`;

  $("dashboard-subtitle").textContent =
    "Jom baca doa yang orang titipkan untuk awak.";

  showSection("dashboard-section");
  status("dashboard-status", "Memuatkan doa…");

  const { data, error } = await supabase
    .from("prayers")
    .select("id, recipient_id, sender_name, prayer, created_at, is_read, read_at")
    .eq("recipient_id", account.recipient_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    $("prayer-count").textContent = "—";
    status(
      "dashboard-status",
      "Tak dapat muatkan doa. Cuba refresh halaman.",
      true
    );
    return;
  }

  currentPrayers = data ?? [];
  currentFilter = "all";
  $("prayer-count").textContent = String(currentPrayers.length);

  $("prayer-tabs").querySelectorAll("[data-filter]").forEach((tab) => {
    const active = tab.dataset.filter === "all";
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-pressed", String(active));
  });

  status("dashboard-status", "");
  renderPrayerList();
}

/* PUBLIC STATUS SEARCH */

$("load-public-status").addEventListener("click", loadPublicStatus);

async function loadPublicStatus() {
  const button = $("load-public-status");
  const list = $("public-status-list");

  button.disabled = true;
  status("public-status-message", "Memuatkan status…");

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
    list.replaceChildren();
    status(
      "public-status-message",
      "Tak dapat muatkan status sekarang. Cuba lagi nanti.",
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
    .toLocaleLowerCase("ms-MY");

  list.replaceChildren();

  const results = publicStatusCache.filter((item) => {
    const sender = (item.sender_name ?? "").toLocaleLowerCase("ms-MY");
    const recipient = (item.recipient_name ?? "").toLocaleLowerCase("ms-MY");

    return sender.includes(query) || recipient.includes(query);
  });

  if (!results.length) {
    status(
      "public-status-message",
      query
        ? "Tak jumpa nama tu. Cuba semak ejaan."
        : "Belum ada status kiriman untuk dipaparkan."
    );
    return;
  }

  status("public-status-message", "");

  for (const item of results) {
    const card = document.createElement("article");
    card.className = "public-status-card";

    card.append(
      safeText("strong", "public-status-sender", item.sender_name),
      safeText(
        "p",
        "public-status-recipient",
        `Untuk: ${item.recipient_name}`
      ),
      safeText("time", "public-status-date", formatDate(item.created_at)),
      safeText(
        "span",
        item.is_read ? "public-read-badge" : "public-unread-badge",
        item.is_read ? "Dah dibaca" : "Belum dibaca"
      )
    );

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
}

$("public-status-search").addEventListener("input", () => {
  if (publicStatusLoaded) renderPublicStatus();
});

/* INITIALISE */

async function init() {
  await loadRecipients();

  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error) console.error(error);

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
