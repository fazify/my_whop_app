import CryptoPanel from "@/app/CryptoPanel";

// Public experience page — no Whop login required.
export default function ExperiencePage() {
	return (
		<div className="flex flex-col items-center p-8 gap-6">
			<h1 className="text-7 font-bold">Live Crypto Markets</h1>
			<CryptoPanel />
		</div>
	);
}