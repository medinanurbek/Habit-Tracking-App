function showErr(id, msg){
  const el = document.getElementById(id);
  if(!el) return;
  el.textContent = msg || "";
  el.classList.toggle("show", !!msg);
}

function bindAuthCommon(){
  const u = getUser();
  if(u && $("#sbName")) fillSidebarUser();
}

async function handleRegister(){
  const username = trim($("#username").value);
  const email = trim($("#email").value);
  const password = $("#password").value;

  let ok = true;
  showErr("e_username", "");
  showErr("e_email", "");
  showErr("e_password", "");

  if(!username){ showErr("e_username","Username is required"); ok=false; }
  if(!email){ showErr("e_email","Email is required"); ok=false; }
  else if(!emailOk(email)){ showErr("e_email","Invalid email format"); ok=false; }
  if(!password){ showErr("e_password","Password is required"); ok=false; }
  else if(password.length < 8){ showErr("e_password","Password must be at least 8 characters"); ok=false; }

  if(!ok) return;

  const btn = $("#submitBtn");
  btn.disabled = true;
  btn.textContent = "Creating…";

  try{
    await api.register({ username, email, password });
    toast("Account created!", "good");
    setTimeout(()=> location.href="habits.html", 400);
  }catch(err){
    toast(err.message || "Registration failed", "bad");
  }finally{
    btn.disabled = false;
    btn.textContent = "Register";
  }
}

async function handleLogin(){
  const email = trim($("#email").value);
  const password = $("#password").value;

  let ok = true;
  showErr("e_email","");
  showErr("e_password","");

  if(!email){ showErr("e_email","Email is required"); ok=false; }
  else if(!emailOk(email)){ showErr("e_email","Invalid email format"); ok=false; }
  if(!password){ showErr("e_password","Password is required"); ok=false; }

  if(!ok) return;

  const btn = $("#submitBtn");
  btn.disabled = true;
  btn.textContent = "Signing in…";

  try{
    await api.login({ email, password });
    toast("Welcome back!", "good");
    setTimeout(()=> location.href="habits.html", 400);
  }catch(err){
    toast(err.message || "Login failed", "bad");
  }finally{
    btn.disabled = false;
    btn.textContent = "Login";
  }
}