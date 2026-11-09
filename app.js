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

let recipientCapacities = [];
let currentRecipientId = null;

let language = localStorage.getItem("kd-language") || "ms";
let theme = localStorage.getItem("kd-theme") || "light";

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
        heroDescription: "Kirimkan doa anda di sini. Insya-Allah, doa ini akan dibaca Tanah Suci.",

        sendEyebrow: "KIRIMAN ANDA",
        sendTitle: "Kirimkan doa<span>.</span>",
        sendDescription: "Tuliskan doa yang ingin dibacakan di Tanah Suci.",

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
        loginDescription: "Log masuk untuk membaca doa yang dikirimkan kepada anda.",
        loginAs: "Log masuk sebagai",
        password: "Kata laluan",
        loginButton: "Log masuk",

        personalSpace: "RUANG PERIBADI",
        logout: "Log keluar",

        prayerCollection: "KOLEKSI DOA ANDA",
        dashboardDescription: "Doa yang telah dikirimkan kepada anda.",
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

        hi: "Salam",

        capacityLabel: "KAPASITI KOLEKSI",
        collectionFull: "Koleksi penuh",
        remainingSlots: "Baki slot",
        slotsUsed: "slot digunakan",
        capacitySaving: "Sedang mengemas kini kapasiti...",
        capacitySaved: "Kapasiti berjaya dikemas kini.",
        capacityError: "Kapasiti tidak dapat dikemas kini.",
        capacityMinimum: "Kapasiti tidak boleh kurang daripada jumlah Doa yang diterima.",
        capacityFull: "Penerima ini telah mencapai kapasiti maksimum semasa.",
        recipientFull: "Koleksi penuh",
        recipientAvailable: "Masih menerima Doa",
        recipientLoading: "Memuatkan kapasiti...",
        noCapacityData: "Maklumat kapasiti tidak tersedia.",
        decreaseDisabled: "Tidak boleh mengurangkan kapasiti lagi.",

        successTitle: "Doa anda telah dihantar.",
        successDescription: "Alhamdulillah, doa anda telah diterima dengan penuh kasih.",
        successClosing: "Semoga Allah menerima doa anda dan mengurniakan yang terbaik. Amin.",
        successButton: "Selesai",

        capacityLoadError: "Maklumat kapasiti tidak dapat dimuatkan."
    },

    en: {
        mySpace: "My space",

        heroLabel: "A JOURNEY OF FAITH",
        heroTitle: "Dua' Requests<br><span>to Makkah.</span>",
        heroDescription: "Leave your Dua' here. InSya-Allah, it will be carried to the Haramain.",

        sendEyebrow: "YOUR MESSAGE",
        sendTitle: "Send a Dua'<span>.</span>",
        sendDescription: "Write a Dua' you would like to be carried and recited in the Haramain.",

        yourName: "Your name",
        sendTo: "Send to",
        yourPrayer: "Your Dua'",
        prayerNote: "Take your time. Write with sincerity.",
        sendButton: "Send Dua'",

        statusEyebrow: "DUA' UPDATES",
        statusTitle: "Dua' status<span>.</span>",
        statusDescription: "Check whether your Dua' has been read.",
        searchPlaceholder: "Search sender or recipient...",
        checkStatus: "Check status",
        statusHint: "Check the latest Dua' updates here.",
        privacyNote: "Dua' messages can only be read by their intended recipients.",

        backHome: "Back to home",

        loginEyebrow: "YOUR PERSONAL SPACE",
        loginTitle: "Welcome back<span>.</span>",
        loginDescription: "Log in to read the Dua' sent for you.",
        loginAs: "Log in as",
        password: "Password",
        loginButton: "Login",

        personalSpace: "YOUR PERSONAL SPACE",
        logout: "Log out",

        prayerCollection: "YOUR DUA' COLLECTION",
        dashboardDescription: "Dua' sent for you.",
        prayersReceived: "Dua' received",

        yourCollection: "YOUR COLLECTION",
        allPrayers: "All Dua'<span>.</span>",

        all: "All",
        unread: "Unread",
        read: "Read",

        footerText: "May every Dua' be carried with sincerity.",

        chooseName: "Choose a name",
        loadingNames: "Loading names...",
        chooseLogin: "Choose your name",

        enterName: "Enter your name",
        enterPassword: "Enter your password",
        writePrayer: "Write your Dua' here...",

        loading: "Loading...",
        loadNamesError: "Couldn't load names. Please refresh.",
        fillFields: "Please fill in every field.",

        sending: "Sending your Dua'...",
        sent: "Your Dua' has been sent.",
        sendError: "Couldn't send your Dua'. Please try again.",

        loggingIn: "Logging in...",
        loginError: "Incorrect name or password. Please try again.",
        accountNotLinked: "This account isn't linked to a recipient yet.",

        loadingPrayers: "Loading Dua'...",
        loadPrayersError: "Couldn't load Dua'. Please refresh.",

        caughtUp: "You're all caught up.",
        noRead: "No read Dua' yet.",
        noPrayers: "No Dua' yet.",
        newPrayers: "New Dua' will show up here.",

        markedRead: "Marked as read.",
        updateError: "Couldn't update status. Please check access policies.",

        saving: "Saving...",
        tryAgain: "Try again",
        alreadyRead: "Already read",
        markRead: "Mark as read",
        backPrayers: "Back to collection",

        dateUnavailable: "Date unavailable",
        readLabel: "Read",
        unreadLabel: "Unread",

        for: "For",
        readOn: "Read on",

        noMatch: "No matching names found.",
        noPublicPrayers: "No Dua' to show yet.",
        publicLoadError: "Couldn't load status. Please try again.",
        statusLoading: "Loading status...",

        themeDark: "Dark",
        themeLight: "Light",

        hi: "Hi",

        capacityLabel: "COLLECTION CAPACITY",
        collectionFull: "Collection full",
        remainingSlots: "Slots remaining",
        slotsUsed: "slots used",
        capacitySaving: "Updating capacity...",
        capacitySaved: "Capacity updated successfully.",
        capacityError: "Couldn't update capacity.",
        capacityMinimum: "Capacity cannot be lower than the number of Dua' received.",
        capacityFull: "This recipient has reached the current collection limit.",
        recipientFull: "Collection full",
        recipientAvailable: "Accepting Dua'",
        recipientLoading: "Loading capacity...",
        noCapacityData: "Capacity information is unavailable.",
        decreaseDisabled: "Capacity cannot be reduced further.",

        successTitle: "Your Dua' has been sent.",
        successDescription: "Alhamdulillah, your Dua' has been received with love and care.",
        successClosing: "May Allah accept your Dua' and grant what is best for you. Ameen.",
        successButton: "Done",

        capacityLoadError: "Couldn't load capacity information."
    }
};


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

    const htmlKeys = [
        "heroTitle",
        "sendTitle",
        "statusTitle",
        "loginTitle",
        "allPrayers"
    ];

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;

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

    $("theme-icon").textContent = theme === "light" ? "☾" : "☀";

    refreshRecipientOptions();
    refreshLoginOptions();
    renderRecipientCapacities();

    if (publicStatusLoaded) {
        renderPublicStatus();
    }

    if (currentPrayers.length) {
        renderPrayerList();
    }

    if (!$("dashboard-section").classList.contains("hidden")) {
        $("dashboard-subtitle").textContent = t("dashboardDescription");
        renderCapacity();
    }

    updateSuccessPopupLanguage();
}


