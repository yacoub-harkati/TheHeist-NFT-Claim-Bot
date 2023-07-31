import axios from "axios"
import { endpoints } from "./endpoints.js"
import { createSpinner } from "nanospinner"

export default async function widthraw(cookie, amount = 10) {
	const spiner = createSpinner()
	spiner.start({ text: `Attempting to widthraw ${amount} $NANA` })
	const { statusText, status } = await axios.put(
		`${endpoints.widthraw}`,
		{ amount },
		{
			headers: { Cookie: cookie },
		}
	)

	if (statusText === "OK" && status === 200) {
		spiner.success({ text: `Successfully widthrew ${amount} $NANA` })
		return
	} else {
		spiner.error({ text: `Could not widthrew $NANA` })
		return
	}
}
