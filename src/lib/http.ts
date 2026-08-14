export function jsonOk(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function jsonError(error: string, status = 400) {
  return Response.json({ error }, { status });
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
