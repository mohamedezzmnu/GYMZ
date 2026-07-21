const API = process.env.NEXT_PUBLIC_EXERCISEDB_API_URL;

export async function getExercises() {
  const res = await fetch(`${API}/exercises`);

  if (!res.ok) {
    throw new Error("Failed to fetch exercises");
  }

  return res.json();
}