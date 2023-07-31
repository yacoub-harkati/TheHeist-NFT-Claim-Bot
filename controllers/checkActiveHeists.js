import axios from "axios"
import { endpoints } from "./endpoints.js"
import config from "../config/index.js"
import { clearLastLine } from "../utils/index.js"
import fs from "fs"

const PERIOD_UNTIL_CLAIM = config.claimPeriod * 4

export default async function checkAndClaimActiveHeists(cookie) {
	console.log("♻️ Checking Active Heists...")
	const { data, statusText } = await axios(`${endpoints.activeHeists}`, {
		headers: { Cookie: cookie },
	})

	if (statusText !== "OK") {
		clearLastLine()
		return {
			claimedHeits: false,
			message: "❌ Failed to fetch active Heists!",
		}
	}
	const activeHeists = data.map((obj) => ({
		mint: obj.id,
		heistId: obj.activeHeist.id,
		totalAmountEmitted: obj.activeHeist.totalAmountEmitted,
		epochIndex: obj.activeHeist.epochIndex,
		locationId: obj.activeHeist.locationId,
	}))

	const availableClaims = {
		heistIds: activeHeists.map((obj) => {
			if (obj.epochIndex == PERIOD_UNTIL_CLAIM) {
				return obj.heistId
			}
		}),
	}

	let type = config.location === 7 ? "Robbery" : "Heist"

	if (availableClaims.heistIds.filter(Boolean).length) {
		const { statusText } = await axios.put(
			endpoints.claimActiveHeists(type),
			availableClaims,
			{
				headers: { Cookie: cookie },
			}
		)

		const isClaimed = statusText === "OK"

		if (isClaimed) {
			clearLastLine()
			fs.appendFileSync(
				"./logs.txt",
				`✅ Claimed ${
					availableClaims.heistIds.length
				} Heists!		${new Date().getUTCDate()}\n`
			)
			return {
				claimedHeits: true,
				message: `✅ Claimed ${availableClaims.heistIds.length} Heists!`,
			}
		}
	}
	clearLastLine()
	return {
		claimedHeits: false,
		message: "⚠️ No Heist is available for claim yet",
	}
}
