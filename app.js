import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* =========================
   1. SUPABASE CONNECTION
========================= */

const SUPABASE_URL = "https://nxpfaispvioujkfhewas.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_N-P-wI7MaTwLUJRbzf_C7Q_Nea2I6QZ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const $ = (id) => document.getElementById(id);

let currentPrayers = [];
let currentFilter = "all";
let publicStatusCache = [];
let publicStatusLoaded = false;
let currentLanguage = localStorage.getItem("kd-language") || "ms";

/* =========================
   2. LANGUAGE TRANSLATIONS
========================= */

const translations = {
  ms: {
    mySpace: "My space",
    heroLabel: "KIRIMAN DOA, SEBUAH PERJALANAN IMAN",
    heroTitle: 'Kiriman Doa<br><span>ke Tanah Suci.</span>',
    heroDescription: "Titipkan doa anda di sini. Insya-Allah, doa ini akan dibawa ke Tanah Suci.",
    sendEyebrow: "KIRIMAN ANDA",
    sendTitle: 'Kirimkan doa<span>.</span>',
    sendDescription: "Tuliskan doa yang ingin dititipkan untuk dibacakan di Tanah Suci.",
    yourName: "Nama anda",
    sendTo: "Kirim kepada",
    yourPrayer: "Doa anda",
    prayerNote: "Ambil masa anda. Tuliskan dengan ikhlas.",
    sendButton: "Hantar doa",
    statusEyebrow: "KEMAS KINI DOA",
    statusTitle: 'Status doa<span>.</span>',
    statusDescription: "Semak sama ada doa anda telah dibaca.",
    searchPlaceholder: "Cari nama pengirim atau penerima...",
    checkStatus: "Semak status",
    privacyNote: "Kandungan doa hanya boleh dibaca oleh penerima yang dituju.",
    backHome: "Kembali ke halaman utama",
    loginEyebrow: "RUANG PERIBADI ANDA",
    loginTitle: 'Selamat kembali<span>.</span>',
    loginDescription: "Log masuk untuk membaca doa yang dikirimkan khas buat anda.",
    loginAs: "Log masuk sebagai",
    password: "Kata laluan",
    loginButton: "Log masuk",
    personalSpace: "RUANG PERIBADI",
    logout: "Log keluar",
    prayerCollection: "KOLEKSI DOA ANDA",
    dashboardDescription: "Doa yang telah dikirimkan khas buat anda.",
    prayersReceived: "Doa diterima",
    yourCollection: "KOLEKSI ANDA",
    allPrayers: 'Semua doa<span>.</span>',
    all: "Semua",
    unread: "Belum dibaca",
    read: "Sudah dibaca",
    footerText: "Semoga setiap doa disampaikan dengan penuh keikhlasan.",
    chooseName: "Pilih nama",
    loadingNames: "Sedang memuatkan nama...",
    sendSuccess: "Doa anda berjaya dihantar.",
    sending: "Sedang menghantar doa...",
    fillFields: "Sila lengkapkan semua ruangan.",
    sendError: "Doa tidak berjaya dihantar. Sila cuba lagi.",
    loading: "Sedang memuatkan...",
    loginError: "Nama atau kata laluan tidak tepat.",
    loggingIn: "Sedang log masuk...",
    accountError: "Akaun ini belum dipautkan kepada penerima.",
    loadingPrayers: "Sedang memuatkan doa...",
    loadError: "Doa tidak berjaya dimuatkan. Sila refresh.",
    noPrayers: "Belum ada doa diterima.",
    noUnread: "Tiada doa yang belum dibaca.",
    noRead: "Tiada doa yang telah dibaca.",
    newPrayers: "Doa baharu akan dipaparkan di sini.",
    prayerRead: "Sudah dibaca",
    prayerUnread: "Belum dibaca",
    markRead: "Tandakan sudah dibaca",
    alreadyRead: "Sudah dibaca",
    saving: "Sedang menyimpan...",
    saveError: "Tidak berjaya mengemas kini status doa.",
    saved: "Status doa berjaya dikemas kini.",
    backPrayers: "Kembali ke senarai doa",
    noResults: "Tiada nama yang sepadan.",
    noPublicPrayers: "Belum ada doa untuk dipaparkan.",
    publicStatusReady: "Tekan semak status untuk melihat perkembangan doa.",
    publicStatusError: "Status tidak berjaya dimuatkan.",
    dateUnavailable: "Tarikh tidak tersedia",
    forRecipient: "Untuk",
    readOn: "Dibaca pada"
  },

  en: {
    mySpace: "My space",
    heroLabel: "A LITTLE PRAYER, A JOURNEY OF FAITH",
    heroTitle: 'Prayer Requests<br><span>to the Holy Land.</span>',
    heroDescription: "Leave your prayers here. Insya-Allah, they will be carried to the Holy Land.",
    sendEyebrow: "YOUR MESSAGE",
    sendTitle: 'Send a prayer<span>.</span>',
    sendDescription: "Write a prayer to be recited in the blessed land.",
    yourName: "Your name",
    sendTo: "Send to",
    yourPrayer: "Your prayer",
    prayerNote: "Take your time. Write with sincerity.",
    sendButton: "Send prayer",
    statusEyebrow: "PRAYER UPDATES",
    statusTitle: 'Prayer status<span>.</span>',
    statusDescription: "Check whether your prayer has been read.",
    searchPlaceholder: "Search sender or recipient...",
    checkStatus: "Check status",
    privacyNote: "Prayer content can only be read by its intended recipient.",
    backHome: "Back to home",
    loginEyebrow: "YOUR PERSONAL SPACE",
    loginTitle: 'Welcome back<span>.</span>',
    loginDescription: "Log in to read the prayers sent just for you.",
    loginAs: "Log in as",
    password: "Password",
    loginButton: "Log in",
    personalSpace: "YOUR PERSONAL SPACE",
    logout: "Log out",
    prayerCollection: "YOUR PRAYER COLLECTION",
    dashboardDescription: "Prayers sent just for you.",
    prayersReceived: "Prayers received",
    yourCollection: "YOUR COLLECTION",
    allPrayers: 'All prayers<span>.</span>',
    all: "All",
    unread: "Unread",
    read: "Read",
    footerText: "May every prayer be delivered with sincerity.",
    chooseName: "Choose your name",
    loadingNames: "Loading names...",
    sendSuccess: "Your prayer has been sent successfully.",
    sending: "Sending your prayer...",
    fillFields: "Please complete all fields.",
    sendError: "Couldn't send your prayer. Please try again.",
    loading: "Loading...",
    loginError: "Incorrect name or password.",
    loggingIn: "Logging in...",
    accountError: "This account isn't linked to a recipient.",
    loadingPrayers: "Loading prayers...",
    loadError: "Couldn't load prayers. Please refresh.",
    noPrayers: "No prayers received yet.",
    noUnread: "No unread prayers.",
    noRead: "No read prayers.",
    newPrayers: "New prayers will appear here.",
    prayerRead: "Read",
    prayerUnread: "Unread",
    markRead: "Mark as read",
    alreadyRead: "Already read",
    saving: "Saving...",
    saveError: "Couldn't update prayer status.",
    saved: "Prayer status updated successfully.",
    backPrayers: "Back to prayers",
    noResults: "No matching names found.",
    noPublicPrayers: "No prayers to show yet.",
    publicStatusReady: "Check the latest prayer status here.",
    publicStatusError: "Couldn't load prayer status.",
    dateUnavailable: "Date unavailable",
    forRecipient: "For",
    readOn: "Read on"
  }
};

