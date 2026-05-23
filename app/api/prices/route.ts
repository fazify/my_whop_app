import { NextResponse } from "next/server";

// Server-side proxy to CoinGecko. The browser calls /api/prices,
// this route fetches from CoinGecko and returns the data.
// Avoids ad-blockers / CORS issues that block direct browser calls.

const COIN_IDS = [
	"bitcoin",
	"litecoin",
	"ethereum",
	"solana",
	"injective-protocol",
	"horizen",
	"aave",
	"rave-name-service",
	"siren",
	"pepe",
	"dogecoin",
	"official-trump",
	"ethereum-classic",
];

export const revalidate = 60; // cache for 60 seconds

export async function GET() {
	const url = `https://api.coingecko.com/api/v3/simple/price?ids=${COIN_IDS.join(",")}&vs_currencies=usd&include_24hr_change=true`;
	try {
		const res = await fetch(url, { next: { revalidate: 60 } });
		if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
		const data = await res.json();
		return NextResponse.json(data);
	} catch (err) {
		console.error("Price proxy failed:", err);
		return NextResponse.json(
			{ error: "Failed to fetch prices" },
			{ status: 502 },
		);
	}
}