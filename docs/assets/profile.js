function showErr(el, msg){
  el.textContent = msg || "";
  el.classList.toggle("show", !!msg);
}

async function loadProfile(){
  requireAuth();
  fillSidebarUser();
  setNowDot();
  setActiveNav();

  const res = await api.getProfile();
  $("#username").value = res.user?.username || "";
  $("#email").value = res.user?.email || "";
  $("#createdAt").textContent = res.user?.createdAt ? new Date(res.user.createdAt).toLocaleString() : "—";
}

async function saveProfile(){
  const username = trim($("#username").value);
  const email = trim($("#email").value);

  let ok = true;
  showErr($("#e_username"), "");
  showErr($("#e_email"), "");

  if(!username){ showErr($("#e_username"), "Username is required"); ok=false; }
  if(!email){ showErr($("#e_email"), "Email is required"); ok=false; }
  else if(!emailOk(email)){ showErr($("#e_email"), "Invalid email format"); ok=false; }

  if(!ok) return;

  const btn = $("#saveBtn");
  btn.disabled = true;
  btn.textContent = "Saving…";
  try{
    await api.updateProfile({ username, email });
    fillSidebarUser();
    toast("Profile updated", "good");
  }catch(err){
    toast(err.message || "Update failed", "bad");
  }finally{
    btn.disabled = false;
    btn.textContent = "Save changes";
  }
}