function t(key) {
  return translations[currentLanguage][key] || key;
}

/* =========================
   3. LANGUAGE SWITCH
========================= */

function applyLanguage() {
  document.documentElement.lang = currentLanguage;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;

    if (translations[currentLanguage][key]) {
      element.innerHTML = translations[currentLanguage][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;

    if (translations[currentLanguage][key]) {
      element.placeholder = translations[currentLanguage][key];
    }
  });

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.language === currentLanguage
    );
  });

  updateRecipientOptions();
  renderPrayerList();

  if (publicStatusLoaded) {
    renderPublicStatus();
  }
}

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    currentLanguage = button.dataset.language;
    localStorage.setItem("kd-language", currentLanguage);
    applyLanguage();
  });
});

/* =========================
   4. LIGHT / DARK THEME
========================= */

function applyTheme(theme) {
  document.body.dataset.theme = theme;

  $("theme-icon").textContent =
    theme === "dark" ? "☀" : "☾";

  localStorage.setItem("kd-theme", theme);
}

const savedTheme = localStorage.getItem("kd-theme") || "light";
applyTheme(savedTheme);

$("theme-toggle").addEventListener("click", () => {
  const newTheme =
    document.body.dataset.theme === "light" ? "dark" : "light";

  applyTheme(newTheme);
});

/* =========================
   5. COMMON FUNCTIONS
========================= */

