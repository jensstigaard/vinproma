import { VmixInput } from '@/types/vmix-input'

/**
 * Utility method: Duration nice
 *
 * Input is a number of a duration
 * Output will then be niceified duration
 * Examples:
 *    90    -> 1:30
 *    1000  -> 16:40
 *
 * @param {number} duration
 * @returns {string}
 */
export function durationNice(duration: number): string {
  const minutes = Math.floor(duration / 60)

  const sec = duration % 60
  const seconds = `${sec < 10 ? '0' : ''}${sec}`

  return `${minutes}:${seconds}`
}

export function completeString(input: VmixInput, delayCompensation: number): string {
  return ''
}
