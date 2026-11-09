
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
let recipientsCache = [];

/* RECIPIENT EMAILS
   Emails are used internally for Supabase login.
   Users only select their name on the website.
*/

const recipientEmails = {
  1: "aini_noni94@yahoo.com.my",
  2: "noratikahhasnun88@gmail.com",
  3: "amierulamri99@gmail.com",
  4: "amyratulj@gmail.com"
};

/* LANGUAGE */

let currentLanguage =
  localStorage.getItem("language") || "malay";

const translations = {
  malay: {
    loading: "Memuatkan...",
    login: "Log Masuk",
    logout: "Log Keluar",
    sending: "Menghantar doa...",
    sent: "Doa anda berjaya dihantar.",
    sendError: "Doa tidak berjaya dihantar. Sila cuba lagi.",
    loginLoading: "Sedang log masuk...",
    loginError: "Nama atau password tidak betul.",
    chooseName: "Pilih nama",
    all: "Semua Doa",
    unread: "Belum Dibaca",
    read: "Sudah Dibaca",
    markRead: "Tandakan Sudah Dibaca",
    alreadyRead: "Sudah Dibaca",
    tryAgain: "Cuba Lagi",
    noPrayers: "Belum ada doa.",
    noUnread: "Semua doa telah dibaca.",
    noRead: "Belum ada doa yang dibaca.",
    newPrayers: "Doa yang diterima akan dipaparkan di sini.",
    readStatus: "Sudah dibaca",
    unreadStatus: "Belum dibaca",
    dateUnavailable: "Tarikh tidak tersedia",
    back: "Kembali ke senarai doa",
    loadError: "Tidak dapat memuatkan doa. Sila refresh.",
    accountError: "Akaun ini belum dipautkan kepada penerima.",
    markedRead: "Doa ditandakan sebagai sudah dibaca.",
    statusError: "Tidak dapat mengemaskini status.",
    publicLoading: "Memuatkan status...",
    noResults: "Tiada nama yang sepadan dijumpai.",
    noPublicPrayers: "Belum ada doa untuk dipaparkan.",
    publicError: "Tidak dapat memuatkan status. Sila cuba lagi.",
    for: "Untuk",
    readOn: "Dibaca pada",
    incorrectFields: "Sila lengkapkan semua ruangan."
  },

  english: {
    loading: "Loading...",
    login: "Login",
    logout: "Logout",
    sending: "Sending your prayer...",
    sent: "Your prayer has been sent.",
    sendError: "Couldn't send your prayer. Please try again.",
    loginLoading: "Logging in...",
    loginError: "Incorrect name or password.",
    chooseName: "Choose a name",
    all: "All Prayers",
    unread: "Unread",
    read: "Read",
    markRead: "Mark as read",
    alreadyRead: "Already read",
    tryAgain: "Try again",
    noPrayers: "No prayers yet.",
    noUnread: "You're all caught up.",
    noRead: "No read prayers yet.",
    newPrayers: "New prayers will show up here.",
    readStatus: "Read",
    unreadStatus: "Unread",
    dateUnavailable: "Date unavailable",
    back: "Back to prayers",
    loadError: "Couldn't load prayers. Please refresh.",
    accountError: "This account isn't linked to a recipient yet.",
    markedRead: "Marked as read.",
    statusError: "Couldn't update status.",
    publicLoading: "Loading status...",
    noResults: "No matching names found.",
    noPublicPrayers: "No prayers to show yet.",
    publicError: "Couldn't load status. Please try again.",
    for: "For",
    readOn: "Read on",
    incorrectFields: "Please fill in every field."
  }
};

function t(key) {
  return translations[currentLanguage]?.[key] ??
    translations.malay[key] ??
    key;
}

function applyLanguage(language) {
  currentLanguage = language;
  localStorage.setItem("language", language);

  document.documentElement.lang =
    language === "malay" ? "ms" : "en";

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.language === language
    );
  });

  document.querySelectorAll("[data-ms][data-en]").forEach((element) => {
    element.textContent =
      language === "malay"
        ? element.dataset.ms
        : element.dataset.en;
  });
}

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    const language = button.dataset.language;

    if (language === "malay" || language === "english") {
      applyLanguage(language);
    }
  });
});

/* THEME */

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem("theme", theme);

  const icon = $("theme-icon");

  if (icon) {
    icon.textContent = theme === "dark" ? "☀" : "☾";
  }

  const button = $("theme-toggle");

  if (button) {
    button.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }
}

