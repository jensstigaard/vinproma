//
export function durationNice(duration: number): string {
  const minutes = Math.floor(duration / 60)

  const sec = duration % 60
  const seconds = `${sec < 10 ? '0' : ''}${sec}`

  return `${minutes}:${seconds}`
}
