import { getNumberOfTrials } from "@/backend/functions/get-number-of-trials";
import { LOA1, LOA2, LOA3, LOA45, LOA6 } from "@/app/components/info";

export default async function TrialPage() {
    const numberOfTrials = await getNumberOfTrials();
    const currentLoa = numberOfTrials % 5;

    if (currentLoa === 0) {
        return <LOA1 />;
    } else if (currentLoa === 1) {
        return <LOA2 />;
    } else if (currentLoa === 2) {
        return <LOA3 />;
    } else if (currentLoa === 3) {
        return <LOA45 />;
    } else if (currentLoa === 4) {
        return <LOA6 />;
    }

}
