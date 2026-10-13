
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://nxpfaispvioujkfhewas.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_N-P-wI7MaTwLUJRbzf_C7Q_Nea2I6QZ";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (id) => document.getElementById(id);
const sections = ["send-section", "login-section", "dashboard-section"];

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
  form.querySelector('button[type="submit"]').disabled = busy;
}

function safeText(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = value ?? "";
  return node;
}

$("nav-login").addEventListener("click", () => {
  status("login-status", "");
  showSection("login-section");
});

$("back-to-form").addEventListener("click", () => showSection("send-section"));

async function loadRecipients() {
  const select = $("recipient");
  const { data, error } = await supabase
    .from("recipients")
    .select("id, display_name")
    .order("display_name");

  if (error) {
    status("send-status", "Tak dapat muatkan senarai penerima.", true);
    console.error(error);
    return;
  }

  select.replaceChildren(new Option("Pilih nama", ""));
  for (const recipient of data ?? []) {
    select.add(new Option(recipient.display_name, recipient.id));
  }
}

$("prayer-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const sender_name = $("sender").value.trim();
  const prayer = $("prayer").value.trim();
  const recipient_id = Number($("recipient").value);

  if (!sender_name || !prayer || !Number.isInteger(recipient_id) || recipient_id <= 0) {
    status("send-status", "Lengkapkan semua ruangan dulu ya.", true);
    return;
  }

  setBusy(form, true);
  status("send-status", "Menghantar doa…");

  const { error } = await supabase
    .from("prayers")
    .insert({ sender_name, prayer, recipient_id });

  setBusy(form, false);

  if (error) {
    console.error(error);
    status("send-status", "Doa tak berjaya dihantar. Cuba sekali lagi.", true);
    return;
  }

  form.reset();
  status("send-status", "Doa dah selamat dihantar 🤍");
});

$("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  setBusy(form, true);
  status("login-status", "Sedang log masuk…");

  const { error } = await supabase.auth.signInWithPassword({
    email: $("email").value.trim(),
    password: $("password").value
  });

  setBusy(form, false);

  if (error) {
    status("login-status", "Tak dapat log masuk. Semak e-mel dan kata laluan.", true);
    return;
  }

  status("login-status", "");
  await renderDashboard();
});

$("logout-button").addEventListener("click", async () => {
  await supabase.auth.signOut();
  showSection("send-section");
});

function openPrayer(prayer, displayName) {
  const list = $("prayer-list");
  list.replaceChildren();

  const back = document.createElement("button");
  back.type = "button";
  back.className = "text-button prayer-back";
  back.textContent = "← Kembali ke senarai";
  back.addEventListener("click", () => renderPrayerList(window.currentPrayers, displayName));

  const card = document.createElement("article");
  card.className = "prayer-card prayer-detail";

  const sender = safeText("h3", "detail-sender", prayer.sender_name);
  const date = safeText(
    "time",
    "detail-date",
    new Date(prayer.created_at).toLocaleDateString("ms-MY", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  );
  const text = safeText("p", "prayer-text", prayer.prayer);

  card.append(sender, date, document.createElement("hr"), text);
  list.append(back, card);
}

function renderPrayerList(prayers, displayName) {
  const list = $("prayer-list");
  list.replaceChildren();

  if (!prayers?.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.append(
      safeText("strong", "", "Belum ada kiriman doa"),
      safeText("p", "", "Bila ada orang kirim doa, nama mereka akan muncul di sini.")
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
      safeText("small", "sender-hint", "Ada doa yang dititipkan")
    );

    const arrow = safeText("span", "sender-arrow", "→");
    button.append(info, arrow);
    button.addEventListener("click", () => openPrayer(prayer, displayName));
    list.append(button);
  }
}

async function renderDashboard() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    showSection("login-section");
    return;
  }

  const { data: account, error: accountError } = await supabase
    .from("recipient_accounts")
    .select("recipient_id, recipients(display_name)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (accountError || !account) {
    status("login-status", "Akaun ini belum dipautkan kepada penerima.", true);
    showSection("login-section");
    return;
  }

  const recipientId = account.recipient_id;
  const displayName = account.recipients?.display_name ?? "Penerima";

  $("welcome-title").textContent = displayName;
  $("dashboard-subtitle").textContent = "Doa-doa yang orang kirim untuk dibacakan di Tanah Suci.";
  $("prayer-list").replaceChildren();
  status("dashboard-status", "Memuatkan kiriman…");
  showSection("dashboard-section");

  const { data: prayers, error } = await supabase
    .from("prayers")
    .select("id, sender_name, prayer, created_at")
    .eq("recipient_id", recipientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    $("prayer-count").textContent = "—";
    status("dashboard-status", "Tak dapat muatkan doa. Cuba refresh halaman.", true);
    return;
  }

  window.currentPrayers = prayers ?? [];
  $("prayer-count").textContent = String(window.currentPrayers.length);
  status("dashboard-status", "");
  renderPrayerList(window.currentPrayers, displayName);
}

async function init() {
  await loadRecipients();

  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await renderDashboard();
  } else {
    showSection("send-section");
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) renderDashboard();
  });
}

init();
