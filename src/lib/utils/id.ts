import { nanoid, customAlphabet } from "nanoid"
import { getContext, setContext } from "svelte"

export const alphaid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")

export const htmlid = (size: number = 10) => alphaid(1) + nanoid(size - 1)

export const getIdContext = () => getContext<string | undefined>("Id")

export const createIdContext = (id: string) => setContext<string | undefined>("Id", id)
