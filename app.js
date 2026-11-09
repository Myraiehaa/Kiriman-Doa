
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ==========================================
// 1. SUPABASE
// ==========================================

const SUPABASE_URL = "https://nxpfaispvioujkfhewas.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_N-P-wI7MaTwLUJRbzf_C7Q_Nea2I6QZ";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const $ = (id) => document.getElementById(id);

// ==========================================
// 2. VARIABLES
// ==========================================

let recipients = [];
let currentPrayers = [];
let currentFilter = "all";
let publicStatusCache = [];
let publicStatusLoaded = false;

let language = localStorage.getItem("kd-language") || "ms";
let theme = localStorage.getItem("kd-theme") || "light";

// Actual Supabase Auth emails

const recipientEmails = {
    "1": "aini_noni94@yahoo.com.my",
    "2": "noratikahasnun24@gmail.com",
    "3": "amierulamri99@gmail.com",
    "4": "amyratulj@gmail.com"
};

// ==========================================
// 3. TRANSLATIONS
// ==========================================

const translations = {

    ms: {
        mySpace: "Ruang saya",

        heroLabel: "KIRIMAN DOA, SEBUAH PERJALANAN IMAN",
        heroTitle: "Kiriman Doa<br><span>ke Tanah Suci.</span>",
        heroDescription: "Titipkan doa anda di sini. Insya-Allah, doa ini akan dibawa ke Tanah Suci.",

        sendEyebrow: "KIRIMAN ANDA",
        sendTitle: "Kirimkan doa<span>.</span>",
        sendDescription: "Tuliskan doa yang ingin dititipkan untuk dibacakan di Tanah Suci.",

        yourName: "Nama anda",
        sendTo: "Kirim kepada",
        yourPrayer: "Doa anda",
        prayerNote: "Ambil masa anda. Tuliskan dengan ikhlas.",
        sendButton: "Hantar doa",

        statusEyebrow: "KEMAS KINI DOA",
        statusTitle: "Status doa<span>.</span>",
        statusDescription: "Semak sama ada doa anda telah dibaca.",
        searchPlaceholder: "Cari nama pengirim atau penerima...",
        checkStatus: "Semak status",
        statusHint: "Tekan semak status untuk melihat perkembangan doa.",
        privacyNote: "Kandungan doa hanya boleh dibaca oleh penerima yang dituju.",

        backHome: "Kembali ke halaman utama",

        loginEyebrow: "RUANG PERIBADI ANDA",
        loginTitle: "Selamat kembali<span>.</span>",
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
        allPrayers: "Semua doa<span>.</span>",

        all: "Semua",
        unread: "Belum dibaca",
        read: "Sudah dibaca",

        footerText: "Semoga setiap doa disampaikan dengan penuh keikhlasan.",

        chooseName: "Pilih nama",
        loadingNames: "Sedang memuatkan nama...",
        chooseLogin: "Pilih nama anda",

        enterName: "Masukkan nama anda",
        enterPassword: "Masukkan kata laluan",
        writePrayer: "Tuliskan doa anda di sini...",

        loading: "Sedang memuatkan...",
        loadNamesError: "Nama tidak dapat dimuatkan. Sila refresh.",
        fillFields: "Sila lengkapkan semua ruangan.",

        sending: "Sedang menghantar doa...",
        sent: "Doa anda berjaya dihantar.",
        sendError: "Doa tidak dapat dihantar. Sila cuba lagi.",

        loggingIn: "Sedang log masuk...",
        loginError: "Nama atau kata laluan tidak tepat. Sila cuba lagi.",
        accountNotLinked: "Akaun ini belum dipautkan kepada penerima.",

        loadingPrayers: "Sedang memuatkan doa...",
        loadPrayersError: "Doa tidak dapat dimuatkan. Sila refresh.",

        caughtUp: "Tiada doa yang belum dibaca.",
        noRead: "Belum ada doa yang dibaca.",
        noPrayers: "Belum ada doa.",
        newPrayers: "Doa baharu akan dipaparkan di sini.",

        markedRead: "Ditandakan sebagai sudah dibaca.",
        updateError: "Status tidak dapat dikemas kini. Sila semak polisi akses.",

        saving: "Menyimpan...",
        tryAgain: "Cuba lagi",
        alreadyRead: "Sudah dibaca",
        markRead: "Tandakan sudah dibaca",
        backPrayers: "Kembali ke senarai doa",

        dateUnavailable: "Tarikh tidak tersedia",
        readLabel: "Sudah dibaca",
        unreadLabel: "Belum dibaca",

        for: "Untuk",
        readOn: "Dibaca pada",

        noMatch: "Tiada nama yang sepadan.",
        noPublicPrayers: "Belum ada doa untuk dipaparkan.",
        publicLoadError: "Status tidak dapat dimuatkan. Sila cuba lagi.",
        statusLoading: "Sedang memuatkan status...",

        themeDark: "Gelap",
        themeLight: "Cerah",

        hi: "Salam"
    },

    en: {
        mySpace: "My space",

        heroLabel: "A PRAYER, A JOURNEY OF FAITH",
        heroTitle: "Prayer Requests<br><span>to Makkah.</span>",
        heroDescription: "Leave your prayers here. InSya-ALlah, your prayers will be carried to Makkah.",

        sendEyebrow: "YOUR PRAYER",
        sendTitle: "Send a prayer<span>.</span>",
        sendDescription: "Write a prayer you would like to be carried and recited in Makkah.",

        yourName: "Your name",
        sendTo: "Send to",
        yourPrayer: "Your prayer",
        prayerNote: "Take your time. Write with sincerity.",
        sendButton: "Send prayer",

        statusEyebrow: "PRAYER UPDATES",
        statusTitle: "Prayer status<span>.</span>",
        statusDescription: "Check whether your prayer has been read.",
        searchPlaceholder: "Search sender or recipient...",
        checkStatus: "Check status",
        statusHint: "Check the latest prayer updates here.",
        privacyNote: "Prayer messages can only be read by their intended recipients.",

        backHome: "Back to home",

        loginEyebrow: "YOUR PERSONAL SPACE",
        loginTitle: "Welcome back<span>.</span>",
        loginDescription: "Log in to read the prayers sent especially for you.",
        loginAs: "Log in as",
        password: "Password",
        loginButton: "Login",

        personalSpace: "YOUR PERSONAL SPACE",
        logout: "Log out",

        prayerCollection: "YOUR PRAYER COLLECTION",
        dashboardDescription: "Prayers sent especially for you.",
        prayersReceived: "Prayers received",

        yourCollection: "YOUR COLLECTION",
        allPrayers: "All prayers<span>.</span>",

        all: "All",
        unread: "Unread",
        read: "Read",

        footerText: "May every prayer be carried with sincerity.",

        chooseName: "Choose a name",
        loadingNames: "Loading names...",
        chooseLogin: "Choose your name",

        enterName: "Enter your name",
        enterPassword: "Enter your password",
        writePrayer: "Write your prayer here...",

        loading: "Loading...",
        loadNamesError: "Couldn't load names. Please refresh.",
        fillFields: "Please fill in every field.",

        sending: "Sending your prayer...",
        sent: "Your prayer has been sent.",
        sendError: "Couldn't send your prayer. Please try again.",

        loggingIn: "Logging in...",
        loginError: "Incorrect name or password. Please try again.",
        accountNotLinked: "This account isn't linked to a recipient yet.",

        loadingPrayers: "Loading prayers...",
        loadPrayersError: "Couldn't load prayers. Please refresh.",

        caughtUp: "You're all caught up.",
        noRead: "No read prayers yet.",
        noPrayers: "No prayers yet.",
        newPrayers: "New prayers will show up here.",

        markedRead: "Marked as read.",
        updateError: "Couldn't update status. Please check access policies.",

        saving: "Saving...",
        tryAgain: "Try again",
        alreadyRead: "Already read",
        markRead: "Mark as read",
        backPrayers: "Back to prayers",

        dateUnavailable: "Date unavailable",
        readLabel: "Read",
        unreadLabel: "Unread",

        for: "For",
        readOn: "Read on",

        noMatch: "No matching names found.",
        noPublicPrayers: "No prayers to show yet.",
        publicLoadError: "Couldn't load status. Please try again.",
        statusLoading: "Loading status...",

        themeDark: "Dark",
        themeLight: "Light",

        hi: "Hi"
    }
};

