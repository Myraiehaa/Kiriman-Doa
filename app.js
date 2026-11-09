
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* SUPABASE */

const SUPABASE_URL = "https://nxpfaispvioujkfhewas.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_N-P-wI7MaTwLUJRbzf_C7Q_Nea2I6QZ";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const $ = (id) => document.getElementById(id);

/* STATE */

let currentPrayers = [];
let currentFilter = "all";
let publicStatusCache = [];
let publicStatusLoaded = false;

/* RECIPIENT EMAIL MAPPING */

const recipientEmails = {
  "1": "aini_noni94@yahoo.com.my",
  "2": "noratikahhasnun88@gmail.com",
  "3": "amierulamri99@gmail.com",
  "4": "amyratulj@gmail.com"
};

/* LANGUAGE */

let currentLanguage = localStorage.getItem("language") || "ms";

if (!["ms", "en"].includes(currentLanguage)) {
  currentLanguage = "ms";
}

const translations = {
  ms: {
    mySpace: "My space",
    heroLabel: "KIRIMAN DOA, SEBUAH PERJALANAN IMAN",
    heroTitle: "Kiriman Doa",
    heroDescription: "Titipkan doa anda di sini. Insya-Allah, doa ini akan dibawa ke Tanah Suci.",
    sendEyebrow: "KIRIMAN ANDA",
    sendTitle: "Kirimkan doa",
    sendDescription: "Tuliskan doa yang ingin dititipkan untuk dibacakan di Tanah Suci.",
    yourName: "Nama anda",
    senderPlaceholder: "Masukkan nama anda",
    sendTo: "Kirim kepada",
    chooseRecipient: "Pilih penerima",
    yourPrayer: "Doa anda",
    prayerPlaceholder: "Tuliskan doa anda di sini...",
    prayerNote: "Ambil masa anda. Tuliskan dengan ikhlas.",
    sendButton: "Hantar doa",
    sending: "Sedang menghantar doa...",
    sent: "Doa anda berjaya dihantar.",
    sendError: "Doa tidak berjaya dihantar. Sila cuba lagi.",
    statusEyebrow: "KEMAS KINI DOA",
    statusTitle: "Status doa",
    statusDescription: "Semak sama ada doa anda telah dibaca.",
    searchPlaceholder: "Cari nama pengirim atau penerima...",
    checkStatus: "Semak status",
    statusInstruction: "Tekan semak status untuk melihat perkembangan doa.",
    loadingStatus: "Sedang memuatkan status...",
    privacyNote: "Kandungan doa hanya boleh dibaca oleh penerima yang dituju.",
    backHome: "Kembali ke halaman utama",
    loginEyebrow: "RUANG PERIBADI ANDA",
    loginTitle: "Selamat kembali",
    loginDescription: "Log masuk untuk membaca doa yang dikirimkan khas buat anda.",
    loginAs: "Log masuk sebagai",
    chooseName: "Pilih nama anda",
    password: "Kata laluan",
    passwordPlaceholder: "Masukkan kata laluan",
    loginButton: "Log masuk",
    loginLoading: "Sedang log masuk...",
    loginError: "Nama atau kata laluan tidak betul. Sila cuba lagi.",
    accountError: "Akaun ini belum dipautkan kepada penerima.",
    personalSpace: "RUANG PERIBADI",
    logout: "Log keluar",
    prayerCollection: "KOLEKSI DOA ANDA",
    dashboardDescription: "Doa yang telah dikirimkan khas buat anda.",
    prayersReceived: "Doa diterima",
    yourCollection: "KOLEKSI ANDA",
    allPrayers: "Semua doa",
    all: "Semua",
    unread: "Belum dibaca",
    read: "Sudah dibaca",
    loading: "Memuatkan...",
    loadError: "Tidak dapat memuatkan doa. Sila refresh.",
    noPrayers: "Belum ada doa.",
    noUnread: "Semua doa telah dibaca.",
    noRead: "Belum ada doa yang dibaca.",
    newPrayers: "Doa yang diterima akan dipaparkan di sini.",
    back: "Kembali ke senarai doa",
    markRead: "Tandakan sudah dibaca",
    alreadyRead: "Sudah dibaca",
    saving: "Menyimpan...",
    tryAgain: "Cuba lagi",
    markedRead: "Doa ditandakan sebagai sudah dibaca.",
    updateError: "Tidak dapat mengemaskini status. Sila cuba lagi.",
    readStatus: "Sudah dibaca",
    unreadStatus: "Belum dibaca",
    for: "Untuk",
    readOn: "Dibaca pada",
    noResults: "Tiada nama yang sepadan dijumpai.",
    noPublicPrayers: "Belum ada doa untuk dipaparkan.",
    publicError: "Tidak dapat memuatkan status. Sila cuba lagi.",
    dateUnavailable: "Tarikh tidak tersedia",
    footerText: "Semoga setiap doa disampaikan dengan penuh keikhlasan.",
    fillFields: "Sila lengkapkan semua ruangan.",
    invalidLogin: "Email atau kata laluan tidak sah. Sila semak akaun dan kata laluan.",
    networkError: "Masalah sambungan. Sila periksa internet anda.",
    unexpectedError: "Berlaku ralat. Sila cuba lagi."
  },

  en: {
    mySpace: "My space",
    heroLabel: "A PRAYER, A JOURNEY OF FAITH",
    heroTitle: "Prayers",
    heroDescription: "Leave your prayers here. Insya-Allah, they will be carried to the Holy Land.",
    sendEyebrow: "YOUR MESSAGE",
    sendTitle: "Send a prayer",
    sendDescription: "Write a prayer to be brought and recited in the Holy Land.",
    yourName: "Your name",
    senderPlaceholder: "Enter your name",
    sendTo: "Send to",
    chooseRecipient: "Choose a recipient",
    yourPrayer: "Your prayer",
    prayerPlaceholder: "Write your prayer here...",
    prayerNote: "Take your time. Write from the heart.",
    sendButton: "Send prayer",
    sending: "Sending your prayer...",
    sent: "Your prayer has been sent.",
    sendError: "Couldn't send your prayer. Please try again.",
    statusEyebrow: "PRAYER UPDATES",
    statusTitle: "Prayer status",
    statusDescription: "Check whether your prayer has been read.",
    searchPlaceholder: "Search sender or recipient name...",
    checkStatus: "Check status",
    statusInstruction: "Select check status to see prayer updates.",
    loadingStatus: "Loading status...",
    privacyNote: "Prayer contents can only be read by the intended recipient.",
    backHome: "Back to home",
    loginEyebrow: "YOUR PERSONAL SPACE",
    loginTitle: "Welcome back",
    loginDescription: "Log in to read the prayers sent especially for you.",
    loginAs: "Login as",
    chooseName: "Choose your name",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    loginButton: "Login",
    loginLoading: "Logging in...",
    loginError: "Incorrect name or password. Please try again.",
    accountError: "This account is not linked to a recipient.",
    personalSpace: "PERSONAL SPACE",
    logout: "Log out",
    prayerCollection: "YOUR PRAYER COLLECTION",
    dashboardDescription: "Prayers sent especially for you.",
    prayersReceived: "Prayers received",
    yourCollection: "YOUR COLLECTION",
    allPrayers: "All prayers",
    all: "All",
    unread: "Unread",
    read: "Read",
    loading: "Loading...",
    loadError: "Couldn't load prayers. Please refresh.",
    noPrayers: "No prayers yet.",
    noUnread: "You're all caught up.",
    noRead: "No read prayers yet.",
    newPrayers: "New prayers will appear here.",
    back: "Back to prayers",
    markRead: "Mark as read",
    alreadyRead: "Already read",
    saving: "Saving...",
    tryAgain: "Try again",
    markedRead: "Prayer marked as read.",
    updateError: "Couldn't update status. Please try again.",
    readStatus: "Read",
    unreadStatus: "Unread",
    for: "For",
    readOn: "Read on",
    noResults: "No matching names found.",
    noPublicPrayers: "No prayers to show yet.",
    publicError: "Couldn't load status. Please try again.",
    dateUnavailable: "Date unavailable",
    footerText: "May every prayer be delivered with sincerity.",
    fillFields: "Please complete all fields.",
    invalidLogin: "Invalid email or password. Please check the account and password.",
    networkError: "Connection problem. Please check your internet.",
    unexpectedError: "Something went wrong. Please try again."
  }
};