function updateSuccessPopupLanguage() {
    $("success-title").textContent = t("successTitle");
    $("success-description").textContent = t("successDescription");
    $("success-closing").textContent = t("successClosing");
    $("success-close").textContent = t("successButton");
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
        const option = new Option(
            recipient.display_name,
            recipient.id
        );

        const capacity = recipientCapacities.find(
            item => String(item.recipient_id) === String(recipient.id)
        );

        if (capacity?.is_full) {
            option.disabled = true;
            option.textContent =
                `${recipient.display_name} (${t("recipientFull")})`;
        }

        select.add(option);
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

        await loadRecipientCapacities();

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
// 8. RECIPIENT CAPACITY
// ==========================================

async function loadRecipientCapacities() {
    try {
        const { data, error } = await supabase.rpc(
            "get_public_recipient_capacity"
        );

        if (error) throw error;

        recipientCapacities = data || [];

        refreshRecipientOptions();
        renderRecipientCapacities();

        return recipientCapacities;

    } catch (error) {
        console.error("Load recipient capacities:", error);

        recipientCapacities = [];

        $("recipient-capacity-list").replaceChildren();

        return [];
    }
}


function renderRecipientCapacities() {
    const container = $("recipient-capacity-list");

    if (!container) return;

    container.replaceChildren();

    if (!recipientCapacities.length) {
        return;
    }

    recipients.forEach(recipient => {
        const capacity = recipientCapacities.find(
            item => String(item.recipient_id) === String(recipient.id)
        );

        if (!capacity) return;

        const total = Number(capacity.total_count || 0);
        const limit = Number(capacity.prayer_limit || 50);
        const remaining = Math.max(0, limit - total);
        const percentage = limit > 0
            ? Math.min(100, (total / limit) * 100)
            : 100;

        const full = total >= limit;

        const card = document.createElement("div");

        card.className =
            "recipient-capacity-item" + (full ? " is-full" : "");

        const top = document.createElement("div");
        top.className = "recipient-capacity-top";

        top.append(
            safeText(
                "span",
                "recipient-capacity-name",
                recipient.display_name
            ),
            safeText(
                "span",
                "recipient-capacity-count",
                `${total} / ${limit}`
            )
        );

        const progress = document.createElement("div");
        progress.className = "recipient-capacity-progress";

        const fill = document.createElement("div");
        fill.className = "recipient-capacity-fill";
        fill.style.width = `${percentage}%`;

        progress.append(fill);

        const message = safeText(
            "span",
            "recipient-capacity-status",
            full
                ? t("recipientFull")
                : `${remaining} ${t("remainingSlots")}`
        );

        card.append(top, progress, message);
        container.append(card);
    });
}


function getCurrentCapacity() {
    return recipientCapacities.find(
        item => String(item.recipient_id) === String(currentRecipientId)
    );
}


function renderCapacity() {
    const capacity = getCurrentCapacity();

    if (!capacity) {
        $("capacity-count").textContent = "—";
        $("capacity-description").textContent = t("noCapacityData");
        $("capacity-progress-bar").style.width = "0%";

        $("increase-capacity").disabled = true;
        $("decrease-capacity").disabled = true;

        return;
    }

    const total = Number(capacity.total_count || 0);
    const limit = Number(capacity.prayer_limit || 50);
    const remaining = Math.max(0, limit - total);

    const percentage = limit > 0
        ? Math.min(100, (total / limit) * 100)
        : 100;

    const full = total >= limit;

    $("capacity-count").textContent = `${total} / ${limit}`;

    $("capacity-description").textContent =
        `${t("remainingSlots")}: ${remaining}`;

    $("capacity-progress-bar").style.width = `${percentage}%`;

    $("capacity-full-label").classList.toggle("hidden", !full);

    $("decrease-capacity").disabled = limit - 5 < total;
    $("increase-capacity").disabled = false;
}


async function changeCapacity(amount) {
    const capacity = getCurrentCapacity();

    if (!capacity) {
        status("capacity-status", t("capacityError"), true);
        return;
    }

    const currentLimit = Number(capacity.prayer_limit || 50);
    const total = Number(capacity.total_count || 0);
    const newLimit = currentLimit + amount;

    if (newLimit < total) {
        status("capacity-status", t("capacityMinimum"), true);
        return;
    }

    const increaseButton = $("increase-capacity");
    const decreaseButton = $("decrease-capacity");

    increaseButton.disabled = true;
    decreaseButton.disabled = true;

    status("capacity-status", t("capacitySaving"));

    try {
        const { error } = await supabase.rpc(
            "update_my_prayer_limit",
            {
                new_limit: newLimit
            }
        );

        if (error) throw error;

        await loadRecipientCapacities();

        renderCapacity();

        status("capacity-status", t("capacitySaved"));

    } catch (error) {
        console.error("Update capacity:", error);

        status(
            "capacity-status",
            error.message?.includes("CAPACITY_BELOW_RECEIVED")
                ? t("capacityMinimum")
                : t("capacityError"),
            true
        );

        renderCapacity();

    } finally {
        increaseButton.disabled = false;
        decreaseButton.disabled = false;
        renderCapacity();
    }
}


$("increase-capacity").addEventListener("click", () => {
    changeCapacity(5);
});


$("decrease-capacity").addEventListener("click", () => {
    changeCapacity(-5);
});


// ==========================================
// 9. NAVIGATION
// ==========================================

$("nav-login").addEventListener("click", () => {
    status("login-status", "");
    showSection("login-section");
});


$("back-to-form").addEventListener("click", () => {
    showSection("send-section");
});


// ==========================================
// 10. LANGUAGE BUTTONS
// ==========================================

document.querySelectorAll("[data-language]").forEach(button => {
    button.addEventListener("click", () => {
        language = button.dataset.language;

        localStorage.setItem("kd-language", language);

        applyLanguage();
    });
});


// ==========================================
// 11. THEME BUTTON
// ==========================================

$("theme-toggle").addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";

    applyTheme();
});