ms: {
    statusInstruction: "Tekan semak status untuk melihat perkembangan doa."
},

en: {
    statusInstruction: "Press check status to view your prayer updates."
}

const t = (key) =>
    translations[language][key] ||
    translations.en[key] ||
    key;

// ==========================================
// 4. HELPER FUNCTIONS
// ==========================================

function status(id, message, isError = false) {
    const node = $(id);

    if (!node) return;

    node.textContent = message;
    node.classList.toggle("error", isError);
}

function safeText(tag, cls, value) {
    const node = document.createElement(tag);

    if (cls) node.className = cls;

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
        language === "ms" ? "ms-MY" : "en-MY",
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

function showSection(id) {
    [
        "send-section",
        "login-section",
        "dashboard-section"
    ].forEach(section => {
        $(section).classList.toggle("hidden", section !== id);
    });

    $("site-header").classList.toggle(
        "hidden",
        id === "dashboard-section"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ==========================================
// 5. LANGUAGE
// ==========================================

function applyLanguage() {
    document.documentElement.lang = language;

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;

        // These translation values contain intentional HTML
        const htmlKeys = [
            "heroTitle",
            "sendTitle",
            "statusTitle",
            "loginTitle",
            "allPrayers"
        ];

        if (htmlKeys.includes(key)) {
            element.innerHTML = t(key);
        } else {
            element.textContent = t(key);
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
        element.placeholder = t(element.dataset.i18nPlaceholder);
    });

    document.querySelectorAll("[data-language]").forEach(button => {
        const active = button.dataset.language === language;

        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });

    $("sender").placeholder = t("enterName");
    $("prayer").placeholder = t("writePrayer");
    $("password").placeholder = t("enterPassword");

    refreshRecipientOptions();
    refreshLoginOptions();

    $("theme-icon").textContent = theme === "light" ? "☾" : "☀";

    if (publicStatusLoaded) {
        renderPublicStatus();
    }

    if (currentPrayers.length) {
        renderPrayerList();
    }

    if (!$("dashboard-section").classList.contains("hidden")) {
        $("dashboard-subtitle").textContent = t("dashboardDescription");
    }
}

// ==========================================
// 6. THEME
// ==========================================

function applyTheme() {
    document.body.dataset.theme = theme;

    localStorage.setItem("kd-theme", theme);

    $("theme-icon").textContent =
        theme === "light" ? "☾" : "☀";
}

// ==========================================
// 7. RECIPIENT DROPDOWNS
// ==========================================

function refreshRecipientOptions() {
    const select = $("recipient");
    const oldValue = select.value;

    select.replaceChildren(
        new Option(t("chooseName"), "")
    );

    recipients.forEach(recipient => {
        select.add(
            new Option(recipient.display_name, recipient.id)
        );
    });

    if (recipients.some(r => String(r.id) === oldValue)) {
        select.value = oldValue;
    }
}

function refreshLoginOptions() {
    const select = $("login-recipient");
    const oldValue = select.value;

    select.replaceChildren(
        new Option(t("chooseLogin"), "")
    );

    recipients.forEach(recipient => {
        select.add(
            new Option(recipient.display_name, recipient.id)
        );
    });

    if (recipients.some(r => String(r.id) === oldValue)) {
        select.value = oldValue;
    }
}

async function loadRecipients() {
    const sendSelect = $("recipient");
    const loginSelect = $("login-recipient");

    sendSelect.replaceChildren(
        new Option(t("loadingNames"), "")
    );

    loginSelect.replaceChildren(
        new Option(t("loadingNames"), "")
    );

    try {
        const { data, error } = await supabase
            .from("recipients")
            .select("id, display_name")
            .order("id", { ascending: true });

        if (error) throw error;

        recipients = data || [];

        refreshRecipientOptions();
        refreshLoginOptions();

        console.log("Recipients loaded:", recipients);

        if (!recipients.length) {
            status(
                "login-status",
                "No recipients found in the database.",
                true
            );
        }

    } catch (error) {
        console.error("Load recipients:", error);

        sendSelect.replaceChildren(
            new Option("Unable to load names", "")
        );

        loginSelect.replaceChildren(
            new Option("Unable to load names", "")
        );

        status(
            "send-status",
            "Error loading recipients: " + error.message,
            true
        );

        status(
            "login-status",
            "Error loading recipients: " + error.message,
            true
        );
    }
}

// ==========================================
// 8. NAVIGATION
// ==========================================

$("nav-login").addEventListener("click", () => {
    status("login-status", "");
    showSection("login-section");
});

$("back-to-form").addEventListener("click", () => {
    showSection("send-section");
});

// ==========================================
// 9. LANGUAGE BUTTONS
// ==========================================

document.querySelectorAll("[data-language]").forEach(button => {
    button.addEventListener("click", () => {
        language = button.dataset.language;

        localStorage.setItem("kd-language", language);

        applyLanguage();
    });
});

// ==========================================
// 10. THEME BUTTON
// ==========================================

$("theme-toggle").addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";

    applyTheme();
});

