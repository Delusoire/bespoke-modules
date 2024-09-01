import { Platform } from "/modules/stdlib/src/expose/Platform.ts";

import { exports } from "/modules/stdlib/src/webpack/index.ts";

const AdManagers = Platform.getAdManagers();
const ProductStateAPI = Platform.getProductStateAPI();
const PrefsAPI = Platform.getSettingsAPI().quality.volumeLevel.prefsApi;

function getAdsCoreConnector() {
	const { adsCoreConnector, settingsClient, slotsClient } = exports.find((m) =>
		m.adsCoreConnector && m.settingsClient && m.slotsClient
	);
	return { adsCoreConnector, settingsClient, slotsClient };
}

const { adsCoreConnector, settingsClient, slotsClient } = getAdsCoreConnector();

await adsCoreConnector.increaseStreamTime(-100000000000);

export default async function () {
	overridePrefs();

	const prefsSubscription = PrefsAPI.sub({ key: "ui.hide_hpto" }, ({ entries }) => overridePrefs(entries));

	overrideProductState();

	const productStateSubscription = ProductStateAPI.productStateApi.subValues(
		{ keys: Object.keys(pairOverrides) },
		({ pairs }) => overrideProductState(pairs),
	);

	overrideConfig();

	const slotSubscriptions: Array<{ cancel: () => void }> = [];
	const { adSlots } = await slotsClient.getSlots();
	for (const { slotId } of adSlots) {
		overrideSlot({ slotId });
		slotSubscriptions.push(
			adsCoreConnector.subscribeToSlot(slotId, ({ adSlotEvent }) => overrideSlot(adSlotEvent)),
		);
	}

	const inStreamSubscription = adsCoreConnector.subscribeToInStreamAds(({ ad }) => {
		if (ad) {
			AdManagers.inStreamApi.disable();
		}
	});

	return () => {
		prefsSubscription.cancel();
		productStateSubscription.cancel();
		for (const slotSubscription of slotSubscriptions) {
			slotSubscription.cancel();
		}
		inStreamSubscription.cancel();
	};
}

/* */

async function overrideSlot({ slotId }: { slotId: string }) {
	adsCoreConnector.clearSlot(slotId);
	await Promise.all([
		settingsClient.updateSlotEnabled({ slotId, enabled: false }),
		settingsClient.updateDisplayTimeInterval({ slotId }),
		settingsClient.updateExpiryTimeInterval({ slotId, timeInterval: "1800000n" }),
		settingsClient.updateStreamTimeInterval({ slotId }),
	]);
}

/* */

// subscribeToAdsProductState (ads [product state])
//  -> ADS_ENABLED / ADS_DISABLED (disables: audio, billboard, inStreamApi, leaderboard, sponsoredPlaylist, and vto adManagers)
//  -> ads.root.adsEnabled

// subscribeToPremiumState (catalogue [product state])
//  -> ADS_PREMIUM
//  -> ads.root.isPremium

// subscribeToHpto (ui.hide_hpto [pref])
//  -> ADS_HPTO_HIDDEN
//  -> ads.root.isHptoHidden

// ADS_POST_HIDE_HPTO (triggered when hiding announcement for premium users as identified by ads.root.isPremium)
//  -> ui.hide_hpto = false

// type --renamed-to-(in-js)-> product (product [product state]), used directly by some react components

async function overridePrefs(entries?: { "ui.hide_hpto"?: { bool: boolean | undefined | null } }) {
	if (entries && ("ui.hide_hpto" in entries) && entries["ui.hide_hpto"]!.bool) {
		return;
	}

	await PrefsAPI.set({ entries: { "ui.hide_hpto": { bool: true } } });
}

/* */

const pairOverrides = { ads: "0", catalogue: "premium", product: "premium", type: "premium" };
type PairOverrides = typeof pairOverrides;

async function overrideProductState(pairs?: Partial<PairOverrides>) {
	const newPairs: Partial<PairOverrides> = {};
	if (pairs) {
		const test = (k: keyof PairOverrides) => k in pairs && pairs[k] !== pairOverrides[k];

		if (test("ads")) {
			newPairs.ads = pairOverrides.ads;
		}
		if (test("catalogue")) {
			newPairs.catalogue = pairOverrides.catalogue;
		}
		if (test("product") || test("type")) {
			newPairs.product = pairOverrides.product;
			newPairs.type = pairOverrides.type;
		}
	} else {
		Object.assign(newPairs, pairOverrides);
	}

	if (Object.keys(newPairs).length === 0) {
		return;
	}

	await ProductStateAPI.productStateApi.putOverridesValues({ pairs: newPairs });

	// AdManagers.audio.isNewAdsNpvEnabled = false;
	// AdManagers.vto.manager.isNewAdsNpvEnabled = false;
}

/* */

function overrideConfig() {
	const expFeatures = JSON.parse(localStorage.getItem("remote-config-overrides") ?? "{}");

	const overrides = {
		...expFeatures,
		enableEsperantoMigration: true,
		// disables the Upgrade button
		hideUpgradeCTA: true,
		// disables QuickSilver In App Messaging at the react component level
		enableInAppMessaging: false,
		// should theoretically disable QuickSilver In App Messaging at the api level as the dev endpoints shouldn't work?
		enableInAppMessagingDevEnvironment: true,
	};

	localStorage.setItem("remote-config-overrides", JSON.stringify(overrides));
}
