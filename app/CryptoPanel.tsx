"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * CryptoPanel — a full rotating crypto price panel for a Whop app.
 * Pulls live prices from CoinGecko's free public API (no key needed).
 * Drop <CryptoPanel /> into any page.
 */

type Coin = { id: string; symbol: string; name: string };

const COINS: Coin[] = [
	{ id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
	{ id: "litecoin", symbol: "LTC", name: "Litecoin" },
	{ id: "ethereum", symbol: "ETH", name: "Ethereum" },
	{ id: "solana", symbol: "SOL", name: "Solana" },
	{ id: "injective-protocol", symbol: "INJ", name: "Injective" },
	{ id: "horizen", symbol: "ZEN", name: "Horizen" },
	{ id: "aave", symbol: "AAVE", name: "Aave" },
	{ id: "rave-name-service", symbol: "RAVE", name: "Rave" }, // verify id on coingecko.com
	{ id: "siren", symbol: "SIREN", name: "Siren" }, // verify id on coingecko.com
	{ id: "pepe", symbol: "PEPE", name: "Pepe" },
	{ id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
	{ id: "official-trump", symbol: "TRUMP", name: "Official Trump" },
	{ id: "ethereum-classic", symbol: "ETC", name: "Ethereum Classic" },
];

const ROTATE_MS = 4000;
const REFRESH_MS = 60000;

type PriceData = Record<string, { usd: number; usd_24h_change: number }>;

function formatPrice(value: number | undefined): string {
	if (value == null) return "—";
	if (value >= 1000)
		return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
	if (value >= 1) return value.toFixed(2);
	if (value >= 0.01) return value.toFixed(4);
	return value.toPrecision(4);
}

function formatChange(value: number | undefined): string {
	if (value == null) return "—";
	return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default function CryptoPanel() {
	const [prices, setPrices] = useState<PriceData>({});
	const [index, setIndex] = useState(0);
	const [status, setStatus] = useState<"loading" | "ready" | "error">(
		"loading",
	);
	const [fade, setFade] = useState(true);
	const rotateRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const fetchPrices = useCallback(async () => {
		// Calls our own server route, which proxies CoinGecko.
		try {
			const res = await fetch("/api/prices");
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data: PriceData = await res.json();
			setPrices(data);
			setStatus("ready");
		} catch (err) {
			console.error("Price fetch failed:", err);
			setStatus((prev) => (prev === "ready" ? "ready" : "error"));
		}
	}, []);

	useEffect(() => {
		fetchPrices();
		const refresh = setInterval(fetchPrices, REFRESH_MS);
		return () => clearInterval(refresh);
	}, [fetchPrices]);

	const liveCoins = COINS.filter((c) => prices[c.id]?.usd != null);

	useEffect(() => {
		if (liveCoins.length === 0) return;
		rotateRef.current = setInterval(() => {
			setFade(false);
			setTimeout(() => {
				setIndex((i) => (i + 1) % liveCoins.length);
				setFade(true);
			}, 350);
		}, ROTATE_MS);
		return () => {
			if (rotateRef.current) clearInterval(rotateRef.current);
		};
	}, [liveCoins.length]);

	useEffect(() => {
		if (index >= liveCoins.length && liveCoins.length > 0) setIndex(0);
	}, [liveCoins.length, index]);

	const coin = liveCoins[index];
	const data = coin ? prices[coin.id] : null;
	const change = data?.usd_24h_change;
	const up = change != null && change >= 0;

	const glowUp = "radial-gradient(circle, rgba(52,211,153,0.25), transparent 70%)";
	const glowDown = "radial-gradient(circle, rgba(248,113,113,0.22), transparent 70%)";

	return (
		<div
			style={{
				position: "relative",
				overflow: "hidden",
				width: "100%",
				maxWidth: 440,
				boxSizing: "border-box",
				padding: "22px 24px",
				borderRadius: 20,
				background: "linear-gradient(160deg, #0e1117 0%, #161b26 100%)",
				border: "1px solid rgba(255,255,255,0.07)",
				fontFamily:
					"'DM Sans', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
				color: "#e5e7eb",
				boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7)",
			}}
		>
			<style>{`@keyframes cpPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}`}</style>

			<div
				style={{
					position: "absolute",
					top: -120,
					right: -80,
					width: 320,
					height: 320,
					filter: "blur(20px)",
					pointerEvents: "none",
					transition: "background 600ms ease",
					background: up ? glowUp : glowDown,
				}}
			/>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 8,
					marginBottom: 18,
					position: "relative",
				}}
			>
				<div
					style={{
						width: 8,
						height: 8,
						borderRadius: "50%",
						background: "#34d399",
						animation: "cpPulse 1.6s ease-in-out infinite",
					}}
				/>
				<span
					style={{
						fontSize: 12,
						fontWeight: 700,
						letterSpacing: "0.16em",
						color: "#9ca3af",
					}}
				>
					LIVE MARKETS
				</span>
				<span
					style={{
						marginLeft: "auto",
						fontSize: 11,
						letterSpacing: "0.06em",
						color: "#6b7280",
					}}
				>
					{status === "loading" && "connecting…"}
					{status === "error" && "reconnecting…"}
					{status === "ready" && `${liveCoins.length} assets`}
				</span>
			</div>

			{coin && data ? (
				<div
					style={{
						position: "relative",
						minHeight: 150,
						transition: "opacity 350ms ease, transform 350ms ease",
						opacity: fade ? 1 : 0,
						transform: fade ? "translateY(0)" : "translateY(8px)",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 12,
							marginBottom: 14,
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: 46,
								height: 46,
								borderRadius: 12,
								background: "rgba(255,255,255,0.06)",
								border: "1px solid rgba(255,255,255,0.1)",
								fontSize: 13,
								fontWeight: 800,
							}}
						>
							{coin.symbol}
						</div>
						<div>
							<div style={{ fontSize: 17, fontWeight: 700, color: "#f9fafb" }}>
								{coin.name}
							</div>
							<div
								style={{
									fontSize: 12,
									color: "#6b7280",
									letterSpacing: "0.05em",
								}}
							>
								{coin.symbol} / USD
							</div>
						</div>
					</div>

					<div
						style={{
							display: "flex",
							alignItems: "baseline",
							gap: 4,
							margin: "6px 0 14px",
						}}
					>
						<span style={{ fontSize: 22, fontWeight: 600, color: "#9ca3af" }}>
							$
						</span>
						<span
							style={{
								fontSize: 44,
								fontWeight: 800,
								letterSpacing: "-0.02em",
								color: "#ffffff",
								fontVariantNumeric: "tabular-nums",
							}}
						>
							{formatPrice(data.usd)}
						</span>
					</div>

					<div
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: 6,
							padding: "6px 12px",
							borderRadius: 999,
							fontSize: 14,
							fontWeight: 700,
							border: "1px solid",
							color: up ? "#34d399" : "#f87171",
							background: up
								? "rgba(52,211,153,0.12)"
								: "rgba(248,113,113,0.12)",
							borderColor: up
								? "rgba(52,211,153,0.35)"
								: "rgba(248,113,113,0.35)",
						}}
					>
						<span style={{ fontSize: 10 }}>{up ? "▲" : "▼"}</span>
						{formatChange(change)}{" "}
						<span style={{ fontSize: 11, opacity: 0.7 }}>24h</span>
					</div>
				</div>
			) : (
				<div
					style={{
						display: "flex",
						alignItems: "center",
						minHeight: 150,
						fontSize: 14,
						color: "#6b7280",
					}}
				>
					{status === "error"
						? "Couldn't reach the market feed. Retrying…"
						: "Loading live prices…"}
				</div>
			)}

			<div style={{ display: "flex", gap: 5, marginTop: 18, flexWrap: "wrap" }}>
				{liveCoins.map((c, i) => (
					<div
						key={c.id}
						style={{
							height: 6,
							borderRadius: 999,
							transition: "width 300ms ease, background 300ms ease",
							width: i === index ? 22 : 6,
							background:
								i === index ? "#e5e7eb" : "rgba(255,255,255,0.22)",
						}}
					/>
				))}
			</div>
		</div>
	);
}