function t(key) {
  return translations[currentLanguage][key] ??
    translations.ms[key] ??
    key;
}

/* APPLY LANGUAGE */

function applyLanguage(language) {
  if (!["ms", "en"].includes(language)) return;

  currentLanguage = language;

  localStorage.setItem("language", language);

  document.documentElement.lang = language;

  // Update all elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    const translation = t(key);

    if (key === "heroTitle") {
      element.innerHTML =
        language === "ms"
          ? 'Kiriman Doa<br><span>ke Tanah Suci.</span>'
          : 'Prayers<br><span>to the Holy Land.</span>';
    } else if (key === "sendTitle") {
      element.innerHTML =
        language === "ms"
          ? 'Kirimkan doa<span>.</span>'
          : 'Send a prayer<span>.</span>';
    } else if (key === "statusTitle") {
      element.innerHTML =
        language === "ms"
          ? 'Status doa<span>.</span>'
          : 'Prayer status<span>.</span>';
    } else if (key === "loginTitle") {
      element.innerHTML =
        language === "ms"
          ? 'Selamat kembali<span>.</span>'
          : 'Welcome back<span>.</span>';
    } else if (key === "allPrayers") {
      element.innerHTML =
        language === "ms"
          ? 'Semua doa<span>.</span>'
          : 'All prayers<span>.</span>';
    } else {
      element.textContent = translation;
    }
  });

  // Update placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    element.placeholder = t(key);
  });

  // Update language button appearance
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.language === language
    );
  });

  // Update recipient dropdown placeholders
  updateRecipientOptions();

  // Update dynamic dashboard content if logged in
  if (currentPrayers.length || $("dashboard-section").classList.contains("hidden") === false) {
    renderPrayerList();
  }

  // Update public status if already loaded
  if (publicStatusLoaded) {
    renderPublicStatus();
  }
}

