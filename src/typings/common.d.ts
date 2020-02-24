/**
 * Represents an associative array of a same type.
 */
interface Dictionary<T> {
    [key: string]: T;
}

type Collection<T> = T[] | Dictionary<T>
