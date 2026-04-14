import fs from 'fs/promises'

export async function readJson<TData = unknown>(path: string) {
  const file = await fs.readFile(`${process.cwd()}${path}`, 'utf-8')
  const data: TData = JSON.parse(file)
  return { data }
}