/* LANGUAGE BUTTON EVENTS */

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    applyLanguage(button.dataset.language);
  });
});

/* THEME */

function applyTheme(theme) {
  if (!["light", "dark"].includes(theme)) return;

  document.body.dataset.theme = theme;

  localStorage.setItem("theme", theme);

  const icon = $("theme-icon");

  if (icon) {
    icon.textContent = theme === "dark" ? "☀" : "☾";
  }

  const themeButton = $("theme-toggle");

  if (themeButton) {
    themeButton.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }
}

applyTheme(localStorage.getItem("theme") || "light");

$("theme-toggle").addEventListener("click", () => {
  const nextTheme =
    document.body.dataset.theme === "dark" ? "light" : "dark";

  applyTheme(nextTheme);
});

/* NAVIGATION */

function showSection(id) {
  ["send-section", "login-section", "dashboard-section"].forEach(
    (sectionId) => {
      $(sectionId).classList.toggle(
        "hidden",
        sectionId !== id
      );
    }
  );

  $("site-header").classList.toggle(
    "hidden",
    id === "dashboard-section"
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

$("nav-login").addEventListener("click", () => {
  status("login-status", "");
  $("password").value = "";
  showSection("login-section");
});

$("back-to-form").addEventListener("click", () => {
  showSection("send-section");
});

/* STATUS MESSAGE */

function status(id, message, isError = false) {
  const element = $(id);

  if (!element) return;

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

  if (button) {
    button.disabled = busy;
  }
}

/* LOAD RECIPIENTS */

let recipientsCache = [];

async function loadRecipients() {
  const { data, error } = await supabase
    .from("recipients")
    .select("id, display_name")
    .order("id");

  if (error) {
    console.error("Load recipients:", error);

    status("send-status", t("unexpectedError"), true);
    return;
  }

  recipientsCache = data ?? [];

  updateRecipientOptions();
}

function updateRecipientOptions() {
  const sendSelect = $("recipient");
  const loginSelect = $("login-recipient");

  const previousSendValue = sendSelect.value;
  const previousLoginValue = loginSelect.value;

  sendSelect.replaceChildren(
    new Option(t("chooseRecipient"), "")
  );

  loginSelect.replaceChildren(
    new Option(t("chooseName"), "")
  );

  recipientsCache.forEach((recipient) => {
    sendSelect.add(
      new Option(recipient.display_name, String(recipient.id))
    );

    loginSelect.add(
      new Option(recipient.display_name, String(recipient.id))
    );
  });

  sendSelect.value = previousSendValue;
  loginSelect.value = previousLoginValue;
}

/* SEND PRAYER */

$("prayer-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;

  const senderName = $("sender").value.trim();
  const prayerText = $("prayer").value.trim();
  const recipientId = $("recipient").value;

  if (!senderName || !prayerText || !recipientId) {
    status("send-status", t("fillFields"), true);
    return;
  }

  setBusy(form, true);
  status("send-status", t("sending"));

  try {
    const { error } = await supabase
      .from("prayers")
      .insert({
        sender_name: senderName,
        prayer: prayerText,
        recipient_id: Number(recipientId)
      });

    if (error) throw error;

    form.reset();

    status("send-status", t("sent"));

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

/* LOGIN */

$("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;

  const recipientId = $("login-recipient").value;
  const password = $("password").value;

  if (!recipientId || !password) {
    status("login-status", t("fillFields"), true);
    return;
  }

  const email = recipientEmails[String(recipientId)];

  if (!email) {
    status("login-status", t("loginError"), true);
    return;
  }

  setBusy(form, true);
  status("login-status", t("loginLoading"));

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error("Supabase login error:", error);

      if (error.message === "Invalid login credentials") {
        throw new Error("INVALID_LOGIN");
      }

      if (
        error.message?.toLowerCase().includes("fetch") ||
        error.message?.toLowerCase().includes("network")
      ) {
        throw new Error("NETWORK_ERROR");
      }

      throw error;
    }

    if (!data.user) {
      throw new Error("NO_USER");
    }

    status("login-status", "");

    await renderDashboard();

  } catch (error) {
    console.error("Login failed:", error);

    if (error.message === "INVALID_LOGIN") {
      status("login-status", t("invalidLogin"), true);
    } else if (error.message === "NETWORK_ERROR") {
      status("login-status", t("networkError"), true);
    } else {
      status("login-status", t("unexpectedError"), true);
    }

  } finally {
    setBusy(form, false);
  }
});

/* LOGOUT */

$("logout-button").addEventListener("click", async () => {
  const button = $("logout-button");

  button.disabled = true;

  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    currentPrayers = [];
    currentFilter = "all";

    $("password").value = "";

    showSection("send-section");

  } catch (error) {
    console.error("Logout:", error);

    status("dashboard-status", t("unexpectedError"), true);

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
      button.setAttribute("aria-pressed", String(active));
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

  prayers.forEach((prayer) => {
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
  });
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

  const prayerContent = safeText(
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
      readButton.textContent = t("tryAgain");

      status(
        "dashboard-status",
        t("updateError"),
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

      openPrayer(saved);
    } else {
      renderPrayerList();
    }

    status("dashboard-status", t("markedRead"));
  });

  card.append(
    sender,
    date,
    readStatus,
    divider,
    prayerContent,
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

    status("login-status", t("accountError"), true);

    await supabase.auth.signOut();

    showSection("login-section");
    return;
  }

  $("welcome-title").textContent =
    currentLanguage === "ms"
      ? `Doa untuk ${account.recipients?.display_name ?? "anda"}.`
      : `Prayers for ${account.recipients?.display_name ?? "you"}.`;

  $("dashboard-subtitle").textContent = t("dashboardDescription");

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

    status("dashboard-status", t("loadError"), true);
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

  status("public-status-message", t("loadingStatus"));

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
  });
}

/* SEARCH PUBLIC STATUS */

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

  // No duplicate dashboard rendering on SIGNED_IN.
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      currentPrayers = [];
      currentFilter = "all";
      showSection("send-section");
    }
  });
}

init();