function showSection(id) {
  ["send-section", "login-section", "dashboard-section"].forEach((sectionId) => {
    $(sectionId).classList.toggle("hidden", sectionId !== id);
  });

  $("site-header").classList.toggle(
    "hidden",
    id === "dashboard-section"
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

  if (className) {
    element.className = className;
  }

  element.textContent = value ?? "";
  return element;
}

function formatDate(value) {
  if (!value) return t("dateUnavailable");

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return t("dateUnavailable");
  }

  return date.toLocaleString(
    currentLanguage === "ms" ? "ms-MY" : "en-MY",
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

  if (button) button.disabled = busy;
}

/* =========================
   6. NAVIGATION
========================= */

$("nav-login").addEventListener("click", () => {
  status("login-status", "");
  $("login-form").reset();
  showSection("login-section");
});

$("back-to-form").addEventListener("click", () => {
  showSection("send-section");
});

/* =========================
   7. LOAD RECIPIENTS
========================= */

let recipients = [];

async function loadRecipients() {
  const { data, error } = await supabase
    .from("recipients")
    .select("id, display_name")
    .order("display_name");

  if (error) {
    console.error("Load recipients:", error);
    status("send-status", t("loadError"), true);
    return;
  }

  recipients = data || [];
  updateRecipientOptions();
}

function updateRecipientOptions() {
  const sendSelect = $("recipient");
  const loginSelect = $("login-recipient");

  const selectedSend = sendSelect.value;
  const selectedLogin = loginSelect.value;

  sendSelect.replaceChildren(
    new Option(t("chooseName"), "")
  );

  loginSelect.replaceChildren(
    new Option(t("chooseName"), "")
  );

  recipients.forEach((person) => {
    sendSelect.add(
      new Option(person.display_name, person.id)
    );

    loginSelect.add(
      new Option(person.display_name, person.id)
    );
  });

  sendSelect.value = selectedSend;
  loginSelect.value = selectedLogin;
}

/* =========================
   8. SEND PRAYER
========================= */

$("prayer-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;

  const sender_name = $("sender").value.trim();
  const prayer = $("prayer").value.trim();
  const recipient_id = $("recipient").value;

  if (!sender_name || !prayer || !recipient_id) {
    status("send-status", t("fillFields"), true);
    return;
  }

  if (sender_name.length > 80 || prayer.length > 3000) {
    status("send-status", t("fillFields"), true);
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

    status("send-status", t("sendSuccess"));

    if (publicStatusLoaded) {
      await loadPublicStatus();
    }

  } catch (error) {
    console.error("Send prayer:", error);
    status("send-status", t("sendError"), true);

  } finally {
    setBusy(form, false);
  }
});

/* =========================
   9. LOGIN
========================= */

/*
  The selected recipient ID is converted into an
  internal email address for Supabase authentication.

  Users only see the recipient dropdown and password.
*/

function internalLoginEmail(recipientId) {
  return `recipient-${recipientId}@login.kiriman-doa.app`;
}

$("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;

  const recipientId = $("login-recipient").value;
  const password = $("password").value;

  if (!recipientId || !password) {
    status("login-status", t("fillFields"), true);
    return;
  }

  setBusy(form, true);
  status("login-status", t("loggingIn"));

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: internalLoginEmail(recipientId),
      password
    });

    if (error) throw error;

    status("login-status", "");

  } catch (error) {
    console.error("Login:", error);
    status("login-status", t("loginError"), true);

  } finally {
    setBusy(form, false);
  }
});

/* =========================
   10. LOG OUT
========================= */

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
    console.error("Logout:", error);
    status("dashboard-status", t("saveError"), true);

  } finally {
    button.disabled = false;
  }
});

/* =========================
   11. FILTER PRAYERS
========================= */

