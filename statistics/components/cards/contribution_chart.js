import { fp } from "/modules/Delusoire/stdlib/deps.js";
import { S } from "/modules/Delusoire/stdlib/index.js";
const ContributionLine = (name, value, limit, total)=>{
    return /*#__PURE__*/ S.React.createElement("div", {
        className: "stats-genreRow"
    }, /*#__PURE__*/ S.React.createElement("div", {
        className: "stats-genreRowFill",
        style: {
            width: `calc(${value / limit * 100}% + ${(limit - value) / (limit - 1) * 100}px)`
        }
    }, /*#__PURE__*/ S.React.createElement("span", {
        className: "stats-genreText"
    }, name)), /*#__PURE__*/ S.React.createElement("span", {
        className: "stats-genreValue"
    }, `${Math.round(value / total * 100)}%`));
};
const ContributionChart = ({ contributions })=>{
    const genresTotal = Object.values(contributions).reduce(fp.add);
    const sortedTopGenres = Object.entries(contributions).sort((a, b)=>b[1] - a[1]).slice(0, 10);
    return /*#__PURE__*/ S.React.createElement("div", {
        className: "LunqxlFIupJw_Dkx6mNx stats-genreCard"
    }, sortedTopGenres.map(([genre, value])=>{
        return ContributionLine(genre, value, sortedTopGenres[0][1], genresTotal);
    }));
};
export default ContributionChart;
