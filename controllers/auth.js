import axios from "axios"
import { endpoints } from "./endpoints.js"
import nacl from "tweetnacl"
import bs58 from "bs58"
import { createSpinner } from "nanospinner"
import setCookie from "set-cookie-parser"

export default async function auth(keypair) {
	const spinner = createSpinner()

	spinner.start({ text: `Authenticating as ${keypair.publicKey.toBase58()}` })
	const { data, statusText: status } = await axios(
		`${endpoints.auth}${keypair.publicKey.toBase58()}`
	)

	if (status === "OK" && data.message) {
		const messageBytes = Buffer.from(data.message, "utf8")
		const buffer = nacl.sign.detached(messageBytes, keypair.secretKey)
		const signature = bs58.encode(buffer)
		const res = await axios(
			`${
				endpoints.messageLoging
			}${keypair.publicKey.toBase58()}/${signature}`
		)
		const statusText = res.statusText
		if (statusText == "OK") {
			spinner.success({
				text: `Logged in as ${keypair.publicKey.toBase58()}`,
			})
			const cookie = setCookie(res)

			return {
				cookieValue: `accessToken=${cookie[0].value}`,
				cookieObj: cookie,
			}
		}
	} else {
		const cookie = await auth(keypair)
		return cookie
	}
}
