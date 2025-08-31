export async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) {
    throw new Error("No refresh token available");
  }

  const res = await fetch("http://trash2cashpersonal.onrender.com/api/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    throw new Error("Failed to refresh access token");
  }

  const { access } = await res.json();
  localStorage.setItem("access", access); // Update the access token in localStorage
  return access;
}
