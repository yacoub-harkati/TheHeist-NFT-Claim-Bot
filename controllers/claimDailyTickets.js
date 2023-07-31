import axios from "axios"
import { endpoints } from "./endpoints.js"
import { createSpinner } from "nanospinner"

export default async function checkAndClaimDailyTicket(cookie) {
	const spinner = createSpinner()
	spinner.start({ text: "Checking Daily Ticket..." })

	const { data } = await axios(endpoints.dailyTicket, {
		headers: { Cookie: cookie },
	})
	if (!data.isTicketClaimable) {
		spinner.warn({ text: "Daily ticket(s) already claimed!" })
		return { claimed: true }
	}

	const { statusText } = await axios.post(
		endpoints.claimDailyTicket,
		{},
		{
			headers: { Cookie: cookie },
		}
	)

	if (statusText == "OK") {
		spinner.success({ text: "Could not claim daily tickets!" })
		const { statusText } = await axios(endpoints.ticketCount, {
			headers: { Cookie: cookie },
		})

		if (statusText === "OK") {
			spinner.success({ text: "Daily ticket(s) have been claimed!" })
			return { claimed: true }
		}
	} else {
		spinner.error({ text: "Could not claim daily tickets!" })
		return { claimed: false }
	}
}
