import { Status } from "/modules/Delusoire.statistics/components/status/Status.tsx";
import { React } from "/modules/stdlib/src/expose/React.ts";

export type QueryStatus = "error" | "success" | "pending";

interface StatusProps {
	status: QueryStatus;
	error: Error;
	logger: Console;
}

export const useStatus = ({ status, error, logger }: StatusProps) => {
	switch (status) {
		case "pending": {
			return (
				<Status
					icon="library"
					heading="Loading"
					subheading="This operation is taking longer than expected."
				/>
			);
		}
		case "error": {
			logger.error(error);
			return (
				<Status
					icon="error"
					heading="Problem occured"
					subheading="Please make sure that all your settings are valid."
				/>
			);
		}
	}
};
