import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/*
  SETUP: Replace both values with your Supabase project's URL and publishable/anon key.
  Never put a Supabase secret/service_role key in this browser file.
*/
const SUPABASE_URL = "https://nxpfaispvioujkfhewas.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_N-P-wI7MaTwLUJRbzf_C7Q_Nea2I6QZ";

const configured = !SUPABASE_URL.includes("PASTE_") && !SUPABASE_PUBLISHABLE_KEY.includes("PASTE_");
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;

const $ = (id) => document.getElementById(id);
const sections = ["send-section", "login-section", "dashboard-section"];
function showSection(id) {
  sections.forEach((section) => $(section).classList.toggle("hidden", section !== id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function status(id, message, isError = false) {
  const node = $(id);
  node.textContent = message;
  node.classList.toggle("error", isError);
}
function setBusy(form, busy) {
  const button = form.querySelector('button[type="submit"]');
  button.disabled = busy;
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
  if (!supabase) {
    $("recipient").innerHTML = '<option value="">Setup Supabase dahulu</option>';
    status("send-status", "Masukkan URL dan publishable key Supabase dalam app.js dahulu.", true);
    return;
  }
  const { data, error } = await supabase.from("recipients").select("id,display_name").order("display_name");
  if (error) {
    status("send-status", "Tidak dapat memuatkan senarai penerima. Semak setup database dan polisi RLS.", true);
    console.error(error);
    return;
  }
  const select = $("recipient");
  select.replaceChildren(new Option("Pilih penerima", ""));
  for (const recipient of data ?? []) {
    select.add(new Option(recipient.display_name, recipient.id));
  }
}
$("prayer-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabase) return status("send-status", "Setup Supabase dahulu sebelum menghantar kiriman.", true);
  const form = event.currentTarget;
  const sender_name = $("sender").value.trim();
  const prayer = $("prayer").value.trim();
  const recipient_id = Number($("recipient").value);
  if (!sender_name || !prayer || !Number.isInteger(recipient_id)) {
    return status("send-status", "Sila lengkapkan semua ruangan.", true);
  }
  setBusy(form, true);
  status("send-status", "Sedang menghantar kiriman…");
  const { error } = await supabase.from("prayers").insert({ sender_name, prayer, recipient_id });
  setBusy(form, false);
  if (error) {
    console.error(error);
    return status("send-status", "Kiriman belum berjaya dihantar. Cuba lagi sebentar lagi.", true);
  }
  form.reset();
  status("send-status", "Alhamdulillah, kiriman doa berjaya dihantar. Terima kasih 🤍");
});

$("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabase) return status("login-status", "Setup Supabase dahulu sebelum log masuk.", true);
  const form = event.currentTarget;
  setBusy(form, true);
  status("login-status", "Sedang log masuk…");
  const { error } = await supabase.auth.signInWithPassword({
    email: $("email").value.trim(),
    password: $("password").value
  });
  setBusy(form, false);
  if (error) return status("login-status", "Log masuk gagal. Semak e-mel dan kata laluan.", true);
  status("login-status", "");
  await renderDashboard();
});

$("logout-button").addEventListener("click", async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
  showSection("send-section");
});

async function renderDashboard() {
  if (!supabase) return;
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
    status("login-status", "Akaun ini belum dipautkan kepada penerima. Minta pentadbir menyemak tetapan akaun.", true);
    showSection("login-section");
    return;
  }

  const recipientId = account.recipient_id;
  const displayName = account.recipients?.display_name ?? "penerima";
  $("welcome-title").textContent = `Assalamualaikum, ${displayName}`;
  $("dashboard-subtitle").textContent = "Ini ialah ruang peribadi kiriman doa untuk awak.";
  $("prayer-list").replaceChildren();
  status("dashboard-status", "Memuatkan kiriman doa…");
  showSection("dashboard-section");

  const { data: prayers, error } = await supabase
    .from("prayers")
    .select("id,sender_name,prayer,created_at")
    .eq("recipient_id", recipientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    $("prayer-count").textContent = "—";
    return status("dashboard-status", "Tidak dapat memuatkan kiriman. Semak polisi RLS database.", true);
  }

  $("prayer-count").textContent = String(prayers?.length ?? 0);
  status("dashboard-status", "");
  if (!prayers?.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.append(safeText("span", "", "✧"), safeText("strong", "", "Belum ada kiriman doa"), safeText("p", "", "Apabila seseorang menitipkan doa untuk awak, kiriman itu akan muncul di sini."));
    $("prayer-list").append(empty);
    return;
  }

  for (const prayer of prayers) {
    const card = document.createElement("article");
    card.className = "prayer-card";
    const meta = document.createElement("div");
    meta.className = "prayer-meta";
    meta.append(
      safeText("strong", "", prayer.sender_name),
      safeText("time", "", new Date(prayer.created_at).toLocaleString("ms-MY", { dateStyle: "medium", timeStyle: "short" }))
    );
    card.append(meta, safeText("p", "prayer-text", prayer.prayer));
    $("prayer-list").append(card);
  }
}

async function init() {
  if (!supabase) {
    $("recipient").replaceChildren(new Option("Setup Supabase dahulu", ""));
    status("send-status", "Website belum disambungkan ke Supabase. Ikut README untuk setup.", true);
    return;
  }
  await loadRecipients();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) await renderDashboard();
  else showSection("send-section");
  supabase.auth.onAuthStateChange((_event, sessionNow) => {
    if (sessionNow) renderDashboard();
  });
}
init();
