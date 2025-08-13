export async function sendAppointmentEmail(data) {
  const res = await fetch("http://localhost:8000/send-confirmation/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  return json;
}
