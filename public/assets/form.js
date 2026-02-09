function showErr(id, msg){
  const el = document.getElementById(id);
  if(!el) return;
  el.textContent = msg || "";
  el.classList.toggle("show", !!msg);
}

function qs(){
  const p = new URLSearchParams(location.search);
  return Object.fromEntries(p.entries());
}

async function initHabitForm(){
  requireAuth();
  fillSidebarUser();
  setNowDot();
  setActiveNav();

  const { id } = qs();
  if(id){
    $("#pageTitle").textContent = "Edit Habit";
    $("#submitBtn").textContent = "Save changes";
    const res = await api.getHabit(id);
    const h = res.habit;
    $("#title").value = h.title || "";
    $("#description").value = h.description || "";
    $("#area").value = h.area || "General";
    $("#timeOfDay").value = h.timeOfDay || timeOfDay();
    $("#targetPerDay").value = h.targetPerDay || 1;
    $("#icon").value = h.icon || "flame";
    $("#archived").checked = !!h.archived;
  } else {
    $("#pageTitle").textContent = "Create Habit";
    $("#submitBtn").textContent = "Create habit";
    $("#timeOfDay").value = timeOfDay();
  }
}

async function submitHabit(){
  const { id } = qs();

  const payload = {
    title: trim($("#title").value),
    description: trim($("#description").value),
    area: $("#area").value,
    timeOfDay: $("#timeOfDay").value,
    targetPerDay: Number($("#targetPerDay").value),
    icon: $("#icon").value,
    archived: $("#archived").checked,
  };

  let ok = true;
  showErr("e_title","");
  showErr("e_area","");
  showErr("e_tod","");
  showErr("e_target","");

  if(!payload.title){ showErr("e_title","Title is required"); ok=false; }
  if(!payload.area){ showErr("e_area","Area is required"); ok=false; }
  if(!payload.timeOfDay){ showErr("e_tod","Time of day is required"); ok=false; }
  if(!Number.isFinite(payload.targetPerDay) || payload.targetPerDay <= 0){
    showErr("e_target","Target per day must be > 0"); ok=false;
  }

  if(!ok) return;

  const btn = $("#submitBtn");
  btn.disabled = true;
  btn.textContent = id ? "Saving…" : "Creating…";

  try{
    if(id) await api.updateHabit(id, payload);
    else await api.createHabit(payload);

    toast(id ? "Habit updated" : "Habit created", "good");
    setTimeout(()=> location.href="habits.html", 400);
  }catch(err){
    toast(err.message || "Save failed", "bad");
  }finally{
    btn.disabled = false;
    btn.textContent = id ? "Save changes" : "Create habit";
  }
}