// ==========================================
// 11. SEND PRAYER
// ==========================================

$("prayer-form").addEventListener("submit", async event => {
    event.preventDefault();

    const form = event.currentTarget;

    const sender_name = $("sender").value.trim();
    const prayer = $("prayer").value.trim();
    const recipient_id = $("recipient").value;

    if (!sender_name || !prayer || !recipient_id) {
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
                recipient_id
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

// ==========================================
// 12. LOGIN
// ==========================================

$("login-form").addEventListener("submit", async event => {
    event.preventDefault();

    const form = event.currentTarget;

    const recipientId = $("login-recipient").value;
    const password = $("password").value;

    if (!recipientId || !password) {
        status("login-status", t("fillFields"), true);
        return;
    }

    const email = recipientEmails[recipientId];

    if (!email) {
        status("login-status", t("loginError"), true);
        return;
    }

    setBusy(form, true);
    status("login-status", t("loggingIn"));

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
        status("login-status", t("loginError"), true);

    } finally {
        setBusy(form, false);
    }
});

// ==========================================
// 13. LOGOUT
// ==========================================

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
        status("dashboard-status", t("updateError"), true);

    } finally {
        button.disabled = false;
    }
});

// ==========================================
// 14. PRAYER FILTERS
// ==========================================

$("prayer-tabs").addEventListener("click", event => {
    const tab = event.target.closest("[data-filter]");

    if (!tab) return;

    currentFilter = tab.dataset.filter;

    document.querySelectorAll("[data-filter]").forEach(button => {
        const active = button === tab;

        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });

    renderPrayerList();
});

