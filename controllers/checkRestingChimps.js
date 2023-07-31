import axios from "axios"
import { endpoints } from "./endpoints.js"
import config from "../config/index.js"
import { clearLastLine } from "../utils/index.js"
import fs from "fs"
export default async function checkAndActivateRestingChimps(
	cookie,
	locationId = config.location
) {
	console.log("♻️ Checking available Chimps...")
	const { data, statusText: status } = await axios(`${endpoints.myRobbers}`, {
		headers: { Cookie: cookie },
	})
	if (status !== "OK") {
		clearLastLine()
		return {
			message: "❌ Failed to fetch available chimps!",
		}
	}

	let type = locationId == 7 ? "Robbery" : "Heist"

	let availableChimps = null

	availableChimps = data.filter((obj) => !obj.activeHeist)

	const condition = availableChimps.length > 0

	if (condition) {
		const { data } = await axios.post(
			`${endpoints.sendForMission(type)}`,
			{
				nftIds: availableChimps.map((obj) => obj.id),
				locationId,
			},
			{
				headers: { Cookie: cookie },
			}
		)
		clearLastLine()
		fs.appendFileSync(
			"./logs.txt",
			`✅ Successfully Sent ${
				data.length
			} Chimps for missions		${new Date().getUTCDate()}\n`
		)
		return {
			message: `✅ Successfully Sent ${data.length} Chimps for missions`,
		}
	}

	if (!availableChimps.length) {
		clearLastLine()
		return {
			message: "⚠️ No chimps are available to send for a heists\t\t",
		}
	}
}