$("prayer-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-filter]");

  if (!tab) return;

  currentFilter = tab.dataset.filter;

  document.querySelectorAll("[data-filter]").forEach((button) => {
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

/* =========================
   12. DISPLAY PRAYER LIST
========================= */

function renderPrayerList() {
  const list = $("prayer-list");

  if (!list) return;

  list.replaceChildren();

  const prayers = getFilteredPrayers();

  if (!prayers.length) {
    let message = t("noPrayers");

    if (currentFilter === "unread") {
      message = t("noUnread");
    }

    if (currentFilter === "read") {
      message = t("noRead");
    }

    const empty = document.createElement("div");
    empty.className = "empty-state";

    empty.append(
      safeText("strong", "", message),
      safeText("p", "", t("newPrayers"))
    );

    list.append(empty);
    return;
  }

  prayers.forEach((prayer) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "sender-row";

    const info = document.createElement("span");
    info.className = "sender-info";

    const readLabel = prayer.is_read
      ? t("prayerRead")
      : t("prayerUnread");

    info.append(
      safeText("strong", "sender-name", prayer.sender_name),
      safeText(
        "small",
        "sender-hint",
        `${formatDate(prayer.created_at)} · ${readLabel}`
      )
    );

    button.append(
      info,
      safeText("span", "sender-arrow", "›")
    );

    button.addEventListener("click", () => {
      openPrayer(prayer);
    });

    list.append(button);
  });
}

/* =========================
   13. PRAYER DETAILS
========================= */

function openPrayer(prayer) {
  const list = $("prayer-list");
  list.replaceChildren();

  const back = document.createElement("button");
  back.type = "button";
  back.className = "prayer-back";
  back.textContent = t("backPrayers");

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
    prayer.is_read ? t("prayerRead") : t("prayerUnread")
  );

  const divider = document.createElement("hr");

  const prayerText = safeText(
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
    readButton.textContent = t("saving");

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
      readButton.textContent = t("markRead");

      status("dashboard-status", t("saveError"), true);
      return;
    }

    const saved = currentPrayers.find(
      (item) => String(item.id) === String(prayer.id)
    );

    if (saved) {
      saved.is_read = true;
      saved.read_at = data[0].read_at;
    }

    status("dashboard-status", t("saved"));

    if (publicStatusLoaded) {
      await loadPublicStatus();
    }

    if (saved) {
      openPrayer(saved);
    }
  });

  card.append(
    sender,
    date,
    readStatus,
    divider,
    prayerText,
    readButton
  );

  list.append(back, card);
}

/* =========================
   14. RECIPIENT DASHBOARD
========================= */

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

    status("login-status", t("accountError"), true);
    showSection("login-section");
    return;
  }

  const recipientName =
    account.recipients?.display_name || "";

  $("welcome-title").textContent =
    currentLanguage === "ms"
      ? `Hai, ${recipientName}.`
      : `Hello, ${recipientName}.`;

  $("dashboard-subtitle").textContent =
    t("dashboardDescription");

  showSection("dashboard-section");

  status("dashboard-status", t("loadingPrayers"));

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
    status("dashboard-status", t("loadError"), true);
    return;
  }

  currentPrayers = data || [];
  currentFilter = "all";

  $("prayer-count").textContent =
    String(currentPrayers.length);

  document.querySelectorAll("[data-filter]").forEach((tab) => {
    const active = tab.dataset.filter === "all";

    tab.classList.toggle("active", active);
    tab.setAttribute("aria-pressed", String(active));
  });

  status("dashboard-status", "");
  renderPrayerList();
}

/* =========================
   15. PUBLIC PRAYER STATUS
========================= */

$("load-public-status").addEventListener(
  "click",
  loadPublicStatus
);

async function loadPublicStatus() {
  const button = $("load-public-status");

  button.disabled = true;
  status("public-status-message", t("loading"));

  try {
    const { data, error } = await supabase.rpc(
      "get_public_prayer_status"
    );

    if (error) throw error;

    publicStatusCache = data || [];
    publicStatusLoaded = true;

    renderPublicStatus();

  } catch (error) {
    console.error("Public status:", error);

    $("public-status-list").replaceChildren();

    status(
      "public-status-message",
      t("publicStatusError"),
      true
    );

  } finally {
    button.disabled = false;
  }
}

function renderPublicStatus() {
  const list = $("public-status-list");

  const query = $("public-status-search")
    .value.trim().toLocaleLowerCase(
      currentLanguage === "ms" ? "ms-MY" : "en-MY"
    );

  list.replaceChildren();

  const results = publicStatusCache.filter((item) => {
    const sender = (item.sender_name || "").toLocaleLowerCase();
    const recipient = (item.recipient_name || "").toLocaleLowerCase();

    return sender.includes(query) || recipient.includes(query);
  });

  if (!results.length) {
    status(
      "public-status-message",
      query ? t("noResults") : t("noPublicPrayers")
    );
    return;
  }

  status("public-status-message", "");

  results.forEach((item) => {
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
        `${t("forRecipient")} ${item.recipient_name}`
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
          ? t("prayerRead")
          : t("prayerUnread")
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
  });
}

$("public-status-search").addEventListener("input", () => {
  if (publicStatusLoaded) {
    renderPublicStatus();
  }
});

/* =========================
   16. INITIALISE WEBSITE
========================= */

async function init() {
  applyLanguage();

  await loadRecipients();

  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Session:", error);
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

    if (event === "SIGNED_OUT") {
      currentPrayers = [];
      currentFilter = "all";
      showSection("send-section");
    }
  });
}

init();