function getFilteredPrayers() {
    if (currentFilter === "unread") {
        return currentPrayers.filter(prayer => !prayer.is_read);
    }

    if (currentFilter === "read") {
        return currentPrayers.filter(prayer => prayer.is_read);
    }

    return currentPrayers;
}

// ==========================================
// 15. PRAYER LIST
// ==========================================

function renderPrayerList() {
    const list = $("prayer-list");

    list.replaceChildren();

    const prayers = getFilteredPrayers();

    if (!prayers.length) {
        const message =
            currentFilter === "unread"
                ? t("caughtUp")
                : currentFilter === "read"
                    ? t("noRead")
                    : t("noPrayers");

        const empty = document.createElement("div");
        empty.className = "empty-state";

        empty.append(
            safeText("strong", "", message),
            safeText("p", "", t("newPrayers"))
        );

        list.append(empty);
        return;
    }

    prayers.forEach(prayer => {
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
                    prayer.is_read
                        ? t("readLabel")
                        : t("unreadLabel")
                }`
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

// ==========================================
// 16. PRAYER DETAILS
// ==========================================

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
        prayer.is_read
            ? `${t("readLabel")}${
                prayer.read_at
                    ? ` · ${formatDate(prayer.read_at)}`
                    : ""
            }`
            : t("unreadLabel")
    );

    const divider = document.createElement("hr");

    const body = safeText(
        "p",
        "prayer-text",
        prayer.prayer
    );

    const button = document.createElement("button");

    button.type = "button";
    button.className = "primary-button";
    button.textContent = prayer.is_read
        ? t("alreadyRead")
        : t("markRead");

    button.disabled = Boolean(prayer.is_read);

    button.addEventListener("click", async () => {
        button.disabled = true;
        button.textContent = t("saving");

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

            button.disabled = false;
            button.textContent = t("tryAgain");

            status("dashboard-status", t("updateError"), true);
            return;
        }

        const saved = currentPrayers.find(
            item => String(item.id) === String(prayer.id)
        );

        if (saved) {
            saved.is_read = true;
            saved.read_at = data[0].read_at;
        }

        status("dashboard-status", t("markedRead"));

        if (saved) {
            openPrayer(saved);
        } else {
            renderPrayerList();
        }
    });

    card.append(
        sender,
        date,
        readStatus,
        divider,
        body,
        button
    );

    list.append(back, card);
}

// ==========================================
// 17. DASHBOARD
// ==========================================

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

        status("login-status", t("accountNotLinked"), true);

        showSection("login-section");
        return;
    }

    $("welcome-title").textContent =
        `${t("hi")}, ${account.recipients?.display_name ?? ""}`;

    $("dashboard-subtitle").textContent = t("dashboardDescription");

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

        status("dashboard-status", t("loadPrayersError"), true);
        return;
    }

    currentPrayers = data || [];
    currentFilter = "all";

    $("prayer-count").textContent = String(currentPrayers.length);

    document.querySelectorAll("[data-filter]").forEach(tab => {
        const active = tab.dataset.filter === "all";

        tab.classList.toggle("active", active);
        tab.setAttribute("aria-pressed", String(active));
    });

    status("dashboard-status", "");

    renderPrayerList();
}

// ==========================================
// 18. PUBLIC PRAYER STATUS
// ==========================================

$("load-public-status").addEventListener("click", loadPublicStatus);

async function loadPublicStatus() {
    const button = $("load-public-status");

    button.disabled = true;

    status("public-status-message", t("statusLoading"));

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
            t("publicLoadError"),
            true
        );

    } finally {
        button.disabled = false;
    }
}

function renderPublicStatus() {
    const list = $("public-status-list");

    const query = $("public-status-search")
        .value
        .trim()
        .toLocaleLowerCase(
            language === "ms" ? "ms-MY" : "en-MY"
        );

    list.replaceChildren();

    const results = publicStatusCache.filter(item => {
        const sender = (item.sender_name || "").toLocaleLowerCase();
        const recipient = (item.recipient_name || "").toLocaleLowerCase();

        return sender.includes(query) || recipient.includes(query);
    });

    if (!results.length) {
        status(
            "public-status-message",
            query ? t("noMatch") : t("noPublicPrayers")
        );

        return;
    }

    status("public-status-message", "");

    results.forEach(item => {
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
                    ? t("readLabel")
                    : t("unreadLabel")
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

// ==========================================
// 19. SEARCH PUBLIC STATUS
// ==========================================

$("public-status-search").addEventListener("input", () => {
    if (publicStatusLoaded) {
        renderPublicStatus();
    }
});

// ==========================================
// 20. INITIALIZE
// ==========================================

async function init() {
    applyTheme();
    applyLanguage();

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
        if (event === "SIGNED_OUT") {
            currentPrayers = [];
            showSection("send-section");
        }
    });
}

init();
