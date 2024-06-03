import { Status } from "/modules/Delusoire/statistics/components/status/Status.js";
import { React } from "/modules/official/stdlib/src/expose/React.js";
export const useStatus = ({ status, error, logger })=>{
    switch(status){
        case "pending":
            {
                return /*#__PURE__*/ React.createElement(Status, {
                    icon: "library",
                    heading: "Loading",
                    subheading: "This operation is taking longer than expected."
                });
            }
        case "error":
            {
                logger.error(error);
                return /*#__PURE__*/ React.createElement(Status, {
                    icon: "error",
                    heading: "Problem occured",
                    subheading: "Please make sure that all your settings are valid."
                });
            }
    }
};
