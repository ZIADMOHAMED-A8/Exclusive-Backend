import checkoutSessionModel from "../DB/models/checkoutSession.model.js";
import { releaseCheckoutSession } from "../modules/cart/cart.service.js";

const CHECKOUT_SESSION_JOB_INTERVAL_MS = 60 * 1000;
const CHECKOUT_SESSION_RELEASE_BATCH_SIZE = 50;
const CHECKOUT_SESSION_RELEASE_GRACE_MS = 2 * 60 * 1000;

let checkoutSessionJobTimer = null;

const releaseExpiredCheckoutSessions = async () => {
    const expiredSessions = await checkoutSessionModel
        .find({
            status: "reserved",
            expiresAt: { $lte: new Date(Date.now() - CHECKOUT_SESSION_RELEASE_GRACE_MS) }
        })
        .select("_id")
        .limit(CHECKOUT_SESSION_RELEASE_BATCH_SIZE);

    for (const checkoutSession of expiredSessions) {
        await releaseCheckoutSession({ _id: checkoutSession._id });
    }
};

const startCheckoutSessionJob = () => {
    if (checkoutSessionJobTimer) {
        return;
    }

    checkoutSessionJobTimer = setInterval(() => {
        releaseExpiredCheckoutSessions().catch((err) => {
            console.error("Checkout session release job failed", err.message);
        });
    }, CHECKOUT_SESSION_JOB_INTERVAL_MS);

    releaseExpiredCheckoutSessions().catch((err) => {
        console.error("Checkout session release job failed", err.message);
    });
};

export {
    releaseExpiredCheckoutSessions,
    startCheckoutSessionJob
};