// ==========================================
// 12. SUCCESS POPUP
// ==========================================

function showSuccessPopup() {
    updateSuccessPopupLanguage();

    $("success-modal").classList.remove("hidden");

    $("success-close").focus();
}


function closeSuccessPopup() {
    $("success-modal").classList.add("hidden");
}


$("success-close").addEventListener("click", closeSuccessPopup);


$("success-modal").addEventListener("click", event => {
    if (event.target === $("success-modal")) {
        closeSuccessPopup();
    }
});


document.addEventListener("keydown", event => {
    if (
        event.key === "Escape" &&
        !$("success-modal").classList.contains("hidden")
    ) {
        closeSuccessPopup();
    }
});


// ==========================================
// 13. SEND PRAYER
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

    const selectedCapacity = recipientCapacities.find(
        item => String(item.recipient_id) === String(recipient_id)
    );

    if (selectedCapacity?.is_full) {
        status("send-status", t("capacityFull"), true);
        await loadRecipientCapacities();
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

        if (error) {
            if (
                error.message?.includes("PRAYER_COLLECTION_FULL") ||
                error.message?.includes("COLLECTION_FULL")
            ) {
                throw new Error("COLLECTION_FULL");
            }

            throw error;
        }

        form.reset();

        status("send-status", "");

        await loadRecipientCapacities();

        if (publicStatusLoaded) {
            await loadPublicStatus();
        }

        showSuccessPopup();

    } catch (error) {
        console.error("Send prayer:", error);

        if (error.message === "COLLECTION_FULL") {
            status("send-status", t("capacityFull"), true);
            await loadRecipientCapacities();
        } else {
            status("send-status", t("sendError"), true);
        }

    } finally {
        setBusy(form, false);
    }
});


// ==========================================
// 14. LOGIN
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
// 15. LOGOUT
// ==========================================

$("logout-button").addEventListener("click", async () => {
    const button = $("logout-button");

    button.disabled = true;

    try {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        currentPrayers = [];
        currentFilter = "all";
        currentRecipientId = null;

        showSection("send-section");

    } catch (error) {
        console.error("Logout:", error);
        status("dashboard-status", t("updateError"), true);

    } finally {
        button.disabled = false;
    }
});


// ==========================================
// 16. PRAYER FILTERS
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
// 17. PRAYER LIST
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
// 18. PRAYER DETAILS
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
// 19. DASHBOARD
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

    currentRecipientId = account.recipient_id;

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

    await loadRecipientCapacities();

    renderCapacity();

    status("dashboard-status", "");

    renderPrayerList();
}


// ==========================================
// 20. PUBLIC PRAYER STATUS
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
// 21. SEARCH PUBLIC STATUS
// ==========================================

$("public-status-search").addEventListener("input", () => {
    if (publicStatusLoaded) {
        renderPublicStatus();
    }
});


// ==========================================
// 22. INITIALIZE
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
            currentRecipientId = null;

            showSection("send-section");
        }
    });
}


init();
