#!/usr/bin/env node

import auth from "./controllers/auth.js"
import { Keypair } from "@solana/web3.js"
import { decode, clearLastLine } from "./utils/index.js"
import dotenv from "dotenv"
import checkAndClaimDailyTicket from "./controllers/claimDailyTickets.js"
import checkAndClaimActiveHeists from "./controllers/checkActiveHeists.js"
import checkAndActivateRestingChimps from "./controllers/checkRestingChimps.js"
import { createSpinner } from "nanospinner"
import config from "./config/index.js"
import figlet from "figlet"

dotenv.config()

const TIMEOUT = config.recheckEvery * 60

async function main() {
	console.clear()
	//AUTHENTICATE WALLET
	//		GETTING THE MESSAGE TO SIGN WITH WALLET
	//		SENDING SIGNATURE AND SAVING THE JWT COOKIE FOR FUTURE API CALLS
	//		MANAGING JWT COOKIE
	const WALLET = Keypair.fromSecretKey(decode(process.env.WALLET))
	let cookie = null
	let cookieExpiry = 0
	let lastCheck = null
	let shouldClaimDailyTicket = true
	let { cookieValue, cookieObj } = await auth(WALLET)
	cookieExpiry = new Date(cookieObj[0].expires).valueOf()
	cookie = cookieValue

	header()
	const spiner = createSpinner()
	spiner.start({ text: "Starting HeistClaimBot..." })

	const timeIntervalId = setInterval(async () => {
		try {
			if (new Date().getUTCHours() === 0 && shouldClaimDailyTicket) {
				const { claimed } = await checkAndClaimDailyTicket(cookie)
				if (claimed) {
					shouldClaimDailyTicket = false
				}
			}

			if (new Date().getUTCHours() > 0) {
				shouldClaimDailyTicket = true
			}

			if (!new Date().getSeconds()) {
				header()

				// Manage Authentication
				if (cookieExpiry - new Date().valueOf() < 0) {
					cookie = await auth(WALLET).cookieValue
				} else {
					console.log(
						`✅ Already Logged in as ${WALLET.publicKey.toBase58()}`
					)
				}

				//FIRST THING AFTER AUTHENTICATION
				//		CHECK IF DAILY TICKETS ARE CLAIMED
				//		IF NOT CLAIM DAILY TICKET

				//GET ACTIVE HEIST
				//		IF THEY EXIST CHECK HEIST EPOCH AND CLAIM AFTER A 4HRS PERIOD
				const heistClaimData = await checkAndClaimActiveHeists(cookie)
				clearLastLine()
				console.log(`\n${heistClaimData.message}`)
				//GET RESTING CHIMPS
				//		IF THEY EXIST SEND THEM ALL ON MISSION
				const chimpsData = await checkAndActivateRestingChimps(cookie)
				clearLastLine()
				console.log(`\n${chimpsData?.message}`)

				lastCheck = new Date().toUTCString()
			}
			spiner.update({
				text: `Time until next check ${
					TIMEOUT - new Date().getSeconds()
				}s --> Last Check: ${lastCheck ?? "Not Checked Yet"}`,
			})
		} catch (error) {
			console.log(error)
		}
	}, 1000)
}

function header() {
	figlet(
		"The Heist Claim Bot",
		{
			font: "Small Slant",
			horizontalLayout: "default",
			verticalLayout: "default",
			whitespaceBreak: true,
		},
		function (err, data) {
			if (err) {
				console.log("Something went wrong...")
				console.dir(err)
				return
			}
			console.clear()
			console.log(data + "v1.0.0")
		}
	)
}

main()
	.then(() => {})
	.catch((err) => {
		console.log(err)
		process.exit(1)
	})
