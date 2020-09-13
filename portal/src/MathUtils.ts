/**
 * Linear interpolation of a number in 0..maxVal between min..max
 *
 * @param min the min value that the val param can have
 * @param max the max value that the val param can have
 * @param val the current value, value between 0 and maxVal
 * @param maxVal the maximum value that val can have
 */
export function lerpMax(min: number, max: number, val: number, maxVal: number) {
    return lerp(min, max, val / maxVal);
}

/**
 * Linear interpolation of a number in 0..1 between min..max
 *
 * @param min the min value that the val param can have
 * @param max the max value that the val param can have
 * @param val the current value, value between 0 and 1
 */
export function lerp(min: number, max: number, val: number) {
    return min + (max - min) * val
}
