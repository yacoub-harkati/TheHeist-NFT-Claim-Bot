export const endpoints = {
	auth: "https://api.theheist.game/auth/request-message/",
	messageLoging: "https://api.theheist.game/auth/message-login/",
	dailyTicket: "https://api.theheist.game/rewards-hub/daily-tickets",
	claimDailyTicket:
		"https://api.theheist.game/rewards-hub/claim-daily-tickets",
	activeHeists: "https://api.theheist.game/nft/robbers/list-active",
	claimActiveHeists(type) {
		return type === "Heist"
			? "https://api.theheist.game/heist/robber-claim"
			: "https://api.theheist.game/robbery/robber/claim"
	},
	myRobbers: "https://api.theheist.game/nft/my-robbers",
	sendForMission(type) {
		return type === "Robbery"
			? "https://api.theheist.game/robbery/robber"
			: "https://api.theheist.game/heist/send"
	},
	ticketCount: "https://api.theheist.game/rewards-hub/ticket-count",
	widthraw: "https://api.theheist.game/wallet/withdraw",
}