const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

if ($("theme-toggle")) {
  $("theme-toggle").addEventListener("click", () => {
    const nextTheme =
      document.body.dataset.theme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
  });
}

/* NAVIGATION */

function showSection(id) {
  ["send-section", "login-section", "dashboard-section"].forEach(
    (sectionId) => {
      const section = $(sectionId);

      if (section) {
        section.classList.toggle("hidden", sectionId !== id);
      }
    }
  );

  const header = $("site-header");

  if (header) {
    header.classList.toggle(
      "hidden",
      id === "dashboard-section"
    );
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* STATUS MESSAGE */

function status(id, message, isError = false) {
  const node = $(id);

  if (!node) return;

  node.textContent = message;
  node.classList.toggle("error", isError);
}

function safeText(tag, className, value) {
  const node = document.createElement(tag);

  if (className) {
    node.className = className;
  }

  node.textContent = value ?? "";

  return node;
}

function formatDate(value) {
  if (!value) return t("dateUnavailable");

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return t("dateUnavailable");
  }

  return date.toLocaleString(
    currentLanguage === "malay" ? "ms-MY" : "en-MY",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}

function setBusy(form, busy) {
  const button = form.querySelector('button[type="submit"]');

  if (button) {
    button.disabled = busy;
  }
}

/* HEADER NAVIGATION */

$("nav-login").addEventListener("click", () => {
  status("login-status", "");
  showSection("login-section");
});

$("back-to-form").addEventListener("click", () => {
  showSection("send-section");
});

/* LOAD RECIPIENTS */

async function loadRecipients() {
  const sendSelect = $("recipient");
  const loginSelect = $("login-recipient");

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

  recipientsCache = data ?? [];

  if (sendSelect) {
    sendSelect.replaceChildren(
      new Option(t("chooseName"), "")
    );

    recipientsCache.forEach((recipient) => {
      sendSelect.add(
        new Option(recipient.display_name, recipient.id)
      );
    });
  }

  if (loginSelect) {
    loginSelect.replaceChildren(
      new Option(t("chooseName"), "")
    );

    recipientsCache.forEach((recipient) => {
      loginSelect.add(
        new Option(recipient.display_name, recipient.id)
      );
    });
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
    status("send-status", t("incorrectFields"), true);
    return;
  }

  setBusy(form, true);
  status("send-status", t("sending"));

  try {
    const { error } = await supabase
      .from("prayers")
      .insert({
        sender_name,
        prayer,
        recipient_id: Number(recipient_id)
      });

    if (error) throw error;

    form.reset();

    status("send-status", t("sent"));

    if (publicStatusLoaded) {
      await loadPublicStatus();
    }

  } catch (error) {
    console.error("Send prayer:", error);

    status(
      "send-status",
      t("sendError"),
      true
    );

  } finally {
    setBusy(form, false);
  }
});

/* LOGIN - NAME + PASSWORD */

$("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;

  const recipientId = $("login-recipient").value;
  const password = $("password").value;

  if (!recipientId || !password) {
    status("login-status", t("incorrectFields"), true);
    return;
  }

  const email = recipientEmails[recipientId];

  if (!email) {
    status("login-status", t("loginError"), true);
    return;
  }

  setBusy(form, true);
  status("login-status", t("loginLoading"));

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    status("login-status", "");

    await renderDashboard();

  } catch (error) {
    console.error("Login:", error);

    status(
      "login-status",
      t("loginError"),
      true
    );

  } finally {
    setBusy(form, false);
  }
});

/* LOG OUT */

