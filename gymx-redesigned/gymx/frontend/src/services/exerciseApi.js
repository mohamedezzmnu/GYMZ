const API = process.env.NEXT_PUBLIC_EXERCISE_API;

export async function getExercises() {
  const res = await fetch(`${API}/exercises`);

  if (!res.ok) {
    throw new Error("Failed to fetch exercises");
  }

  return res.json();
}