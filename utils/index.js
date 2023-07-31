import bs58 from "bs58"

export async function sleep(ms = 2500) {
	await new Promise((r) => setTimeout(r, ms))
}

export function decode(secret) {
	return bs58.decode(secret)
}

export const clearLastLine = () => {
	const ESC = "\x1b" // ASCII escape character
	const CSI = ESC + "[" // control sequence introducer
	process.stdout.write(CSI + "A") // moves cursor up one line
	process.stdout.write(CSI + "K") // clears from cursor to line end
}