$("logout-button").addEventListener("click", async () => {
  const button = $("logout-button");

  button.disabled = true;

  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    currentPrayers = [];
    currentFilter = "all";

    showSection("send-section");

  } catch (error) {
    console.error("Log out:", error);

    status(
      "dashboard-status",
      "Couldn't log out. Please try again.",
      true
    );

  } finally {
    button.disabled = false;
  }
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

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
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
        ? t("noUnread")
        : currentFilter === "read"
          ? t("noRead")
          : t("noPrayers");

    empty.append(
      safeText("strong", "", message),
      safeText("p", "", t("newPrayers"))
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
      safeText(
        "strong",
        "sender-name",
        prayer.sender_name
      ),

      safeText(
        "small",
        "sender-hint",
        `${formatDate(prayer.created_at)} · ${
          prayer.is_read ? t("readStatus") : t("unreadStatus")
        }`
      )
    );

    button.append(
      info,
      safeText("span", "sender-arrow", "→")
    );

    button.addEventListener("click", () => {
      openPrayer(prayer);
    });

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
  back.textContent = `← ${t("back")}`;

  back.addEventListener("click", renderPrayerList);

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

  const readStatus = safeText(
    "p",
    "detail-read-status",
    prayer.is_read
      ? `${t("readStatus")}${
          prayer.read_at ? ` · ${formatDate(prayer.read_at)}` : ""
        }`
      : t("unreadStatus")
  );

  const divider = document.createElement("hr");

  const text = safeText(
    "p",
    "prayer-text",
    prayer.prayer
  );

  const readButton = document.createElement("button");

  readButton.type = "button";
  readButton.className = "primary-button";
  readButton.textContent = prayer.is_read
    ? t("alreadyRead")
    : t("markRead");

  readButton.disabled = Boolean(prayer.is_read);

  readButton.addEventListener("click", async () => {
    readButton.disabled = true;
    readButton.textContent = t("loading");

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
      readButton.textContent = t("tryAgain");

      status(
        "dashboard-status",
        t("statusError"),
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

      prayer.is_read = true;
      prayer.read_at = data[0].read_at;
    }

    status(
      "dashboard-status",
      t("markedRead")
    );

    openPrayer(saved || prayer);
  });

  card.append(
    sender,
    date,
    readStatus,
    divider,
    text,
    readButton
  );

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
      t("accountError"),
      true
    );

    showSection("login-section");

    await supabase.auth.signOut();

    return;
  }

  $("welcome-title").textContent =
    `Hi, ${account.recipients?.display_name ?? "there"}`;

  $("dashboard-subtitle").textContent =
    currentLanguage === "malay"
      ? "Doa-doa yang dikirimkan khas untuk anda."
      : "Prayers sent just for you.";

  showSection("dashboard-section");

  status("dashboard-status", t("loading"));

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
      t("loadError"),
      true
    );

    return;
  }

  currentPrayers = data ?? [];
  currentFilter = "all";

  $("prayer-count").textContent =
    String(currentPrayers.length);

  $("prayer-tabs")
    .querySelectorAll("[data-filter]")
    .forEach((tab) => {
      const active = tab.dataset.filter === "all";

      tab.classList.toggle("active", active);

      tab.setAttribute(
        "aria-pressed",
        String(active)
      );
    });

  status("dashboard-status", "");

  renderPrayerList();
}

/* PUBLIC PRAYER STATUS */

$("load-public-status").addEventListener(
  "click",
  loadPublicStatus
);

async function loadPublicStatus() {
  const button = $("load-public-status");

  button.disabled = true;

  status(
    "public-status-message",
    t("publicLoading")
  );

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
      t("publicError"),
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
    const sender = (item.sender_name ?? "")
      .toLocaleLowerCase("en-MY");

    const recipient = (item.recipient_name ?? "")
      .toLocaleLowerCase("en-MY");

    return sender.includes(query) ||
      recipient.includes(query);
  });

  if (!results.length) {
    status(
      "public-status-message",
      query
        ? t("noResults")
        : t("noPublicPrayers")
    );

    return;
  }

  status("public-status-message", "");

  for (const item of results) {
    const card = document.createElement("article");

    card.className = "public-status-card";

    card.append(
      safeText(
        "strong",
        "public-status-sender",
        item.sender_name
      ),

      safeText(
        "p",
        "public-status-recipient",
        `${t("for")} ${item.recipient_name}`
      ),

      safeText(
        "time",
        "public-status-date",
        formatDate(item.created_at)
      ),

      safeText(
        "span",
        item.is_read
          ? "public-read-badge"
          : "public-unread-badge",
        item.is_read
          ? t("readStatus")
          : t("unreadStatus")
      )
    );

    if (item.is_read && item.read_at) {
      card.append(
        safeText(
          "p",
          "public-status-read-time",
          `${t("readOn")} ${formatDate(item.read_at)}`
        )
      );
    }

    list.append(card);
  }
}

/* PUBLIC STATUS SEARCH */

$("public-status-search").addEventListener("input", () => {
  if (publicStatusLoaded) {
    renderPublicStatus();
  }
});

/* INITIALISE */

async function init() {
  applyLanguage(currentLanguage);

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

  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      currentPrayers = [];
      currentFilter = "all";
      showSection("send-section");
    }
  });
}

init();
